from fastapi import APIRouter
from app.api.v1 import auth, images, software, targets, instances, dashboard, ai, scenes

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(images.router, prefix="/images", tags=["images"])
api_router.include_router(instances.router, prefix="/instances", tags=["instances"])
api_router.include_router(software.router, prefix="/software", tags=["software"])
api_router.include_router(targets.router, prefix="/targets", tags=["targets"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(scenes.router, prefix="/scenes", tags=["scenes"]) 