from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from .image import Image
from .software import Software

class TargetBase(BaseModel):
    name: str
    description: Optional[str] = None
    base_image_id: int
    dockerfile: Optional[str] = None
    optimized_dockerfile: Optional[str] = None

class TargetCreate(TargetBase):
    software_ids: List[int]

class TargetUpdate(TargetBase):
    name: Optional[str] = None
    description: Optional[str] = None
    base_image_id: Optional[int] = None
    software_ids: Optional[List[int]] = None
    dockerfile: Optional[str] = None
    optimized_dockerfile: Optional[str] = None

class Target(TargetBase):
    id: int
    status: str
    created_at: datetime
    created_by_id: int
    base_image: Optional[Image] = None
    software_list: List[Software] = []

    class Config:
        from_attributes = True 