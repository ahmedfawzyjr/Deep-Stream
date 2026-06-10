from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query
from app.services.storage.tiered_storage import AntiGravityStorage

router = APIRouter(prefix="/results", tags=["results"])
storage = AntiGravityStorage()

@router.get("/pipelines/{pipeline_id}")
async def get_pipeline_results(
    pipeline_id: str,
    minutes_ago: int = Query(10, description="Query age threshold limit in minutes")
):
    timestamp = datetime.utcnow() - timedelta(minutes=minutes_ago)
    try:
        result = await storage.get_result(pipeline_id, timestamp)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch tiered storage result: {e}")
