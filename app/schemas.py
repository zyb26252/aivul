from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ImageBase(BaseModel):
    name: str
    registry_path: str
    architecture: str
    description: Optional[str] = ""

class ImageCreate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    created_at: datetime
    created_by_id: int

    class Config:
        orm_mode = True 