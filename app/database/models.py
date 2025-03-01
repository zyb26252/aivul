from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.database.session import Base

class Image(Base):
    __tablename__ = "images"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    registry_path = Column(String)
    architecture = Column(String)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id")) 