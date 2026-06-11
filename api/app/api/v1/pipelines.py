from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import List, Dict, Any

from app.db.postgres import get_db_session
from app.models.pipeline import Pipeline

router = APIRouter(prefix="/pipelines", tags=["pipelines"])

class PipelineCreate(BaseModel):
    id: str
    name: str
    config: Dict[str, Any]

class PipelineResponse(BaseModel):
    id: str
    name: str
    config: Dict[str, Any]
    status: str

@router.post("/", response_model=PipelineResponse, status_code=status.HTTP_201_CREATED)
async def create_pipeline(pipeline_data: PipelineCreate, db: AsyncSession = Depends(get_db_session)):
    stmt = select(Pipeline).where(Pipeline.id == pipeline_data.id)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Pipeline ID already exists")

    new_pipeline = Pipeline(
        id=pipeline_data.id,
        name=pipeline_data.name,
        config=pipeline_data.config,
        owner_id=1,  # hardcoded user ID context fallback
    )
    db.add(new_pipeline)
    await db.commit()
    await db.refresh(new_pipeline)

    return new_pipeline

@router.get("/", response_model=List[PipelineResponse])
async def list_pipelines(db: AsyncSession = Depends(get_db_session)):
    stmt = select(Pipeline)
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{pipeline_id}", response_model=PipelineResponse)
async def get_pipeline(pipeline_id: str, db: AsyncSession = Depends(get_db_session)):
    stmt = select(Pipeline).where(Pipeline.id == pipeline_id)
    res = await db.execute(stmt)
    pipeline = res.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    return pipeline

@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_pipeline(pipeline_id: str, db: AsyncSession = Depends(get_db_session)):
    stmt = select(Pipeline).where(Pipeline.id == pipeline_id)
    res = await db.execute(stmt)
    pipeline = res.scalar_one_or_none()
    if not pipeline:
        raise HTTPException(status_code=404, detail="Pipeline not found")
    
    await db.delete(pipeline)
    await db.commit()
    return None
