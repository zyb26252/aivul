from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.target import Target, TargetCreate, TargetUpdate
from app.models.target import Target as TargetModel
from app.models.image import Image as ImageModel
from app.models.software import Software as SoftwareModel
from app.models.user import User
from app.utils.dockerfile import generate_dockerfile
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Target])
def list_targets(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取靶标列表
    """
    targets = db.query(TargetModel).offset(skip).limit(limit).all()
    return targets

@router.post("/", response_model=Target)
def create_target(
    *,
    db: Session = Depends(deps.get_db),
    target_in: TargetCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建新靶标
    """
    try:
        # 验证基础镜像是否存在
        base_image = db.query(ImageModel).filter(ImageModel.id == target_in.base_image_id).first()
        if not base_image:
            raise HTTPException(status_code=404, detail="Base image not found")
        
        # 验证软件是否存在
        software_list = []
        for software_id in target_in.software_ids:
            software = db.query(SoftwareModel).filter(SoftwareModel.id == software_id).first()
            if not software:
                raise HTTPException(status_code=404, detail=f"Software with id {software_id} not found")
            software_list.append(software)
        
        # 生成 Dockerfile
        dockerfile = target_in.dockerfile or generate_dockerfile(base_image, software_list)
        
        # 创建靶标
        target = TargetModel(
            name=target_in.name,
            description=target_in.description,
            base_image_id=target_in.base_image_id,
            dockerfile=dockerfile,
            optimized_dockerfile=target_in.optimized_dockerfile,
            created_by_id=current_user.id,
            status="draft"
        )
        
        # 添加软件关联
        target.software_list = software_list
        
        db.add(target)
        db.commit()
        db.refresh(target)
        return target
    except Exception as e:
        logger.error(f"Error creating target: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating target: {str(e)}"
        )

@router.get("/{target_id}", response_model=Target)
def get_target(
    *,
    db: Session = Depends(deps.get_db),
    target_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取指定靶标信息
    """
    target = db.query(TargetModel).filter(TargetModel.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    return target

@router.put("/{target_id}", response_model=Target)
def update_target(
    *,
    db: Session = Depends(deps.get_db),
    target_id: int,
    target_in: TargetUpdate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    更新靶标信息
    """
    target = db.query(TargetModel).filter(TargetModel.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    # 更新基本信息
    for field in ["name", "description", "base_image_id", "dockerfile", "optimized_dockerfile"]:
        if hasattr(target_in, field) and getattr(target_in, field) is not None:
            setattr(target, field, getattr(target_in, field))
    
    # 更新软件列表
    if target_in.software_ids is not None:
        software_list = []
        for software_id in target_in.software_ids:
            software = db.query(SoftwareModel).filter(SoftwareModel.id == software_id).first()
            if not software:
                raise HTTPException(status_code=404, detail=f"Software with id {software_id} not found")
            software_list.append(software)
        target.software_list = software_list
        
        # 只有在没有提供 dockerfile 时才重新生成
        if target_in.dockerfile is None:
            base_image = db.query(ImageModel).filter(ImageModel.id == target.base_image_id).first()
            target.dockerfile = generate_dockerfile(base_image, software_list)
    
    db.add(target)
    db.commit()
    db.refresh(target)
    return target

@router.delete("/{target_id}")
def delete_target(
    *,
    db: Session = Depends(deps.get_db),
    target_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    删除靶标
    """
    target = db.query(TargetModel).filter(TargetModel.id == target_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Target not found")
    
    db.delete(target)
    db.commit()
    return {"ok": True} 