from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ImageBase(BaseModel):
    name: str
    description: Optional[str] = None
    architecture: str
    registry_path: str

class ImageCreate(ImageBase):
    pass

class ImageUpdate(ImageBase):
    pass

class Image(ImageBase):
    id: int
    created_at: datetime
    created_by_id: int

    class Config:
        from_attributes = True 