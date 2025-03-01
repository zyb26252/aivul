# 使用 Node.js 官方 LTS 镜像
FROM node:lts

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装项目依赖
RUN npm install

# 暴露应用运行的端口
EXPOSE 3000

# 启动应用
CMD ["npm", "run", "dev"]