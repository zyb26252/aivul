from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.schemas import ImageCreate, Image
from app.database.session import get_db
from app.database.models import User
from app.database import crud
from typing import List

router = APIRouter()

@router.post("", response_model=Image)
def create_image(
    image: ImageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    print("Received image data:", image.dict())
    try:
        result = crud.create_image(db=db, image=image, user_id=current_user.id)
        print("Created image:", result)
        return result
    except Exception as e:
        print("Error creating image:", str(e))
        raise

@router.get("", response_model=List[Image])
def get_images(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.get_images(db) 