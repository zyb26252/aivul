from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.api import auth, images, software, targets, instances, dashboard, ai, scenes
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
    description="""
    AI VUL 是一个 AI 驱动的网络靶场自动化构建引擎。
    
    ## 功能特点
    
    * 🔒 完整的认证和授权系统
    * 🖼️ Docker 镜像管理
    * 📦 软件包管理
    * 🎯 靶标管理
    * 🌐 场景管理
    * 🚀 实例管理
    * 🤖 AI 辅助生成
    
    ## 认证
    
    所有 API 都需要认证（除了登录和注册接口）。请在请求头中添加 Bearer Token：
    
    ```
    Authorization: Bearer your-token-here
    ```
    """,
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=None,
    redoc_url=None,
    contact={
        "name": "AI VUL Team",
        "url": "https://github.com/yourusername/aivul",
        "email": "your-email@example.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    }
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
    allow_origins=["http://8.210.223.197:3000", "http://localhost:3000", "http://aivul.love"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 自定义 API 文档路由
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - API 文档",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/static/swagger-ui-bundle.js",
        swagger_css_url="/static/swagger-ui.css",
    )

# 注册路由
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["认证"])
app.include_router(images.router, prefix=f"{settings.API_V1_STR}/images", tags=["镜像管理"])
app.include_router(instances.router, prefix=f"{settings.API_V1_STR}/instances", tags=["实例管理"])
app.include_router(software.router, prefix=f"{settings.API_V1_STR}/software", tags=["软件管理"])
app.include_router(targets.router, prefix=f"{settings.API_V1_STR}/targets", tags=["靶标管理"])
app.include_router(dashboard.router, prefix=f"{settings.API_V1_STR}/dashboard", tags=["仪表盘"])
app.include_router(ai.router, prefix=f"{settings.API_V1_STR}/ai", tags=["AI 服务"])
app.include_router(scenes.router, prefix=f"{settings.API_V1_STR}/scenes", tags=["场景管理"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning") 