from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.image import Image
from app.models.software import Software
from app.services.ai_service import generate_description, optimize_dockerfile, check_software_compatibility
import logging
import requests
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()

# 请求模型定义
class GenerateDescriptionRequest(BaseModel):
    image: Dict[str, Any]
    software_list: List[Dict[str, Any]]

class OptimizeDockerfileRequest(BaseModel):
    dockerfile: str

class CompatibilityCheckRequest(BaseModel):
    base_image_id: int
    software_ids: List[int]

class GenerateResponse(BaseModel):
    result: str

# API 端点
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
async def check_compatibility_api(
    *,
    db: Session = Depends(deps.get_db),
    request: CompatibilityCheckRequest
):
    """检查兼容性"""
    try:
        # 获取基础镜像信息
        base_image = db.query(Image).filter(Image.id == request.base_image_id).first()
        if not base_image:
            raise HTTPException(status_code=404, detail="Base image not found")
            
        # 获取软件列表信息
        software_list = db.query(Software).filter(Software.id.in_(request.software_ids)).all()
        if not software_list:
            raise HTTPException(status_code=404, detail="Software not found")
        
        # 转换为字典格式
        base_image_dict = {
            "name": base_image.name,
            "version": base_image.version,
            "architecture": base_image.architecture
        }
        
        software_list_dict = [{
            "name": sw.name,
            "version": sw.version,
            "architecture": sw.architecture
        } for sw in software_list]
        
        # 调用兼容性检查服务
        result = await check_software_compatibility(base_image_dict, software_list_dict)
        return {"result": result}
        
    except Exception as e:
        logger.error(f"Error in check_compatibility_api: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error checking compatibility: {str(e)}"
        ) 