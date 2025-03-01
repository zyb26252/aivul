from typing import List
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from app.crud.base import CRUDBase
from app.models.software import Software
from app.schemas.software import SoftwareCreate, SoftwareUpdate

class CRUDSoftware(CRUDBase[Software, SoftwareCreate, SoftwareUpdate]):
    def create_with_owner(
        self, db: Session, *, obj_in: SoftwareCreate, owner_id: int
    ) -> Software:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = Software(**obj_in_data, owner_id=owner_id)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_multi_by_owner(
        self, db: Session, *, owner_id: int, skip: int = 0, limit: int = 100
    ) -> List[Software]:
        return (
            db.query(self.model)
            .filter(Software.owner_id == owner_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

crud_software = CRUDSoftware(Software) 