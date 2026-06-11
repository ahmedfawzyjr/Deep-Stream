from datetime import datetime, timedelta
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.result import WarmInferenceResult

class EventCorrelator:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_results(
        self,
        pipeline_id: str,
        user_id: int,
        limit: int = 100,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        # In a real environment, query postgres warm database for recent results
        stmt = (
            select(WarmInferenceResult)
            .where(WarmInferenceResult.pipeline_id == pipeline_id)
            .order_by(WarmInferenceResult.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        
        result = await self.db.execute(stmt)
        db_results = result.scalars().all()

        output = []
        for r in db_results:
            output.append({
                "id": f"{r.pipeline_id}-{r.sequence}",
                "pipeline_id": r.pipeline_id,
                "sequence": r.sequence,
                "detections": r.detections,
                "latency_ms": r.latency_ms,
                "timestamp": r.created_at.isoformat()
            })
            
        return output

    def correlate_audio_video(
        self,
        video_detections: List[Dict[str, Any]],
        audio_transcripts: List[Dict[str, Any]],
        time_window_ms: int = 2000
    ) -> List[Dict[str, Any]]:
        """
        Correlates audio events (e.g. speech transcriptions) with video events (detections)
        occurring within a close temporal window.
        """
        correlated_events = []
        
        for v in video_detections:
            v_time = datetime.fromisoformat(v["timestamp"])
            related_audio = []
            
            for a in audio_transcripts:
                a_time = datetime.fromisoformat(a["timestamp"])
                diff = abs((v_time - a_time).total_seconds() * 1000.0)
                
                if diff <= time_window_ms:
                    related_audio.append(a)
            
            if related_audio:
                correlated_events.append({
                    "video_event": v,
                    "correlated_audio": related_audio,
                    "correlation_time_ms": v_time.isoformat()
                })
                
        return correlated_events
