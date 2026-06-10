import os
import sys

# Inject python paths for package resolution in Vercel
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.auth import router as auth_router
from app.api.v1.pipelines import router as pipelines_router
from app.api.v1.results import router as results_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.websocket import router as ws_router
from app.core.exceptions import DeepStreamException, deepstream_exception_handler, general_exception_handler
from app.db.postgres import engine, Base

# Set up logging format
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("deepstream.main")

app = FastAPI(
    title="DeepStream Results API",
    description="Real-time multi-modal AI inference results aggregator and streaming gateway.",
    version="1.0.0",
)

# CORS Policy configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register version 1 routers
app.include_router(auth_router, prefix="/v1")
app.include_router(pipelines_router, prefix="/v1")
app.include_router(results_router, prefix="/v1")
app.include_router(analytics_router, prefix="/v1")
app.include_router(ws_router, prefix="/v1")

# Register global exception handlers
app.add_exception_handler(DeepStreamException, deepstream_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

@app.on_event("startup")
async def startup_db_schema():
    logger.info("DeepStream API Starting. Verifying warm PostgreSQL database schema...")
    try:
        async with engine.begin() as conn:
            # Create tables locally if they do not exist
            await conn.run_sync(Base.metadata.create_all)
        logger.info("PostgreSQL database tables verified.")
    except Exception as e:
        logger.error(f"Failed to synchronize database tables: {e}. Running with lazy initialization.")

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "healthy", "service": "results-api"}
