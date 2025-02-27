from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .image import Image
from .software import Software

class TargetBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_image_id: int

class TargetCreate(TargetBase):
    software_ids: List[int]

class TargetUpdate(TargetBase):
    software_ids: Optional[List[int]] = None

class Target(TargetBase):
    id: int
    status: str
    created_at: datetime
    created_by_id: int
    dockerfile: Optional[str] = None
    base_image: Image
    software_list: List[Software]

    class Config:
        orm_mode = True 