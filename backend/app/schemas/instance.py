from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Dict
from .target import Target

class InstanceBase(BaseModel):
    name: str
    target_id: int
    ports: Optional[Dict[str, str]] = None  # 例如: {"80/tcp": "8080"}
    environment: Optional[Dict[str, str]] = None  # 例如: {"MYSQL_ROOT_PASSWORD": "123456"}

class InstanceCreate(InstanceBase):
    pass

class InstanceUpdate(BaseModel):
    name: Optional[str] = None
    status: Optional[str] = None

class Instance(InstanceBase):
    id: int
    container_id: Optional[str] = None
    status: str
    created_at: datetime
    created_by_id: int
    target: Target

    class Config:
        orm_mode = True 