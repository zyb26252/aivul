from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SceneBase(BaseModel):
    name: str
    description: str

class SceneCreate(SceneBase):
    topology: Optional[Dict[str, Any]] = None

class SceneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    topology: Optional[Dict[str, Any]] = None

class Scene(SceneBase):
    id: int
    node_count: int
    topology: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    created_by_id: int

    class Config:
        from_attributes = True
        populate_by_name = True
        alias_generator = lambda field_name: ''.join(
            '_' + c.lower() if c.isupper() else c
            for c in field_name
        ).lstrip('_')
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "测试场景",
                "description": "这是一个测试场景",
                "node_count": 0,
                "topology": {
                    "nodes": [],
                    "edges": [],
                    "groups": []
                },
                "created_at": "2024-03-07T09:24:04.412557",
                "updated_at": "2024-03-07T09:24:04.412567",
                "created_by_id": 1
            }
        }

class SceneInDB(Scene):
    pass

class SceneList(BaseModel):
    items: List[Scene]
    total: int 