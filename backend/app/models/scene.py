from datetime import datetime
from typing import List, Optional, Tuple
from sqlalchemy import Column, Integer, String, Text, DateTime, or_, ForeignKey
from sqlalchemy.orm import Session, relationship
from sqlalchemy.sql import func
from app.db.base_class import Base
from app.schemas.scene import SceneCreate, SceneUpdate

class Scene(Base):
    __tablename__ = "scenes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), index=True)
    description = Column(Text, nullable=True)
    node_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by_id = Column(Integer, ForeignKey("users.id"))
    
    created_by = relationship("User", back_populates="scenes", lazy="joined")

    @classmethod
    def get(cls, db: Session, id: int) -> Optional["Scene"]:
        return db.query(cls).filter(cls.id == id).first()

    @classmethod
    def get_multi(
        cls,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        keyword: Optional[str] = None
    ) -> Tuple[List["Scene"], int]:
        query = db.query(cls)
        
        if keyword:
            query = query.filter(
                or_(
                    cls.name.ilike(f"%{keyword}%"),
                    cls.description.ilike(f"%{keyword}%")
                )
            )
        
        total = query.count()
        scenes = query.order_by(cls.created_at.desc()).offset(skip).limit(limit).all()
        
        return scenes, total

    @classmethod
    def create(cls, db: Session, *, name: str, description: str, created_by_id: int) -> "Scene":
        db_obj = cls(
            name=name,
            description=description,
            created_by_id=created_by_id
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @classmethod
    def update(
        cls,
        db: Session,
        *,
        db_obj: "Scene",
        name: Optional[str] = None,
        description: Optional[str] = None
    ) -> "Scene":
        if name is not None:
            db_obj.name = name
        if description is not None:
            db_obj.description = description
        
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

    def copy(self, db: Session, *, id: int) -> Optional["Scene"]:
        db_obj = db.query(Scene).filter(Scene.id == id).first()
        if not db_obj:
            return None
        
        obj_data = {
            "name": f"{db_obj.name} (复制)",
            "description": db_obj.description,
            "node_count": db_obj.node_count
        }
        
        db_obj = Scene(**obj_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

# 创建 CRUD 实例
crud = CRUDBase[Scene, SceneCreate, SceneUpdate](Scene) 