# AI驱动的网络靶场自动化构建引擎

## 项目简介

本项目是一个基于AI技术的网络靶场自动化构建系统，旨在简化和自动化网络安全环境的构建过程。通过智能分析和自动化配置，帮助用户快速搭建所需的网络安全训练和测试环境。

## 系统架构

项目采用前后端分离架构：
- 前端：Vue 3 + TypeScript + Element Plus
- 后端：FastAPI + SQLite + Docker
- AI引擎：基于大语言模型的智能分析和配置生成

## 核心功能模块

### 1. 场景管理
- 场景创建与配置
- 拓扑编辑器
  - 容器节点管理
  - 交换机节点管理
  - 节点分组功能
  - 节点连线功能
  - 快捷键支持
- 场景保存与加载

## 技术特点

- 🚀 现代化技术栈：Vue 3 + TypeScript + FastAPI
- 🎨 优雅的UI设计：Element Plus + 自定义组件
- 📊 强大的拓扑编辑：基于X6的可视化编辑器
- 🛡️ 类型安全：全栈TypeScript/Python类型支持
- 🎯 高性能：FastAPI异步处理
- 📦 容器化部署：Docker + Docker Compose

## 开发环境要求

### 前端
- Node.js 16+
- npm 或 yarn
- Vue 3
- TypeScript 4.5+

### 后端
- Python 3.8+
- FastAPI
- SQLite3
- Docker & Docker Compose

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/your-username/project-name.git
cd project-name
```

2. 启动后端
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

3. 启动前端
```bash
cd frontend
npm install
npm run dev
```

详细的安装和使用说明请参考：
- [前端文档](frontend/README.md)
- [后端文档](backend/README.md)

## 开发状态

🚧 积极开发中

当前已完成功能：
- ✅ 基础框架搭建
- ✅ 拓扑编辑器
- ✅ 场景管理

计划开发功能：
- 🔄 容器管理功能
- 🔄 网络配置功能
- 🔄 AI辅助功能

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 许可证

MIT License 