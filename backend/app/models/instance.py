from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.user import Base

class Instance(Base):
    __tablename__ = "instances"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    target_id = Column(Integer, ForeignKey("targets.id"))
    container_id = Column(String(100), nullable=True)  # Docker容器ID
    status = Column(String(20), default="creating")  # creating, running, stopped, failed
    ports = Column(JSON, nullable=True)  # 端口映射
    environment = Column(JSON, nullable=True)  # 环境变量
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    
    # 关联关系
    target = relationship("Target")
    created_by = relationship("User", back_populates="instances") 