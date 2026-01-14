# 部署指南

**GitHub 仓库**: https://github.com/1206660/betterandbetter.git

## 快速部署

### 一键部署（Windows）

```powershell
.\scripts\deploy.ps1
```

### 一键部署（Linux/Mac）

```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

## 详细步骤

### 1. 准备工作

确保你已经：
- ✅ 完成 Supabase 数据库设置
- ✅ 配置好 `.env.local` 文件
- ✅ 本地测试通过

### 2. 安装 Vercel CLI

```bash
npm install -g vercel
```

### 3. 登录 Vercel

```bash
vercel login
```

会打开浏览器，使用 GitHub/Google/GitLab 账号登录。

### 4. 首次部署

在项目根目录执行：

```bash
vercel
```

按照提示：
- 选择项目范围（个人或团队）
- 确认项目名称
- 确认配置

### 5. 配置环境变量

访问 Vercel Dashboard：
1. 进入项目设置：https://vercel.com/dashboard
2. 点击 Settings > Environment Variables
3. 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_xxx` | Supabase Anon Key |

4. 选择环境：Production, Preview, Development（全选）
5. 点击 Save

### 6. 部署到生产环境

```bash
vercel --prod
```

或者使用 npm 脚本：

```bash
npm run deploy
```

### 7. 验证部署

部署完成后，Vercel 会提供一个 URL，例如：
- `https://betterandbetter.vercel.app`

访问该 URL 验证应用是否正常运行。

## 自动部署（GitHub Actions）

### 设置 GitHub Secrets

在 GitHub 仓库中添加以下 Secrets：

1. **VERCEL_TOKEN**
   - 获取方式：https://vercel.com/account/tokens
   - 点击 "Create Token"
   - 复制生成的 token

2. **VERCEL_ORG_ID**
   - 获取方式：https://vercel.com/dashboard
   - Settings > General
   - 复制 Organization ID

3. **VERCEL_PROJECT_ID**
   - 首次部署后，在项目 Settings > General 中获取
   - 或从 `.vercel/project.json` 文件中获取

4. **NEXT_PUBLIC_SUPABASE_URL**
   - 你的 Supabase 项目 URL

5. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - 你的 Supabase Anon Key

### 自动部署流程

1. 推送代码到 `main` 或 `master` 分支
2. GitHub Actions 自动触发
3. 构建项目
4. 部署到 Vercel 生产环境

## 更新部署

### 手动更新

```bash
npm run deploy
```

### 自动更新

推送代码到 GitHub，自动触发部署。

## 预览部署

在合并到主分支前，可以先预览：

```bash
npm run deploy:preview
```

或：

```bash
vercel
```

这会创建一个预览 URL，不影响生产环境。

## 常见问题

### 1. 环境变量未生效

- 确保在 Vercel Dashboard 中正确配置
- 重新部署项目
- 检查变量名是否正确（区分大小写）

### 2. 构建失败

- 检查 `package.json` 中的依赖
- 查看 Vercel 构建日志
- 确保所有环境变量都已配置

### 3. 数据库连接失败

- 检查 Supabase 项目是否正常运行
- 确认环境变量中的 URL 和 Key 正确
- 检查 Supabase RLS 策略

### 4. 自定义域名

1. 在 Vercel Dashboard > Settings > Domains
2. 添加你的域名
3. 按照提示配置 DNS 记录

## 回滚部署

如果需要回滚到之前的版本：

1. 访问 Vercel Dashboard
2. 进入 Deployments
3. 找到要回滚的版本
4. 点击 "..." > "Promote to Production"

## 监控和分析

Vercel 提供：
- 实时日志
- 性能分析
- 错误追踪
- 访问统计

访问项目 Dashboard 查看详细信息。
