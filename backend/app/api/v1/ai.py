from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.image import Image as ImageModel
from app.models.software import Software as SoftwareModel
from app.services.ai_service import generate_description, optimize_dockerfile, check_software_compatibility
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateDescriptionRequest(BaseModel):
    image: Dict[str, Any]
    software_list: List[Dict[str, Any]]

class OptimizeDockerfileRequest(BaseModel):
    dockerfile: str

class CompatibilityCheckRequest(BaseModel):
    base_image: Dict[str, Any]
    software_list: List[Dict[str, Any]]

class GenerateResponse(BaseModel):
    result: str

@router.post("/generate_description", response_model=GenerateResponse)
async def generate_description_api(request: GenerateDescriptionRequest):
    """
    生成环境描述 API 端点
    """
    try:
        result = await generate_description(request.image, request.software_list)
        return {"result": result}
    except Exception as e:
        logger.error(f"Error in generate_description_api: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating description: {str(e)}"
        )

@router.post("/optimize_dockerfile", response_model=GenerateResponse)
async def optimize_dockerfile_api(request: OptimizeDockerfileRequest):
    """
    优化 Dockerfile API 端点
    """
    try:
        result = await optimize_dockerfile(request.dockerfile)
        return {"result": result}
    except Exception as e:
        logger.error(f"Error in optimize_dockerfile_api: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error optimizing Dockerfile: {str(e)}"
        )

@router.post("/check_compatibility", response_model=GenerateResponse)
async def check_compatibility_api(request: CompatibilityCheckRequest):
    """
    检查软件兼容性 API 端点
    """
    try:
        result = await check_software_compatibility(request.base_image, request.software_list)
        return {"result": result}
    except Exception as e:
        logger.error(f"Error in check_compatibility_api: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking compatibility: {str(e)}"
        ) 