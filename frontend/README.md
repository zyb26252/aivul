# 网络靶场前端

## 技术栈

- Vue 3
- TypeScript
- Element Plus
- Vite
- Pinia
- Vue Router
- Sass
- X6 (拓扑编辑器)

## 项目结构

```
frontend/
├── src/
│   ├── api/          # API 接口定义
│   ├── assets/       # 静态资源
│   ├── components/   # 公共组件
│   ├── router/       # 路由配置
│   ├── stores/       # Pinia 状态管理
│   ├── styles/       # 全局样式
│   ├── types/        # TypeScript 类型定义
│   ├── utils/        # 工具函数
│   └── views/        # 页面组件
│       ├── topology/     # 拓扑编辑器相关
│       │   ├── components/   # 拓扑编辑器组件
│       │   └── index.vue     # 拓扑编辑器页面
│       └── ...
├── public/           # 公共资源
├── .env             # 环境变量
├── .env.example     # 环境变量示例
├── vite.config.ts   # Vite 配置
├── tsconfig.json    # TypeScript 配置
└── package.json     # 项目依赖
```

## 主要功能模块

### 1. 拓扑编辑器
- 基于 X6 的可视化网络拓扑编辑器
- 支持容器和交换机节点
- 节点拖拽和连线功能
- 分组管理功能
- 快捷键支持
- 自动保存和加载

### 2. 场景管理
- 场景列表展示
- 场景创建和编辑
- 场景状态管理

## 开发环境设置

### 前置要求
- Node.js 16+
- npm 或 yarn
- 现代浏览器（Chrome/Firefox/Safari）

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 开发服务器启动
```bash
npm run dev
# 或
yarn dev
```

### 生产环境构建
```bash
npm run build
# 或
yarn build
```

### 代码检查
```bash
npm run lint
# 或
yarn lint
```

## 环境变量配置

在 `.env` 文件中配置以下环境变量：

```env
VITE_API_BASE_URL=http://localhost:8000  # 后端API地址
```

## Docker 部署

### 使用 Docker Compose
```bash
docker-compose up -d
```

### 手动构建镜像
```bash
docker build -t aivul-frontend .
docker run -d -p 80:80 aivul-frontend
```

## 开发规范

### 代码风格
- 使用 TypeScript 编写代码
- 遵循 Vue 3 组合式 API 风格
- 使用 ESLint 和 Prettier 进行代码格式化

### 组件开发规范
- 组件名使用 PascalCase
- Props 必须定义类型
- 使用 `<script setup>` 语法
- 样式使用 scoped SCSS

### Git 提交规范
```
feat: 新功能
fix: 修复
docs: 文档更新
style: 代码格式（不影响代码运行的变动）
refactor: 重构
perf: 性能优化
test: 测试
chore: 构建过程或辅助工具的变动
```

## 主要依赖版本

```json
{
  "vue": "^3.3.4",
  "typescript": "^5.0.2",
  "element-plus": "^2.3.14",
  "@antv/x6": "^2.11.5",
  "pinia": "^2.1.6",
  "vue-router": "^4.2.4"
}
```

## 已知问题

- [ ] 拓扑编辑器在某些情况下可能出现性能问题
- [ ] 部分浏览器兼容性问题待解决

## 后续计划

- [ ] 优化拓扑编辑器性能
- [ ] 添加更多快捷键支持
- [ ] 实现容器管理功能
- [ ] 实现网络配置功能
- [ ] 优化移动端适配

## 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License
