from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from app.models.user import Base

# 创建靶标和软件的多对多关系表
target_software = Table(
    'target_software',
    Base.metadata,
    Column('target_id', Integer, ForeignKey('targets.id')),
    Column('software_id', Integer, ForeignKey('software.id'))
)

class Target(Base):
    __tablename__ = "targets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    base_image_id = Column(Integer, ForeignKey("images.id"))
    dockerfile = Column(Text, nullable=True)
    status = Column(String(20), default="draft")  # draft, building, ready, failed
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    
    # 关联关系
    created_by = relationship("User", back_populates="targets")
    base_image = relationship("Image")
    software_list = relationship("Software", secondary=target_software, backref="targets") 