# 先导入所有模型
from app.models import Base, User, Image, Software, Target, Instance, Scene

# 然后导入所有API模块
from app.api.auth import router as auth_router
from app.api.images import router as images_router
from app.api.software import router as software_router
from app.api.targets import router as targets_router
from app.api.instances import router as instances_router
from app.api.dashboard import router as dashboard_router
from app.api.ai import router as ai_router
from app.api.v1.scenes import router as scenes_router

# 导出所有路由
__all__ = [
    "auth_router",
    "images_router",
    "software_router",
    "targets_router",
    "instances_router",
    "dashboard_router",
    "ai_router",
    "scenes_router"
] 