import asyncio
import logging
import redis
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter(prefix="/live", tags=["live"])
logger = logging.getLogger("deepstream.websocket")

@router.websocket("/{pipeline_id}")
async def websocket_endpoint(websocket: WebSocket, pipeline_id: str):
    await websocket.accept()
    logger.info(f"WebSocket client connected to live pipeline channel: {pipeline_id}")

    # Connect to Redis sync client with pub/sub context
    try:
        r = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
        pubsub = r.pubsub()
        pubsub.subscribe(f"pipeline:{pipeline_id}:results")
        logger.info(f"Subscribed to Redis channel: pipeline:{pipeline_id}:results")
    except Exception as e:
        logger.warning(f"Redis pub/sub connection failed: {e}. Falling back to mock live events.")
        pubsub = None

    try:
        if pubsub:
            while True:
                # Poll Redis pub/sub for new messages (non-blocking)
                message = pubsub.get_message(ignore_subscribe_messages=True, timeout=0.1)
                if message and message["type"] == "message":
                    payload = message["data"]
                    await websocket.send_text(payload)
                await asyncio.sleep(0.01) # Yield execution thread
        else:
            # Mock loop if Redis is not running
            seq = 0
            while True:
                seq += 1
                mock_payload = {
                    "pipeline_id": pipeline_id,
                    "sequence": seq,
                    "timestamp": int(asyncio.get_event_loop().time() * 1000),
                    "detections": [
                        {"label": "person", "confidence": 0.95, "bbox": [120.0, 80.0, 150.0, 150.0]}
                    ],
                    "latency_ms": 42
                }
                import json
                await websocket.send_text(json.dumps(mock_payload))
                await asyncio.sleep(1.0)
    except WebSocketDisconnect:
        logger.info(f"WebSocket client disconnected from pipeline channel: {pipeline_id}")
    finally:
        if pubsub:
            pubsub.unsubscribe(f"pipeline:{pipeline_id}:results")
            pubsub.close()
