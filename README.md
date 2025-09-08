# 应急调度指挥中心大屏系统

## 项目简介

应急调度指挥中心大屏系统是一个基于Vue 3 + TypeScript + Element Plus的现代化应急管理平台。系统提供实时事件监控、资源调度、地图展示、数据可视化等功能，为应急指挥决策提供全面的信息支持。

## 技术栈

- **前端框架**: Vue 3.3+ (Composition API)
- **开发语言**: TypeScript 5.2+
- **UI组件库**: Element Plus 2.4+
- **状态管理**: Pinia 2.1+
- **路由管理**: Vue Router 4.2+
- **图表库**: ECharts 5.4+ / Vue-ECharts 6.6+
- **地图服务**: 高德地图API 2.0
- **构建工具**: Vite 5.0+
- **样式预处理**: Sass
- **代码规范**: ESLint + Prettier

## 功能特性

### 🗺️ 实时地图监控
- 高德地图集成，支持多种地图模式
- 实时事件标注和资源位置显示
- 动态轨迹跟踪和区域管理
- 地图图层控制和自定义标记

### 📊 数据可视化
- ECharts图表组件，支持多种图表类型
- 实时数据更新和动态展示
- 事件统计分析和趋势预测
- 资源利用率监控面板

### 🚨 事件管理
- 多类型应急事件分类管理
- 事件严重程度评估和状态跟踪
- 自动化事件分派和处理流程
- 历史事件查询和统计分析

### 🚁 资源调度
- 多维度资源信息管理
- 智能资源匹配和调度算法
- 实时资源状态监控
- 资源利用效率分析

### 📱 响应式设计
- 支持多种屏幕尺寸适配
- 大屏显示优化设计
- 移动端友好的交互体验

## 项目结构

```
emergency-dispatch-screen/
├── public/                 # 静态资源
├── src/
│   ├── assets/            # 资源文件
│   │   └── mock/          # 模拟数据
│   ├── components/        # 公共组件
│   ├── router/            # 路由配置
│   ├── stores/            # 状态管理
│   │   └── modules/       # 状态模块
│   ├── styles/            # 样式文件
│   ├── types/             # 类型定义
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   │   └── EmergencyDispatch/  # 应急调度页面
│   ├── App.vue            # 根组件
│   └── main.ts            # 入口文件
├── index.html             # HTML模板
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript配置
├── vite.config.ts         # Vite配置
└── README.md              # 项目说明
```

## 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm >= 7.0.0 (推荐) 或 npm >= 8.0.0

### 安装依赖

```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

### 开发环境

```bash
# 启动开发服务器
pnpm dev

# 或
npm run dev
```

访问 http://localhost:3000 查看应用

### 生产构建

```bash
# 构建生产版本
pnpm build

# 预览生产版本
pnpm preview
```

### 代码检查

```bash
# ESLint检查
pnpm lint

# TypeScript类型检查
pnpm type-check
```

## 配置说明

### 地图API配置

1. 申请高德地图API Key
2. 在 `index.html` 中替换 `YOUR_AMAP_KEY` 为实际的API Key
3. 根据需要配置地图插件和服务

### 环境变量

创建 `.env.local` 文件配置环境变量：

```env
# 高德地图API Key
VITE_AMAP_KEY=your_amap_api_key

# API服务地址
VITE_API_BASE_URL=http://localhost:8080/api

# WebSocket服务地址
VITE_WS_URL=ws://localhost:8080/ws
```

## 开发指南

### 组件开发规范

- 使用Vue 3 Composition API
- 遵循TypeScript类型安全
- 组件命名采用PascalCase
- 文件命名采用kebab-case

### 状态管理

使用Pinia进行状态管理，主要模块：

- `emergency`: 应急事件和资源管理
- `map`: 地图状态和交互
- `user`: 用户信息和权限

### 样式规范

- 使用Sass预处理器
- 遵循BEM命名规范
- 支持CSS变量和主题切换
- 响应式设计优先

### API接口

- 使用Axios进行HTTP请求
- 统一的错误处理机制
- 请求/响应拦截器
- TypeScript类型定义

## 部署指南

### Docker部署

```dockerfile
# Dockerfile示例
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Nginx配置

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 性能优化

### 构建优化

- Vite构建工具，快速热更新
- 代码分割和懒加载
- 资源压缩和缓存策略
- Tree-shaking优化

### 运行时优化

- Vue 3响应式系统优化
- 组件按需加载
- 图片懒加载和压缩
- 地图瓦片缓存

## 浏览器支持

- Chrome >= 87
- Firefox >= 78
- Safari >= 14
- Edge >= 88

## 贡献指南

1. Fork项目仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 项目维护者：Emergency Dispatch Development Team
- 邮箱：emergency-dev@example.com
- 项目地址：https://github.com/emergency-dispatch/screen

## 更新日志

### v1.0.0 (2024-01-15)

- ✨ 初始版本发布
- 🗺️ 集成高德地图API
- 📊 ECharts数据可视化
- 🚨 应急事件管理系统
- 🚁 资源调度功能
- 📱 响应式大屏设计

---

**注意**: 本项目仅供学习和演示使用，生产环境部署请确保数据安全和系统稳定性。