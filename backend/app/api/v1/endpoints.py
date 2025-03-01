from fastapi import APIRouter
from app.api.v1 import users, software, images, targets

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(software.router, prefix="/software", tags=["software"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(targets.router, prefix="/targets", tags=["targets"]) 