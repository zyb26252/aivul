from fastapi import APIRouter
from . import auth, image, software, target, instance, ai

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["认证"])
api_router.include_router(image.router, prefix="/images", tags=["镜像"])
api_router.include_router(software.router, prefix="/software", tags=["软件"])
api_router.include_router(target.router, prefix="/targets", tags=["靶标"])
api_router.include_router(instance.router, prefix="/instances", tags=["实例"])
api_router.include_router(ai.router, prefix="/ai", tags=["AI"]) 