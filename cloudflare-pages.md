# Cloudflare Pages 部署指南

## ⚠️ 重要：使用 Pages，不是 Workers

**Next.js 项目必须使用 Cloudflare Pages，不是 Workers！**

- ❌ Workers：用于运行 JavaScript 函数，不适合 Next.js
- ✅ Pages：用于部署 Next.js、静态网站等

## 快速部署（推荐，国内可访问）

### 1. 访问 Cloudflare Dashboard

访问：https://dash.cloudflare.com

### 2. 创建 Pages 项目（重要：选择 Pages）

1. 点击左侧菜单 **"Workers 和 Pages"** (Workers and Pages)
2. 点击 **"创建应用程序"** (Create application)
3. **重要**：选择 **"Pages"**（不是 Workers！）
4. 选择 **"连接到 Git"** (Connect to Git)
5. 选择 GitHub，授权访问
6. 选择仓库：`1206660/betterandbetter`
7. 点击 **"开始设置"** (Begin setup)

### 3. 配置构建设置

- **Project name**: `betterandbetter`（或自定义）
- **Production branch**: `main`
- **Framework preset**: `Next.js`
- **Build command**: `npm install --legacy-peer-deps && npm run build`
- **Build output directory**: `.next`
- **Root directory**: （留空，项目在根目录）
- **Install command**: （留空，让 Cloudflare 使用默认安装）

**重要**：如果遇到 `npm ci` 错误：
1. 确保 Build command 使用 `npm install` 而不是 `npm ci`
2. 添加 `--legacy-peer-deps` 标志
3. 或者使用构建脚本：`bash _cloudflare_build.sh`

**环境变量**（可选）：
- `NPM_FLAGS`: `--legacy-peer-deps`

### 4. 配置环境变量

在项目设置中添加环境变量：

1. 进入项目 > Settings > Environment variables
2. 添加以下变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fanpgiptyqupseikdczv.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_teJPIzQyJWIJkU9QzFUdTA_qSFb4K18` | Production, Preview |

3. 点击 "Save"

### 5. 部署

点击 "Save and Deploy"，等待部署完成。

### 6. 访问应用

部署完成后，你会得到一个 URL，例如：
- `https://betterandbetter.pages.dev`

## 自动部署

每次推送到 `main` 分支，Cloudflare Pages 会自动重新部署。

## 自定义域名

1. 在项目设置 > Custom domains
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 优势

- ✅ 完全免费
- ✅ 国内访问相对稳定
- ✅ 自动 HTTPS
- ✅ 全球 CDN
- ✅ 自动部署
