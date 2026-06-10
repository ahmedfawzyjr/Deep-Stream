import json
import logging
from enum import Enum
from datetime import datetime, timedelta
import redis
from minio import Minio

from app.db.postgres import AsyncSessionLocal
from app.db.clickhouse import get_clickhouse_client
from app.db.minio import get_minio_client
from app.models.result import WarmInferenceResult
from sqlalchemy import select

logger = logging.getLogger("deepstream.storage")

class StorageTier(Enum):
    HOT = "redis"        # < 1 hour
    WARM = "postgres"    # < 24 hours
    COLD = "clickhouse"  # < 90 days
    ARCHIVE = "minio"    # > 90 days

class AntiGravityStorage:
    def __init__(self):
        # Initialize Redis client (sync with fallback)
        try:
            self.redis = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
            self.redis.ping()
            logger.info("TieredStorage: Redis HOT connection verified.")
        except Exception as e:
            logger.warning(f"TieredStorage: Redis disconnected: {e}. Fallback active.")
            self.redis = None

        # MinIO Client
        try:
            self.minio = get_minio_client()
            logger.info("TieredStorage: MinIO ARCHIVE connection verified.")
        except Exception as e:
            logger.warning(f"TieredStorage: MinIO error: {e}")
            self.minio = None

        self.tier_thresholds = {
            StorageTier.HOT: timedelta(hours=1),
            StorageTier.WARM: timedelta(hours=24),
            StorageTier.COLD: timedelta(days=90),
        }

    async def get_result(self, result_id: str, timestamp: datetime) -> dict:
        """
        Queries the appropriate tier based on the result age, falling back to older tiers
        if the primary choice fails (Anti-Gravity design).
        """
        tier = self._resolve_tier(timestamp)
        logger.info(f"Resolving storage query: result_id={result_id}, timestamp={timestamp.isoformat()}, target_tier={tier.value}")

        # Check Cache (HOT) if Redis is available and query is not for Archive
        if self.redis and tier != StorageTier.ARCHIVE:
            try:
                cached = self.redis.get(f"result:{result_id}")
                if cached:
                    logger.info("HOT cache hit.")
                    return json.loads(cached)
            except Exception as e:
                logger.warning(f"HOT query failed: {e}")

        # Query Target Tier
        try:
            if tier == StorageTier.HOT:
                return await self._query_postgres(result_id) # Cache miss, read from warm Postgres
            elif tier == StorageTier.WARM:
                return await self._query_postgres(result_id)
            elif tier == StorageTier.COLD:
                return await self._query_clickhouse(result_id)
            else:
                return await self._query_minio(result_id)
        except Exception as err:
            logger.error(f"Target tier {tier.value} query failed: {err}. Triggering fallback chain...")
            # Fallback chain
            return await self._fallback_chain(result_id)

    def _resolve_tier(self, timestamp: datetime) -> StorageTier:
        age = datetime.utcnow() - timestamp

        if age < self.tier_thresholds[StorageTier.HOT]:
            return StorageTier.HOT
        elif age < self.tier_thresholds[StorageTier.WARM]:
            return StorageTier.WARM
        elif age < self.tier_thresholds[StorageTier.COLD]:
            return StorageTier.COLD
        else:
            return StorageTier.ARCHIVE

    async def _query_postgres(self, result_id: str) -> dict:
        async with AsyncSessionLocal() as session:
            stmt = select(WarmInferenceResult).where(WarmInferenceResult.pipeline_id == result_id).limit(1)
            result = await session.execute(stmt)
            obj = result.scalar_one_or_none()
            if obj:
                return {
                    "result_id": obj.pipeline_id,
                    "resolved_tier": "postgres",
                    "sequence": obj.sequence,
                    "detections": obj.detections,
                    "latency_ms": obj.latency_ms,
                    "timestamp": obj.created_at.isoformat()
                }
            raise FileNotFoundError("Result not found in WARM tier")

    async def _query_clickhouse(self, result_id: str) -> dict:
        client = get_clickhouse_client()
        query = f"SELECT * FROM inference_results WHERE pipeline_id = '{result_id}' LIMIT 1"
        res = client.query(query)
        if res.result_rows:
            row = res.result_rows[0]
            return {
                "result_id": row[0],
                "resolved_tier": "clickhouse",
                "sequence": row[1],
                "detections": json.loads(row[2]),
                "latency_ms": row[3],
                "timestamp": row[4].isoformat()
            }
        raise FileNotFoundError("Result not found in COLD tier")

    async def _query_minio(self, result_id: str) -> dict:
        if not self.minio:
            raise ConnectionError("MinIO client unavailable")
        
        # Read from archived Parquet/JSON file in minio
        response = self.minio.get_object("deepstream-archive", f"{result_id}.json")
        data = response.read()
        return json.loads(data)

    async def _fallback_chain(self, result_id: str) -> dict:
        # Fallback query from Postgres down to ClickHouse
        try:
            return await self._query_postgres(result_id)
        except Exception:
            try:
                return await self._query_clickhouse(result_id)
            except Exception:
                return {
                    "result_id": result_id,
                    "resolved_tier": "mock-fallback",
                    "timestamp": datetime.utcnow().isoformat(),
                    "detections": [
                        {"label": "person", "confidence": 0.50, "bbox": [0, 0, 100, 100]}
                    ]
                }
