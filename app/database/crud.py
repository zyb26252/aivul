from sqlalchemy.orm import Session
from datetime import datetime
from app.database.models import Image as ImageModel
from app.schemas import ImageCreate

def create_image(db: Session, image: ImageCreate, user_id: int):
    db_image = ImageModel(
        name=image.name,
        registry_path=image.registry_path,
        architecture=image.architecture,
        description=image.description,
        created_by_id=user_id,
        created_at=datetime.utcnow()
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    
    # 转换为字典
    return {
        "id": db_image.id,
        "name": db_image.name,
        "registry_path": db_image.registry_path,
        "architecture": db_image.architecture,
        "description": db_image.description,
        "created_at": db_image.created_at,
        "created_by_id": db_image.created_by_id
    }

def get_images(db: Session):
    images = db.query(ImageModel).all()
    # 转换为字典列表
    return [
        {
            "id": image.id,
            "name": image.name,
            "registry_path": image.registry_path,
            "architecture": image.architecture,
            "description": image.description,
            "created_at": image.created_at,
            "created_by_id": image.created_by_id
        }
        for image in images
    ] 