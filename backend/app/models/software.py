from typing import List
from fastapi.encoders import jsonable_encoder
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship, Session
from sqlalchemy.sql import func
from datetime import datetime
from app.models.user import Base
from app.schemas.software import SoftwareCreate, SoftwareUpdate

class Software(Base):
    __tablename__ = "software"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    version = Column(String(50))
    description = Column(Text, nullable=True)
    architecture = Column(String(20), nullable=False)
    os_type = Column(String(50), nullable=False)
    install_command = Column(Text, nullable=False)
    start_command = Column(JSON, nullable=False)
    ports = Column(JSON, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # 关联关系
    owner = relationship("User", back_populates="software")

    def create_with_owner(
        self, db: Session, *, obj_in: SoftwareCreate, owner_id: int
    ) -> "Software":
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = Software(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List["Software"]:
        return (
            db.query(Software)
            .filter(Software.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

# 创建 CRUD 实例
crud = CRUDBase[Software, SoftwareCreate, SoftwareUpdate](Software) 