from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.software import Software, SoftwareCreate, SoftwareUpdate
from app.models.software import Software as SoftwareModel
from app.models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/", response_model=List[Software])
def list_software(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    architecture: Optional[str] = None,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取软件列表
    - search: 搜索关键词(名称或描述)
    - architecture: 架构筛选(x86/arm)
    """
    query = db.query(SoftwareModel)
    
    # 搜索条件
    if search:
        query = query.filter(
            (SoftwareModel.name.ilike(f"%{search}%")) |
            (SoftwareModel.description.ilike(f"%{search}%"))
        )
    
    # 架构筛选
    if architecture:
        query = query.filter(SoftwareModel.architecture == architecture)
    
    software = query.offset(skip).limit(limit).all()
    return software

@router.post("/", response_model=Software)
def create_software(
    *,
    db: Session = Depends(deps.get_db),
    software_in: SoftwareCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建新软件
    """
    try:
        software = SoftwareModel(
            **software_in.dict(),
            created_by_id=current_user.id
        )
        db.add(software)
        db.commit()
        db.refresh(software)
        return software
    except Exception as e:
        logger.error(f"Error creating software: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating software: {str(e)}"
        )

@router.get("/{software_id}", response_model=Software)
def get_software(
    *,
    db: Session = Depends(deps.get_db),
    software_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取指定软件信息
    """
    software = db.query(SoftwareModel).filter(SoftwareModel.id == software_id).first()
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")
    return software

@router.put("/{software_id}", response_model=Software)
def update_software(
    *,
    db: Session = Depends(deps.get_db),
    software_id: int,
    software_in: SoftwareUpdate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    更新软件信息
    """
    software = db.query(SoftwareModel).filter(SoftwareModel.id == software_id).first()
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")
    
    for field, value in software_in.dict(exclude_unset=True).items():
        setattr(software, field, value)
    
    db.add(software)
    db.commit()
    db.refresh(software)
    return software

@router.delete("/{software_id}")
def delete_software(
    *,
    db: Session = Depends(deps.get_db),
    software_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    删除软件
    """
    software = db.query(SoftwareModel).filter(SoftwareModel.id == software_id).first()
    if not software:
        raise HTTPException(status_code=404, detail="Software not found")
    
    db.delete(software)
    db.commit()
    return {"ok": True} 