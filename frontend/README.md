# AI驱动的网络靶场前端

本项目是基于 Vue 3 + TypeScript + Vite 构建的现代化前端应用。

## 环境要求

- Node.js 18+
- Docker
- Docker Compose

## 快速开始

### 本地开发环境

1. 克隆项目：
```bash
git clone <repository_url>
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

### Docker 开发环境

开发环境提供热重载功能，适合日常开发使用。

1. 启动开发容器：
```bash
# 前台运行（可以看到实时日志）
docker-compose up frontend-dev

# 或后台运行
docker-compose up -d frontend-dev
```

2. 访问应用：
- 地址：http://localhost:3000

3. 查看日志：
```bash
docker-compose logs -f frontend-dev
```

4. 停止服务：
```bash
docker-compose down
```

### Docker 生产环境

生产环境使用 Nginx 作为 Web 服务器，提供更好的性能和安全性。

1. 启动生产容器：
```bash
# 前台运行
docker-compose up frontend-prod

# 或后台运行
docker-compose up -d frontend-prod
```

2. 访问应用：
- 地址：http://localhost:80

3. 查看日志：
```bash
docker-compose logs -f frontend-prod
```

4. 停止服务：
```bash
docker-compose down
```

## Docker 构建说明

### 构建行为
Docker Compose 的构建行为取决于不同的命令和场景：

1. **普通启动（不重新构建）**：
```bash
# 使用现有镜像（如果存在）
docker-compose up frontend-dev
# 或
docker-compose up frontend-prod
```

2. **强制重新构建**：
```bash
# 重新执行 Dockerfile 中的构建步骤
docker-compose up --build frontend-dev
# 或
docker-compose up --build frontend-prod
```

3. **单独构建**：
```bash
# 只构建不启动
docker-compose build frontend-dev
# 或
docker-compose build frontend-prod
```

### 常见场景说明

1. **首次运行**：
   - 会自动构建镜像
   - 推荐使用：`docker-compose up frontend-dev`

2. **修改了 Dockerfile**：
   - 需要重新构建
   - 推荐使用：`docker-compose up --build frontend-dev`

3. **修改了源代码**：
   - 开发环境：不需要重新构建（热重载）
   - 生产环境：需要重新构建
   - 推荐使用：
     - 开发：`docker-compose up frontend-dev`
     - 生产：`docker-compose up --build frontend-prod`

4. **修改了 package.json**：
   - 需要重新构建
   - 推荐使用：`docker-compose up --build frontend-dev`

5. **修改了环境变量**：
   - 如果只改了 docker-compose.yml 中的环境变量，不需要重新构建
   - 推荐使用：`docker-compose up frontend-dev`

### 最佳实践命令

```bash
# 开发环境日常使用（代码会热更新）
docker-compose up frontend-dev

# 开发环境修改了依赖时
docker-compose up --build frontend-dev

# 生产环境部署（总是使用最新代码）
docker-compose up --build frontend-prod

# 停止并删除所有容器
docker-compose down

# 完全重新构建（清除缓存）
docker-compose build --no-cache frontend-prod

# 查看构建日志
docker-compose build --progress=plain frontend-prod
```

## 常用命令

```bash
# 重新构建并启动容器
docker-compose up -d --build frontend-dev  # 开发环境
docker-compose up -d --build frontend-prod # 生产环境

# 查看容器状态
docker-compose ps

# 查看容器日志
docker-compose logs -f frontend-dev
docker-compose logs -f frontend-prod

# 停止并删除所有容器
docker-compose down
```

## 环境变量配置

开发环境和生产环境的环境变量可以在 `docker-compose.yml` 中配置：

```yaml
environment:
  - VITE_API_BASE_URL=http://47.86.184.188:8000
  - VITE_API_TIMEOUT=30000
```

## 目录结构

```
frontend/
├── src/                # 源代码目录
├── public/            # 静态资源
├── Dockerfile         # Docker 配置文件
├── docker-compose.yml # Docker Compose 配置
├── nginx.conf         # Nginx 配置（生产环境）
└── ...
```

## 开发和生产环境的区别

### 开发环境 (frontend-dev)
- 使用 Node.js 开发服务器
- 支持热重载
- 运行在 3000 端口
- 挂载本地代码，便于实时开发
- 未经过代码优化和压缩

### 生产环境 (frontend-prod)
- 使用 Nginx 服务器
- 代码经过构建优化和压缩
- 运行在 80 端口
- 更好的性能和安全性
- 包含生产级别的配置

## 注意事项

1. 确保 Docker 和 Docker Compose 已正确安装
2. 开发环境下代码修改会自动热重载
3. 生产环境的代码修改需要重新构建才能生效
4. 注意检查环境变量配置是否正确
5. 如遇到权限问题，可能需要使用 sudo 运行命令
6. 首次构建可能需要较长时间，后续构建会使用缓存加速
7. 如遇构建问题，可以尝试清除缓存重新构建
