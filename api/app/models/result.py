from sqlalchemy import Column, String, Integer, BigInteger, JSON, DateTime, func
from app.db.postgres import Base

class WarmInferenceResult(Base):
    __tablename__ = "warm_inference_results"

    id = Column(Integer, primary_key=True, index=True)
    pipeline_id = Column(String, index=True, nullable=False)
    sequence = Column(BigInteger, nullable=False)
    detections = Column(JSON, nullable=False)
    latency_ms = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), index=True)
