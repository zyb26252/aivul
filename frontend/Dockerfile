# 开发环境
FROM node:18-alpine

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=development \
    VITE_LOGGER_LEVEL=warn \
    NODE_OPTIONS="--no-warnings" \
    NPM_CONFIG_LOGLEVEL=warn \
    NPM_CONFIG_FUND=false \
    NPM_CONFIG_AUDIT=false

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 暴露开发服务器端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]