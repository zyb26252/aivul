from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.api import deps
from app.schemas.user import User, UserCreate, Token
from app.schemas.msg import Msg
from app.schemas.auth import PasswordChange
from app.models.user import User as UserModel
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=User)
async def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
) -> Any:
    """
    Create new user.
    """
    try:
        logger.debug(f"Attempting to create user with username: {user_in.username}")
        
        # 检查邮箱是否已存在
        user = db.query(UserModel).filter(UserModel.email == user_in.email).first()
        if user:
            logger.warning(f"Email already exists: {user_in.email}")
            raise HTTPException(
                status_code=400,
                detail="The user with this email already exists in the system.",
            )
        
        # 检查用户名是否已存在
        user = db.query(UserModel).filter(UserModel.username == user_in.username).first()
        if user:
            logger.warning(f"Username already exists: {user_in.username}")
            raise HTTPException(
                status_code=400,
                detail="The user with this username already exists in the system.",
            )
        
        # 创建新用户
        db_user = UserModel(
            username=user_in.username,
            email=user_in.email,
            hashed_password=get_password_hash(user_in.password),
            is_active=True,
            role="user"
        )
        logger.debug("User object created, attempting to save to database")
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        logger.info(f"User created successfully: {user_in.username}")
        
        # 创建响应对象
        return User(
            id=db_user.id,
            username=db_user.username,
            email=db_user.email,
            is_active=db_user.is_active,
            role=db_user.role
        )
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}", exc_info=True)
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while creating user: {str(e)}"
        )

@router.post("/login", response_model=Token)
def login_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    user = db.query(UserModel).filter(UserModel.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": create_access_token(
            data={"sub": user.username}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }

@router.get("/me", response_model=User)
async def read_users_me(current_user: UserModel = Depends(deps.get_current_user)):
    """
    获取当前登录用户信息
    """
    return User(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        is_active=current_user.is_active,
        role=current_user.role
    )

@router.post("/change-password", response_model=Msg)
def change_password(
    *,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    password_in: PasswordChange,
):
    """
    修改密码
    """
    if not verify_password(password_in.old_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="原密码错误")
        
    current_user.hashed_password = get_password_hash(password_in.new_password)
    db.add(current_user)
    db.commit()
    
    return {"msg": "密码修改成功"}