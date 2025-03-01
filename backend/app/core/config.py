from pydantic_settings import BaseSettings
from typing import Optional
import os

# 获取项目根目录
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

class Settings(BaseSettings):
    PROJECT_NAME: str = "容器化靶标管理系统"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "your-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 小时
    
    # SQLite配置
    SQLALCHEMY_DATABASE_URL: str = f"sqlite:///{BASE_DIR}/sql_app.db"
    
    # AI API 配置
    BAILIAN_API_KEY: str  # 通义千问的 API key
    API_BASE_URL: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings() 