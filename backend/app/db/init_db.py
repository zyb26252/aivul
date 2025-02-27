from sqlalchemy.orm import Session

from app.core.config import settings
from app.schemas.user import UserCreate
from app.models.user import User
from app.core.security import get_password_hash

def init_db(db: Session) -> None:
    # 创建初始管理员用户
    user = db.query(User).filter(User.email == "admin@example.com").first()
    if not user:
        user_in = UserCreate(
            username="admin",
            email="admin@example.com",
            password="admin123",  # 在生产环境中使用更强的密码
            is_active=True,
            role="admin"
        )
        user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            is_active=user_in.is_active,
            role=user_in.role
        )
        db.add(user)
        db.commit()
        db.refresh(user) 