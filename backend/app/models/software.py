from typing import List, Optional
from fastapi.encoders import jsonable_encoder
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import Session, relationship
from sqlalchemy.sql import func
from app.models.base import Base
from app.schemas.software import SoftwareCreate, SoftwareUpdate

class Software(Base):
    __tablename__ = "softwares"

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
    owner = relationship("User", back_populates="softwares")

    @classmethod
    def get(cls, db: Session, id: int) -> Optional["Software"]:
        return db.query(cls).filter(cls.id == id).first()

    @classmethod
    def get_multi(
        cls,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 100
    ) -> List["Software"]:
        return db.query(cls).offset(skip).limit(limit).all()

    @classmethod
    def create(cls, db: Session, *, obj_in: SoftwareCreate) -> "Software":
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = cls(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @classmethod
    def create_with_owner(
        cls, db: Session, *, obj_in: SoftwareCreate, owner_id: int
    ) -> "Software":
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = cls(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @classmethod
    def get_multi_by_owner(
        cls,
        db: Session,
        *,
        owner_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List["Software"]:
        return (
            db.query(cls)
            .filter(cls.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @classmethod
    def update(
        cls,
        db: Session,
        *,
        db_obj: "Software",
        obj_in: SoftwareUpdate
    ) -> "Software":
        update_data = obj_in.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_obj, field, value)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @classmethod
    def remove(cls, db: Session, *, id: int) -> bool:
        obj = db.query(cls).get(id)
        if not obj:
            return False
        db.delete(obj)
        db.commit()
        return True 