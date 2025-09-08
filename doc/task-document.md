# 应急调度大屏前端项目任务文档

## 📋 项目概述

**项目名称**: 应急调度指挥大屏系统  
**技术栈**: Vue 3 + TypeScript + Element Plus + ECharts + 高德地图API  
**开发模式**: 前端独立开发，使用模拟数据  
**项目周期**: 预计 15-20 个工作日  

## 🏗️ 项目架构

### 目录结构

```
e:\ai-project\emergency/
├── src/
│   ├── views/
│   │   └── dataScreen/
│   │       └── EmergencyDispatch.vue          # 应急调度主页面
│   ├── components/
│   │   └── EmergencyDispatch/
│   │       ├── MapContainer.vue               # 地图容器组件
│   │       ├── EventMarker.vue                # 事件标注组件
│   │       ├── ResourceMarker.vue             # 资源标注组件
│   │       ├── DataPanel.vue                  # 数据监控面板
│   │       ├── EventList.vue                  # 事件列表组件
│   │       ├── Charts/
│   │       │   ├── EventChart.vue             # 事件统计图表
│   │       │   ├── ResourceChart.vue          # 资源统计图表
│   │       │   └── TrendChart.vue             # 趋势分析图表
│   │       └── Communication/
│   │           ├── VideoMonitor.vue           # 视频监控组件
│   │           └── MessageCenter.vue          # 消息中心组件
│   ├── api/
│   │   └── modules/
│   │       └── emergency/
│   │           ├── events.ts                  # 事件相关API
│   │           ├── resources.ts               # 资源相关API
│   │           └── communication.ts           # 通信相关API
│   ├── stores/
│   │   └── modules/
│   │       └── emergency/
│   │           ├── events.ts                  # 事件状态管理
│   │           ├── resources.ts               # 资源状态管理
│   │           └── map.ts                     # 地图状态管理
│   ├── types/
│   │   └── emergency.ts                       # TypeScript类型定义
│   ├── assets/
│   │   └── mock/
│   │       └── emergency/
│   │           ├── events.json                # 事件模拟数据
│   │           ├── resources.json             # 资源模拟数据
│   │           └── realtime.json              # 实时数据模拟
│   ├── styles/
│   │   └── emergency.scss                     # 应急调度样式
│   └── utils/
│       ├── websocket.ts                       # WebSocket工具类
│       └── mapUtils.ts                        # 地图工具函数
└── doc/
    ├── demand.md                              # 需求文档
    └── task-document.md                       # 任务文档
```

## 🎯 核心功能模块

### 1. 🗺️ GIS地图模块 (优先级: 高)

**功能描述**: 基于高德地图API的地理信息展示系统

**核心组件**:
- `MapContainer.vue` - 地图容器主组件
- `EventMarker.vue` - 事件标注组件
- `ResourceMarker.vue` - 资源标注组件

**主要功能**:
- ✅ 地理信息底图展示
- ✅ 实时事件标注显示
- ✅ 应急资源分布标注
- ✅ 动态轨迹跟踪
- ✅ 风险区域管理
- ✅ 多层级地图缩放

**技术要点**:
- 集成高德地图JavaScript API
- 自定义标注图标和样式
- 地图图层管理
- 标注聚合显示
- 地图事件监听

### 2. 📊 实时数据监控模块 (优先级: 中)

**功能描述**: 综合态势感知数据面板

**核心组件**:
- `DataPanel.vue` - 数据监控主面板
- `EventChart.vue` - 事件统计图表
- `ResourceChart.vue` - 资源统计图表
- `TrendChart.vue` - 趋势分析图表

**主要功能**:
- ✅ 关键指标实时展示
- ✅ 事件类型分布饼图
- ✅ 时间趋势折线图
- ✅ 区域分布柱状图
- ✅ 预警信息系统
- ✅ 资源状态监控

**技术要点**:
- ECharts图表库集成
- 响应式图表设计
- 实时数据更新
- 图表交互功能
- 数据格式化处理

### 3. 🚨 事件管理模块 (优先级: 中)

**功能描述**: 全流程事件处置管理系统

**核心组件**:
- `EventList.vue` - 事件列表组件
- `EventDetail.vue` - 事件详情组件
- `EventForm.vue` - 事件表单组件

**主要功能**:
- ✅ 多渠道事件接报
- ✅ 智能事件分级
- ✅ 标准响应流程
- ✅ 实时进度跟踪
- ✅ 处置效果评估

**技术要点**:
- 事件状态管理
- 表单验证处理
- 时间轴组件
- 状态流转控制
- 数据持久化

### 4. 🚁 资源调度模块 (优先级: 中)

**功能描述**: 智能资源配置调度系统

**核心组件**:
- `ResourcePanel.vue` - 资源面板组件
- `PersonnelManage.vue` - 人员管理组件
- `EquipmentManage.vue` - 装备管理组件

**主要功能**:
- ✅ 人员实时调配
- ✅ 装备状态监控
- ✅ 智能推荐引擎
- ✅ 路径规划优化
- ✅ 容量评估分析

**技术要点**:
- 资源状态实时更新
- 路径规划算法
- 推荐系统逻辑
- 容量计算模型
- 调度优化算法

### 5. 📹 通信协调模块 (优先级: 低)

**功能描述**: 多媒体指挥调度通信系统

**核心组件**:
- `VideoMonitor.vue` - 视频监控组件
- `MessageCenter.vue` - 消息中心组件
- `CommandPanel.vue` - 指令发布面板

**主要功能**:
- ✅ 通信状态监控
- ✅ 指令发布系统
- ✅ 视频监控集成
- ✅ 协同会商平台
- ✅ 信息共享中心

**技术要点**:
- WebRTC视频集成
- WebSocket实时通信
- 消息推送机制
- 文件上传下载
- 多媒体处理

### 6. ⚙️ 系统管理模块 (优先级: 低)

**功能描述**: 平台运维保障管理系统

**核心组件**:
- `SystemMonitor.vue` - 系统监控组件
- `UserManage.vue` - 用户管理组件
- `ConfigPanel.vue` - 配置管理面板

**主要功能**:
- ✅ 多屏显示支持
- ✅ 权限管理体系
- ✅ 系统监控告警
- ✅ 数据备份恢复
- ✅ 界面个性定制

**技术要点**:
- 响应式布局设计
- 权限控制系统
- 系统性能监控
- 主题切换功能
- 配置管理机制

## 📅 开发计划

### 第一阶段: 基础架构搭建 (3-4天)

**任务清单**:
- [x] 项目目录结构创建
- [ ] 基础依赖包安装配置
- [ ] TypeScript类型定义
- [ ] 路由配置设置
- [ ] 状态管理初始化
- [ ] 基础样式系统

**交付物**:
- 完整的项目架构
- 基础配置文件
- 开发环境搭建

### 第二阶段: 地图模块开发 (4-5天)

**任务清单**:
- [ ] 高德地图API集成
- [ ] 地图容器组件开发
- [ ] 事件标注功能实现
- [ ] 资源标注功能实现
- [ ] 地图交互功能
- [ ] 轨迹跟踪功能

**交付物**:
- 完整的地图展示系统
- 标注管理功能
- 地图交互体验

### 第三阶段: 数据监控开发 (3-4天)

**任务清单**:
- [ ] ECharts图表组件开发
- [ ] 数据面板布局设计
- [ ] 实时数据更新机制
- [ ] 图表交互功能
- [ ] 响应式图表适配

**交付物**:
- 数据可视化面板
- 多种图表组件
- 实时数据展示

### 第四阶段: 业务模块开发 (4-5天)

**任务清单**:
- [ ] 事件管理模块开发
- [ ] 资源调度模块开发
- [ ] 业务流程实现
- [ ] 数据交互逻辑
- [ ] 表单验证处理

**交付物**:
- 事件管理系统
- 资源调度系统
- 业务流程控制

### 第五阶段: 通信协调开发 (2-3天)

**任务清单**:
- [ ] 视频监控组件开发
- [ ] 消息中心实现
- [ ] WebSocket通信集成
- [ ] 指令发布功能
- [ ] 文件共享功能

**交付物**:
- 通信协调系统
- 实时消息功能
- 多媒体集成

### 第六阶段: 系统完善优化 (2-3天)

**任务清单**:
- [ ] 系统管理功能
- [ ] 权限控制实现
- [ ] 性能优化处理
- [ ] 响应式布局完善
- [ ] 测试用例编写
- [ ] 文档完善

**交付物**:
- 完整的应急调度系统
- 性能优化报告
- 测试文档

## 🛠️ 技术规范

### 开发规范

**命名规范**:
- 组件命名: PascalCase (如: `EmergencyDispatch`)
- 文件命名: kebab-case (如: `emergency-dispatch.vue`)
- API命名: camelCase (如: `getEmergencyEvents`)
- 常量命名: UPPER_SNAKE_CASE (如: `EVENT_TYPES`)

**代码规范**:
- 使用 ESLint + Prettier 代码格式化
- 严格的 TypeScript 类型检查
- Vue 3 Composition API 优先
- 组件 Props 必须定义类型
- 统一的错误处理机制

### 技术栈详情

**核心框架**:
- Vue 3.3+ (Composition API)
- TypeScript 5.0+
- Vite 4.0+ (构建工具)

**UI组件库**:
- Element Plus 2.3+
- 自定义组件样式
- 响应式设计支持

**地图服务**:
- 高德地图 JavaScript API 2.0
- 自定义标注和图层
- 地图事件处理

**图表库**:
- Apache ECharts 5.4+
- 响应式图表设计
- 自定义主题配置

**状态管理**:
- Pinia (Vue 3 官方推荐)
- 模块化状态管理
- 持久化存储支持

**网络请求**:
- Axios HTTP 客户端
- 请求拦截器配置
- 错误处理机制

**实时通信**:
- WebSocket 原生API
- 自动重连机制
- 消息队列处理

### 数据模型设计

```typescript
// 事件数据模型
interface EmergencyEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'processing' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  assignedResources: string[];
  reporter: {
    name: string;
    phone: string;
    department: string;
  };
  timeline: EventTimeline[];
}

// 资源数据模型
interface EmergencyResource {
  id: string;
  type: ResourceType;
  name: string;
  status: 'available' | 'busy' | 'offline' | 'maintenance';
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
  capacity: number;
  currentLoad: number;
  equipment: Equipment[];
  personnel: Personnel[];
  contact: {
    name: string;
    phone: string;
    radio: string;
  };
}

// 地图标注数据模型
interface MapMarker {
  id: string;
  type: 'event' | 'resource' | 'area';
  position: [number, number];
  title: string;
  content: string;
  icon: string;
  color: string;
  size: 'small' | 'medium' | 'large';
  clickable: boolean;
  draggable: boolean;
}
```

## 🎨 UI设计规范

### 色彩系统

**主色调**:
- 主色: #1890ff (蓝色 - 科技感)
- 成功: #52c41a (绿色 - 正常状态)
- 警告: #faad14 (橙色 - 注意状态)
- 危险: #ff4d4f (红色 - 紧急状态)
- 信息: #13c2c2 (青色 - 信息提示)

**状态色彩**:
- 待处理: #faad14 (橙色)
- 处理中: #1890ff (蓝色)
- 已完成: #52c41a (绿色)
- 已取消: #d9d9d9 (灰色)

**严重程度色彩**:
- 低: #52c41a (绿色)
- 中: #faad14 (橙色)
- 高: #ff7a45 (橙红色)
- 紧急: #ff4d4f (红色)

### 布局规范

**大屏布局** (1920x1080):
- 顶部导航: 80px
- 左侧面板: 320px
- 右侧面板: 320px
- 中央地图: 自适应
- 底部状态栏: 60px

**响应式断点**:
- 大屏: ≥1920px
- 桌面: 1200px - 1919px
- 平板: 768px - 1199px
- 手机: <768px

### 组件规范

**按钮规范**:
- 主要按钮: 蓝色背景，白色文字
- 次要按钮: 白色背景，蓝色边框
- 危险按钮: 红色背景，白色文字
- 按钮高度: 32px (默认), 40px (大), 24px (小)

**表格规范**:
- 表头背景: #fafafa
- 斑马纹: #f9f9f9
- 边框颜色: #e8e8e8
- 行高: 54px

**卡片规范**:
- 圆角: 6px
- 阴影: 0 2px 8px rgba(0,0,0,0.1)
- 内边距: 16px
- 边框: 1px solid #e8e8e8

## 📊 性能优化策略

### 地图性能优化

1. **标注聚合**: 大量标注点使用聚合显示
2. **懒加载**: 标注数据按需加载
3. **图层管理**: 合理控制图层显示层级
4. **缓存机制**: 地图瓦片和数据缓存
5. **防抖节流**: 地图事件处理优化

### 数据更新优化

1. **增量更新**: 只更新变化的数据
2. **虚拟滚动**: 大列表性能优化
3. **数据分页**: 合理的数据分页策略
4. **缓存策略**: 本地数据缓存机制
5. **请求合并**: 批量数据请求处理

### 组件优化

1. **按需加载**: 路由和组件懒加载
2. **组件缓存**: keep-alive 组件缓存
3. **计算属性**: 合理使用 computed
4. **事件优化**: 及时清理事件监听
5. **内存管理**: 避免内存泄漏

## 🧪 测试策略

### 单元测试

**测试框架**: Vitest + Vue Test Utils

**测试覆盖**:
- 组件渲染测试
- 组件交互测试
- 工具函数测试
- API接口测试
- 状态管理测试

**测试目标**: 代码覆盖率 ≥ 80%

### 集成测试

**测试内容**:
- 页面路由跳转
- 组件间数据传递
- API数据流测试
- 地图交互测试
- 实时数据更新测试

### 端到端测试

**测试工具**: Playwright

**测试场景**:
- 用户操作流程
- 关键业务场景
- 跨浏览器兼容性
- 性能基准测试

## 🚀 部署配置

### 开发环境

```bash
# 安装依赖
npm install
# 或
pnpm install

# 启动开发服务器
npm run dev

# 访问地址
http://localhost:3000
```

### 生产环境

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview

# 部署到服务器
npm run deploy
```

### 环境变量配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080/api
VITE_MAP_API_KEY=your_amap_api_key
VITE_WS_URL=ws://localhost:8080/ws

# .env.production
VITE_API_BASE_URL=https://api.emergency.com/api
VITE_MAP_API_KEY=your_production_amap_api_key
VITE_WS_URL=wss://api.emergency.com/ws
```

## 📚 开发指南

### 快速开始

1. **环境准备**:
   - Node.js 16+
   - npm 或 pnpm
   - VS Code (推荐)

2. **项目初始化**:
   ```bash
   git clone <repository>
   cd emergency-dispatch
   pnpm install
   ```

3. **开发调试**:
   ```bash
   pnpm dev
   ```

4. **代码提交**:
   ```bash
   pnpm lint
   pnpm test
   git commit -m "feat: add new feature"
   ```

### 常用命令

```bash
# 开发相关
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm preview      # 预览生产版本

# 代码质量
pnpm lint         # 代码检查
pnpm lint:fix     # 自动修复代码问题
pnpm format       # 代码格式化

# 测试相关
pnpm test         # 运行单元测试
pnpm test:watch   # 监听模式测试
pnpm test:coverage # 测试覆盖率报告
pnpm test:e2e     # 端到端测试

# 依赖管理
pnpm add <package>     # 添加依赖
pnpm remove <package>  # 移除依赖
pnpm update           # 更新依赖
```

### 开发规范

1. **Git提交规范**:
   - feat: 新功能
   - fix: 修复bug
   - docs: 文档更新
   - style: 代码格式调整
   - refactor: 代码重构
   - test: 测试相关
   - chore: 构建过程或辅助工具的变动

2. **分支管理**:
   - main: 主分支
   - develop: 开发分支
   - feature/*: 功能分支
   - hotfix/*: 热修复分支

3. **代码审查**:
   - 所有代码必须经过审查
   - 确保测试通过
   - 遵循编码规范

## 🔧 故障排除

### 常见问题

1. **地图不显示**:
   - 检查API密钥配置
   - 确认网络连接
   - 查看控制台错误信息

2. **图表渲染异常**:
   - 检查ECharts版本兼容性
   - 确认数据格式正确
   - 检查容器尺寸设置

3. **WebSocket连接失败**:
   - 检查服务器地址配置
   - 确认防火墙设置
   - 查看网络代理配置

4. **性能问题**:
   - 检查数据量大小
   - 优化组件渲染
   - 使用性能分析工具

### 调试技巧

1. **Vue DevTools**: 使用浏览器扩展调试Vue组件
2. **Network面板**: 监控网络请求状态
3. **Console日志**: 合理使用console.log调试
4. **Performance面板**: 分析性能瓶颈
5. **Memory面板**: 检查内存泄漏

## 📖 参考资料

### 官方文档

- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
- [Element Plus 组件库](https://element-plus.org/)
- [ECharts 图表库](https://echarts.apache.org/)
- [高德地图 JavaScript API](https://lbs.amap.com/api/javascript-api/)

### 技术博客

- Vue 3 最佳实践
- TypeScript 进阶指南
- 前端性能优化
- 地图应用开发
- 数据可视化设计

### 开源项目

- Vue 3 管理后台模板
- 地图应用示例
- 数据大屏项目
- 应急管理系统

---

**文档版本**: v1.0.0  
**创建时间**: 2024年1月  
**维护者**: Emergency Dispatch Development Team  
**最后更新**: 2024年1月

> 本文档将随着项目开发进度持续更新，请关注最新版本。