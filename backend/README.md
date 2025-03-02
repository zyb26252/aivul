# 网络靶场后端服务

## 项目介绍

后端服务是网络靶场自动化构建系统的核心组件，负责处理业务逻辑、AI分析和容器管理。基于 FastAPI 框架开发，提供 RESTful API 接口。

## 主要功能

### 认证服务 (/api/v1/auth)
- 用户认证和授权
- JWT token 管理
- 权限控制

### 镜像管理服务 (/api/v1/images)
- 基础镜像的CRUD操作
- 镜像元数据管理
- 镜像仓库集成

### 软件仓库服务 (/api/v1/software)
- 软件包管理
- 版本控制
- 依赖分析

### AI分析服务 (/api/v1/ai)
- 软件兼容性分析
- 环境依赖检测
- 构建建议生成

### 靶标服务 (/api/v1/targets)
- Dockerfile生成
- 靶标构建和管理
- 构建日志记录

### 实例管理 (/api/v1/instances)
- 容器生命周期管理
- 资源监控和调度
- 实例状态维护

### 仪表盘服务 (/api/v1/dashboard)
- 系统状态概览
- 资源使用统计
- 操作日志查看

## 技术栈

- FastAPI: Web框架
- SQLAlchemy: ORM框架
- SQLite: 数据库
- Pydantic: 数据验证
- Docker SDK: 容器管理
- OpenAI: AI分析服务

## 目录结构

```
backend/
├── app/                # 应用源码
│   ├── api/           # API路由
│   ├── core/          # 核心配置
│   ├── crud/          # 数据库操作
│   ├── db/            # 数据库会话
│   ├── models/        # 数据模型
│   ├── schemas/       # 数据校验
│   ├── services/      # 业务逻辑
│   └── utils/         # 工具函数
├── main.py            # 应用入口
└── requirements.txt    # 项目依赖
```

## 本地开发

1. 创建虚拟环境
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或
venv\Scripts\activate     # Windows
```

2. 安装依赖
```bash
pip install -r requirements.txt
```

3. 配置环境变量
复制 `.env.example` 到 `.env` 并设置必要的环境变量。

4. 启动开发服务器
```bash
# 普通模式
uvicorn main:app --host 0.0.0.0 --port 8000

# 调试模式（自动重载）
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

## 环境变量

需要配置以下环境变量：
- `SECRET_KEY`: JWT密钥（必填，默认：your-secret-key）
- `DOCKER_HOST`: Docker守护进程地址（默认：unix://var/run/docker.sock）
- `BAILIAN_API_KEY`: 百炼 API 密钥（必填）
- `API_BASE_URL`: API基础URL（默认：https://dashscope.aliyuncs.com/compatible-mode/v1）
- `DEBUG`: 调试模式开关（默认：False）

注意：数据库配置 `SQLALCHEMY_DATABASE_URL` 默认为 `sqlite:///{项目根目录}/sql_app.db`，通常不需要修改。

可以通过以下方式设置环境变量：

1. 创建 `.env` 文件：
```bash
# .env 文件示例
SECRET_KEY=your-secret-key
BAILIAN_API_KEY=your_bailian_api_key
API_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
DEBUG=True
```

2. 或者直接在系统中设置环境变量：
```bash
export SECRET_KEY=your-secret-key
export BAILIAN_API_KEY=your_bailian_api_key
```

## 部署

### 生产环境部署

1. 安装依赖
```bash
pip install -r requirements.txt
```

2. 配置环境变量
```bash
# 创建并编辑 .env 文件，设置必要的环境变量
SECRET_KEY=your_production_secret_key
BAILIAN_API_KEY=your_production_api_key
DEBUG=False
```

3. 启动服务器
```bash
# 使用 gunicorn 作为生产环境 WSGI 服务器
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

建议使用 systemd 或 supervisor 等进程管理工具来管理服务进程。

## 监控和日志

- 应用日志：通过标准输出和 logging 模块记录
- 性能监控：`/api/v1/dashboard/metrics`
- 健康检查：`/api/v1/dashboard/health` 