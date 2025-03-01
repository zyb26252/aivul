# 开发环境
FROM node:18-alpine as development

WORKDIR /app

# 设置环境变量以减少日志输出
ENV NODE_ENV=development
ENV VITE_LOGGER_LEVEL=warn
ENV NODE_OPTIONS="--no-warnings"
ENV NPM_CONFIG_LOGLEVEL=warn

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install --quiet

# 复制源代码
COPY . .

# 暴露开发服务器端口
EXPOSE 3000

# 启动开发服务器
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# 构建阶段
FROM node:18-alpine as builder

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 生产环境
FROM nginx:alpine as production

# 复制构建产物到Nginx目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost:80 || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]