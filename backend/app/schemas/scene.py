from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class SceneBase(BaseModel):
    name: str
    description: str

class SceneCreate(SceneBase):
    pass

class SceneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Scene(SceneBase):
    id: int
    nodeCount: int = Field(alias="node_count")
    createdAt: datetime = Field(alias="created_at")
    updatedAt: datetime = Field(alias="updated_at")

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
                "nodeCount": 0,
                "createdAt": "2024-03-07T09:24:04.412557",
                "updatedAt": "2024-03-07T09:24:04.412567"
            }
        }

class SceneInDB(Scene):
    pass

class SceneList(BaseModel):
    items: List[Scene]
    total: int 