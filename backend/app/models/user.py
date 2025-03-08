from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    role = Column(String, default="user")
    images = relationship("Image", back_populates="created_by")
    software = relationship("Software", back_populates="created_by")
    targets = relationship("Target", back_populates="created_by")
    instances = relationship("Instance", back_populates="created_by")
    scenes = relationship("Scene", back_populates="created_by", lazy="dynamic") 