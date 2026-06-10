from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.postgres import Base

class Pipeline(Base):
    __tablename__ = "pipelines"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    config = Column(JSON, nullable=False) # e.g. {"models": ["yolo", "face"]}
    status = Column(String, default="active") # "active", "paused", "stopped"
