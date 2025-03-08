from typing import Any
from sqlalchemy.ext.declarative import declarative_base, declared_attr

Base = declarative_base()

class ModelBase:
    id: Any
    __name__: str

    # 生成表名
    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__name__.lower() 