from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.crud.base import CRUDBase
from app.models.scene import Scene
from app.schemas.scene import SceneCreate, SceneUpdate

class CRUDScene(CRUDBase[Scene, SceneCreate, SceneUpdate]):
    def get_multi(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        keyword: Optional[str] = None
    ) -> Tuple[List[Scene], int]:
        query = db.query(self.model)
        
        if keyword:
            query = query.filter(
                or_(
                    self.model.name.ilike(f"%{keyword}%"),
                    self.model.description.ilike(f"%{keyword}%")
                )
            )
        
        total = query.count()
        scenes = query.order_by(self.model.created_at.desc()).offset(skip).limit(limit).all()
        
        return scenes, total

    def copy(self, db: Session, *, id: int) -> Optional[Scene]:
        db_obj = self.get(db, id=id)
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

scene = CRUDScene(Scene) 