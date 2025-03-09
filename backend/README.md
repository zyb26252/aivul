# 网络靶场后端

## 技术栈

- Python 3.8+
- FastAPI
- SQLite
- Docker
- SQLAlchemy
- Pydantic
- Uvicorn

## 项目结构

```
backend/
├── app/
│   ├── api/          # API 路由
│   ├── core/         # 核心配置
│   ├── crud/         # 数据库操作
│   ├── db/           # 数据库配置
│   ├── models/       # 数据库模型
│   ├── schemas/      # Pydantic 模型
│   └── utils/        # 工具函数
├── tests/            # 测试文件
├── .env             # 环境变量
├── .env.example     # 环境变量示例
├── main.py          # 应用入口
└── requirements.txt  # 项目依赖
```

## 主要功能模块

### 1. 场景管理
- 场景创建和配置
- 场景数据持久化
- 场景状态管理
- 拓扑数据存储

### 2. 计划开发功能
- Docker 容器管理
- 容器网络配置
- AI 服务集成
- 实时状态更新

## API 文档

启动服务后访问：
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 开发环境设置

### 前置要求
- Python 3.8+
- pip
- Docker & Docker Compose
- SQLite3

### 安装依赖
```bash
pip install -r requirements.txt
```

### 配置环境变量
复制 `.env.example` 到 `.env` 并配置：

```env
# 基础配置
API_V1_STR=/api/v1
PROJECT_NAME=aivul

# 数据库配置
SQLITE_DATABASE_URL=sqlite:///./sql_app.db

# Docker配置
DOCKER_API_URL=unix://var/run/docker.sock
```

### 启动开发服务器
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## Docker 部署

### 使用 Docker Compose
```bash
docker-compose up -d
```

### 手动构建镜像
```bash
docker build -t aivul-backend .
docker run -d -p 8000:8000 aivul-backend
```

## 数据库管理

### 数据库迁移
```bash
# 生成迁移脚本
alembic revision --autogenerate -m "description"

# 应用迁移
alembic upgrade head
```

### 数据库备份
```bash
# 备份数据库
sqlite3 sql_app.db .dump > backup.sql

# 恢复数据库
sqlite3 sql_app.db < backup.sql
```

## 开发规范

### 代码风格
- 遵循 PEP 8 规范
- 使用 Black 进行代码格式化
- 使用 isort 进行导入排序
- 使用 flake8 进行代码检查

### API 开发规范
- 使用 RESTful 设计原则
- 请求/响应使用 Pydantic 模型
- 统一错误处理
- 完整的类型注解

### Git 提交规范
```
feat: 新功能
fix: 修复
docs: 文档更新
style: 代码格式
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建/工具
```

## 主要依赖版本

```
fastapi==0.103.1
uvicorn==0.23.2
sqlalchemy==2.0.20
pydantic==2.3.0
python-dotenv==1.0.0
docker==6.1.3
```

## 测试

### 运行测试
```bash
pytest
```

### 测试覆盖率
```bash
pytest --cov=app tests/
```

## 已知问题

- [ ] 需要实现容器管理功能
- [ ] 需要实现网络配置功能

## 后续计划

- [ ] 实现容器管理功能
- [ ] 实现网络配置功能
- [ ] 添加 WebSocket 支持实时状态更新
- [ ] 集成 AI 服务
- [ ] 添加更多单元测试

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 