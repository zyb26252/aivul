from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.schemas.image import Image, ImageCreate, ImageUpdate
from app.models.image import Image as ImageModel
from app.models.user import User

router = APIRouter()

@router.get("/", response_model=List[Image])
def list_images(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取镜像列表
    """
    images = db.query(ImageModel).offset(skip).limit(limit).all()
    return images

@router.post("/", response_model=Image)
def create_image(
    *,
    db: Session = Depends(deps.get_db),
    image_in: ImageCreate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    创建新镜像
    """
    image = ImageModel(
        **image_in.dict(),
        created_by_id=current_user.id
    )
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

@router.get("/{image_id}", response_model=Image)
def get_image(
    *,
    db: Session = Depends(deps.get_db),
    image_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    获取指定镜像信息
    """
    image = db.query(ImageModel).filter(ImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    return image

@router.put("/{image_id}", response_model=Image)
def update_image(
    *,
    db: Session = Depends(deps.get_db),
    image_id: int,
    image_in: ImageUpdate,
    current_user: User = Depends(deps.get_current_user),
):
    """
    更新镜像信息
    """
    image = db.query(ImageModel).filter(ImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    for field, value in image_in.dict(exclude_unset=True).items():
        setattr(image, field, value)
    
    db.add(image)
    db.commit()
    db.refresh(image)
    return image

@router.delete("/{image_id}")
def delete_image(
    *,
    db: Session = Depends(deps.get_db),
    image_id: int,
    current_user: User = Depends(deps.get_current_user),
):
    """
    删除镜像
    """
    image = db.query(ImageModel).filter(ImageModel.id == image_id).first()
    if not image:
        raise HTTPException(status_code=404, detail="Image not found")
    
    db.delete(image)
    db.commit()
    return {"ok": True} 