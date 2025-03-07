from pydantic import BaseModel
from typing import List

class CompatibilityCheckRequest(BaseModel):
    base_image_id: int
    software_ids: List[int]

class GenerateResponse(BaseModel):
    result: str 