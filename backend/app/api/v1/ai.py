from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import generate_description

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    description: str

@router.post("/generate", response_model=GenerateResponse)
def generate_description_api(request: GenerateRequest):
    """
    生成描述 API 端点
    """
    try:
        description = generate_description(request.prompt)
        return GenerateResponse(description=description)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating description: {str(e)}"
        ) 