from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.ai_service import generate_description

router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    description: str

@router.post("/generate", response_model=GenerateResponse)
async def generate_description_api(request: GenerateRequest):
    """
    生成描述 API 端点
    """
    try:
        description = await generate_description(request.prompt)
        if not description:
            description = "抱歉，生成描述失败。请稍后重试。"
        return {"description": description}
    except Exception as e:
        print(f"Error in generate_description_api: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating description: {str(e)}"
        ) 