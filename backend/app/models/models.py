from sqlalchemy import Column, Integer, String, DateTime, JSON
from sqlalchemy.sql import func
from .database import Base


class GeneratedName(Base):
    __tablename__ = "generated_names"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    gender = Column(String)
    meanings = Column(JSON)
    source = Column(String)
    explanation = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
