from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api import auth, images, software, targets, instances, dashboard, ai, api, scenes
from app.models.user import Base
from app.db.session import engine
from app.db.init_db import init_db
from app.db.session import SessionLocal
import uvicorn
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# 创建数据库表
try:
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")

app = FastAPI(
    title="AI VUL API",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# 初始化数据库
try:
    db = SessionLocal()
    init_db(db)
    db.close()
    logger.info("Database initialized successfully")
except Exception as e:
    logger.error(f"Error initializing database: {e}")

# 设置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(images.router, prefix="/api/v1/images", tags=["images"])
app.include_router(instances.router, prefix="/api/v1/instances", tags=["instances"])
app.include_router(software.router, prefix="/api/v1/software", tags=["software"])
app.include_router(targets.router, prefix="/api/v1/targets", tags=["targets"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(ai.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(scenes.router, prefix="/api/v1/scenes", tags=["scenes"])
app.include_router(api.api_router, prefix="/api/v1")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning") 