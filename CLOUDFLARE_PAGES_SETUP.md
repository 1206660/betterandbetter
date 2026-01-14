# Cloudflare Pages 正确设置指南

## ⚠️ 重要：使用 Pages，不是 Workers

你的项目是 Next.js 应用，应该使用 **Cloudflare Pages**，而不是 **Cloudflare Workers**。

Workers 用于运行 JavaScript 函数，Pages 用于部署 Next.js 等静态/SSG 应用。

## 正确的设置步骤

### 1. 创建 Pages 项目（不是 Workers）

1. 访问：https://dash.cloudflare.com
2. 点击左侧菜单 **"Workers 和 Pages"** (Workers and Pages)
3. 点击 **"创建应用程序"** (Create application)
4. 选择 **"Pages"**（不是 Workers）
5. 选择 **"连接到 Git"** (Connect to Git)
6. 选择 GitHub，授权访问
7. 选择仓库：`1206660/betterandbetter`
8. 点击 **"开始设置"** (Begin setup)

### 2. 配置构建设置

在设置页面中配置：

- **项目名称** (Project name): `betterandbetter`
- **生产分支** (Production branch): `main`
- **框架预设** (Framework preset): `Next.js`
- **构建命令** (Build command): `npm install && npm run build`
- **构建输出目录** (Build output directory): `.next`
- **根目录** (Root directory): （留空）

### 3. 添加环境变量

在项目设置 > Environment variables 中添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fanpgiptyqupseikdczv.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_teJPIzQyJWIJkU9QzFUdTA_qSFb4K18` | Production, Preview |

### 4. 部署

点击 **"保存并部署"** (Save and Deploy)

## 如何区分 Workers 和 Pages

- **Workers**: 
  - URL 包含 `/workers/services/`
  - 有 "部署命令" (Deploy Command) 字段
  - 用于运行 JavaScript 函数

- **Pages**:
  - URL 包含 `/pages/`
  - 有 "构建命令" (Build Command) 字段
  - 用于部署静态网站和 Next.js 应用

## 如果已经创建了 Workers

1. 可以删除 Workers 项目（如果不需要）
2. 重新创建 Pages 项目（按照上面的步骤）

## 正确的 Pages 项目 URL 格式

应该是：
```
https://dash.cloudflare.com/.../pages/view/betterandbetter
```

而不是：
```
https://dash.cloudflare.com/.../workers/services/view/betterandbetter
```
