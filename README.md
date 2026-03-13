# 脉轮能量测试

<div align="center">

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black.svg)
![React](https://img.shields.io/badge/React-19.0.0-blue.svg)

探索你的七大脉轮能量状态，了解身心灵的平衡与和谐

[在线体验](#) • [快速开始](#快速开始) • [功能特点](#功能特点) • [技术栈](#技术栈)

</div>

## 📖 项目介绍

脉轮能量测试是一个基于现代 Web 技术构建的交互式心理测试应用。通过 56 道精心设计的问题，帮助用户了解自己七大脉轮的能量状态，包括根轮、脐轮、太阳神经丛、心轮、喉轮、眉心轮和顶轮。

### ✨ 主要特点

- 🎨 **精美界面** - 采用现代化设计语言，渐变色彩搭配，流畅动画效果
- 💾 **进度保存** - 支持临时退出，自动保存测试进度，随时继续
- 📊 **数据可视化** - 提供条形图和雷达图双重展示，直观呈现脉轮状态
- 📱 **响应式设计** - 完美适配桌面端和移动端设备
- 🔄 **分享功能** - 一键分享测试结果给好友
- 🌙 **主题切换** - 支持明暗主题切换
- 🌍 **国际化支持** - 内置多语言支持

## 🚀 快速开始

### 环境要求

- Node.js 18.x 或更高版本
- Bun 或 npm/yarn/pnpm
- Git

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/imyexi/chakras-yuanstudio.git
cd chakras-yuanstudio
```

2. **安装依赖**

```bash
# 使用 bun（推荐）
bun install

# 或使用 npm
npm install

# 或使用 yarn
yarn install

# 或使用 pnpm
pnpm install
```

3. **配置环境变量**

复制 `.env` 文件并根据需要修改配置：

```bash
cp .env.example .env
```

4. **初始化数据库**

```bash
bun run db:generate
bun run db:push
```

5. **启动开发服务器**

```bash
bun run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可体验应用。

### 构建生产版本

```bash
# 构建应用
bun run build

# 启动生产服务器
bun run start
```

## 🎯 功能特点

### 1. 脉轮测试系统
- **七大脉轮评估** - 全面评估根轮到顶轮的能量状态
- **56道专业问题** - 涵盖身体、情绪、心理等多个维度
- **智能计分系统** - 科学的评分算法，准确反映脉轮状态

### 2. 用户体验优化
- **自动保存进度** - 基于 localStorage 的进度保存机制
- **流畅动画效果** - 使用 Framer Motion 实现的精致动画
- **直观的导航** - 清晰的进度指示和问题导航

### 3. 结果分析展示
- **能量柱状图** - 水平条形图展示各脉轮能量值
- **能量雷达图** - 多维度雷达图呈现整体能量分布
- **详细解读** - 提供每个脉轮的详细解读和建议

### 4. 社交分享功能
- **一键分享** - 快速复制链接分享给好友
- **二维码支持** - 内置二维码，方便扫码联系

## 🛠️ 技术栈

### 核心框架
- **Next.js 16.1.1** - React 全栈框架
- **React 19.0.0** - 用户界面库
- **TypeScript** - 类型安全的 JavaScript 超集

### 样式和UI
- **Tailwind CSS 4** - 原子化 CSS 框架
- **shadcn/ui** - 高质量的 React 组件库
- **Framer Motion** - 声明式动画库
- **Radix UI** - 无样式的可访问组件库

### 数据管理
- **Prisma** - 现代化的数据库 ORM
- **Zustand** - 轻量级状态管理库
- **React Hook Form** - 高性能表单库
- **Zod** - TypeScript 优先的模式验证库

### 数据可视化
- **Recharts** - 基于 React 的图表库
- **React Syntax Highlighter** - 代码高亮显示

### 工具库
- **date-fns** - 现代化的日期处理库
- **Lucide React** - 精美的图标库
- **next-intl** - Next.js 国际化解决方案
- **next-auth** - Next.js 认证解决方案
- **@tanstack/react-query** - 强大的数据同步库

### 开发工具
- **ESLint** - 代码质量检查工具
- **TypeScript** - 静态类型检查
- **Bun** - 快速的 JavaScript 运行时和包管理器

## 📁 项目结构

```
chakras-yuanstudio/
├── src/
│   ├── app/              # Next.js 应用路由
│   │   ├── api/          # API 路由
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 主页面
│   ├── components/       # React 组件
│   │   └── ui/           # UI 组件库
│   └── lib/              # 工具函数和库
├── prisma/               # Prisma 配置和迁移
├── public/               # 静态资源
├── .env                  # 环境变量
├── next.config.ts        # Next.js 配置
├── tailwind.config.ts    # Tailwind CSS 配置
└── tsconfig.json         # TypeScript 配置
```

## 🔧 开发指南

### 可用脚本

```bash
# 开发模式（端口 3000）
bun run dev

# 生产构建
bun run build

# 启动生产服务器
bun run start

# 代码检查
bun run lint

# 数据库操作
bun run db:push        # 推送数据库模式
bun run db:generate    # 生成 Prisma Client
bun run db:migrate     # 运行数据库迁移
bun run db:reset       # 重置数据库
```

### 添加新功能

1. 在 `src/components` 中创建新组件
2. 在 `src/lib` 中添加工具函数
3. 更新 `src/app` 中的页面和路由
4. 运行 `bun run lint` 确保代码质量

### 代码风格

项目使用 ESLint 进行代码检查，提交前请确保：

```bash
bun run lint
```

## 🤝 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 开发规范

- 遵循现有代码风格
- 编写有意义的提交信息
- 为新功能添加测试
- 更新相关文档

## 📝 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

**imyexi** - [GitHub](https://github.com/imyexi)

## 📮 联系方式

- 邮箱: crystalelf@gmail.com
- 项目地址: [https://github.com/imyexi/chakras-yuanstudio](https://github.com/imyexi/chakras-yuanstudio)

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Radix UI](https://www.radix-ui.com/) - 无样式组件库
- [Framer Motion](https://www.framer.com/motion/) - 动画库

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给个 Star ⭐**

Made with ❤️ by @imyexi

</div>
