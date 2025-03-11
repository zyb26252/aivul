# 使用 Python 3.9 作为基础镜像
FROM python:3.9-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    ENVIRONMENT=production \
    TZ=Asia/Shanghai

# 安装系统依赖
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        build-essential \
        libpq-dev \
        curl \
    && rm -rf /var/lib/apt/lists/* \
    && mkdir -p /app/logs

# 复制依赖文件
COPY requirements.txt .

# 安装 Python 依赖
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir gunicorn

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser:appuser /app

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8000

# 创建启动脚本
COPY <<EOF /app/start.sh
#!/bin/sh
gunicorn main:app \
    --workers \${MAX_WORKERS:-2} \
    --worker-class \${WORKER_CLASS:-uvicorn.workers.UvicornWorker} \
    --bind 0.0.0.0:8000 \
    --log-level \${LOG_LEVEL:-warning} \
    --access-logfile /app/logs/access.log \
    --error-logfile /app/logs/error.log \
    --timeout 120
EOF

# 设置启动脚本权限
RUN chmod +x /app/start.sh

# 启动应用
CMD ["/app/start.sh"] 