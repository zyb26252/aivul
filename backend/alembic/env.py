from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool

from alembic import context

from app.core.config import settings
from app.models.user import Base
from app.models.image import Image
from app.models.software import Software
from app.models.target import Target
from app.models.instance import Instance
from app.models.scene import Scene  # 添加Scene模型导入

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config 