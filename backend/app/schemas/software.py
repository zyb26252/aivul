from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class SoftwareBase(BaseModel):
    name: str
    version: str
    description: Optional[str] = None
    architecture: str
    os_type: str
    install_command: str
    start_command: List[str]
    ports: List[int]

class SoftwareCreate(SoftwareBase):
    pass

class SoftwareUpdate(SoftwareBase):
    pass

class Software(SoftwareBase):
    id: int
    created_at: datetime
    created_by_id: int

    class Config:
        from_attributes = True 