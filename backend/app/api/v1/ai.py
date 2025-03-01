from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.image import Image as ImageModel
from app.models.software import Software as SoftwareModel
from app.services.ai_service import generate_description, check_software_compatibility
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class GenerateRequest(BaseModel):
    prompt: str

class GenerateResponse(BaseModel):
    description: str

class CompatibilityCheckRequest(BaseModel):
    base_image_id: int
    software_ids: List[int]

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

@router.post("/check-compatibility", response_model=dict)
async def check_compatibility(
    *,
    db: Session = Depends(deps.get_db),
    request: CompatibilityCheckRequest,
    current_user: User = Depends(deps.get_current_user),
):
    """
    检查软件兼容性 API 端点
    """
    try:
        # 获取基础镜像信息
        base_image = db.query(ImageModel).filter(ImageModel.id == request.base_image_id).first()
        if not base_image:
            raise HTTPException(status_code=404, detail="Base image not found")
            
        # 获取软件列表信息
        software_list = []
        for software_id in request.software_ids:
            software = db.query(SoftwareModel).filter(SoftwareModel.id == software_id).first()
            if not software:
                raise HTTPException(status_code=404, detail=f"Software with id {software_id} not found")
            software_list.append(software)
            
        # 准备数据
        base_image_data = {
            "name": base_image.name,
            "version": base_image.version,
            "architecture": base_image.architecture
        }
        
        software_list_data = [{
            "name": s.name,
            "version": s.version,
            "architecture": s.architecture
        } for s in software_list]
        
        # 调用 AI 服务进行兼容性检查
        result = await check_software_compatibility(base_image_data, software_list_data)
        
        return result
        
    except Exception as e:
        logger.error(f"Error checking software compatibility: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"检查软件兼容性时发生错误: {str(e)}"
        ) 