# 双色球中奖查询 Web 应用

一个现代化的双色球中奖查询前端应用，使用 H5、TypeScript 和 CSS 构建。

## 功能特性

- 🎯 直观的双色球号码选择界面
- 🔍 查询历史开奖中的中奖情况
- 📊 实时显示数据库统计信息
- 📱 响应式设计，支持移动端
- ⚡ 现代化的 UI/UX 设计
- 🎨 美观的渐变背景和动画效果

## 技术栈

- **HTML5**: 语义化标签和现代 Web 标准
- **TypeScript**: 类型安全的 JavaScript
- **CSS3**: 现代化样式，包含渐变、动画和响应式设计
- **Fetch API**: 异步数据请求

## 快速开始

### 前置要求

1. 确保 `lottery_server` 服务正在运行（默认端口 8000）
2. 安装 Node.js 和 npm

### 安装依赖

```bash
npm install
```

### 编译 TypeScript

```bash
# 一次性编译
npm run build

# 监听文件变化并自动编译
npm run watch
```

## 项目结构

```
lottery_web/
├── index.html          # 主页面
├── styles.css          # 样式文件
├── app.ts              # TypeScript 源代码
├── app.js              # 编译后的 JavaScript（自动生成）
├── package.json        # 项目配置
├── tsconfig.json       # TypeScript 配置
└── README.md           # 项目说明
```

## API 接口

应用会调用以下 `lottery_server` 的 API 接口：

- `GET /api/statistics` - 获取数据库统计信息
- `POST /api/check-prize` - 查询中奖情况

## 使用说明

1. **选择号码**: 点击红球和蓝球进行选择
   - 红球：必须选择 6 个（1-33）
   - 蓝球：必须选择 1 个（1-16）

2. **查询结果**: 点击"查询中奖情况"按钮
   - 系统会检查您的号码在历史开奖中的中奖情况
   - 只显示一等奖和二等奖的中奖记录

3. **查看统计**: 页面底部显示数据库的统计信息
   - 总开奖期数
   - 一等奖和二等奖的次数

## 开发说明

### 修改样式

编辑 `styles.css` 文件，支持：
- CSS Grid 和 Flexbox 布局
- CSS 变量和自定义属性
- 响应式媒体查询
- 动画和过渡效果

### 修改逻辑

编辑 `app.ts` 文件，包含：
- TypeScript 类型定义
- 面向对象的类设计
- 异步 API 调用
- DOM 操作和事件处理

### 编译配置

修改 `tsconfig.json` 可以调整：
- TypeScript 编译目标
- 严格模式设置
- 输出目录配置

## 浏览器支持

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 许可证

MIT License 