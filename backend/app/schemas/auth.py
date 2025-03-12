from pydantic import BaseModel, Field

class PasswordChange(BaseModel):
    old_password: str = Field(..., description="原密码")
    new_password: str = Field(..., description="新密码")
    confirm_password: str = Field(..., description="确认密码")