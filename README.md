# BetterAndBetter - 家庭健康提醒应用

一个为老年人设计的健康提醒应用，包含 Pad 端展示页面和后端管理页面。

## 技术栈

- **前端框架**: Next.js 14+ (App Router)
- **UI框架**: Tailwind CSS + shadcn/ui
- **后端/数据库**: Supabase (PostgreSQL + Realtime)
- **部署**: Vercel

## 功能特性

- ✅ 老人 Pad 端展示页面（大字体、高对比度）
- ✅ 管理后台（创建、编辑、删除提醒）
- ✅ 实时预览功能
- ✅ Supabase Realtime 实时同步
- ✅ 离线支持（IndexedDB 缓存）
- ✅ 响应式设计
- ✅ 无障碍性支持

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置 Supabase

1. 复制环境变量模板：
   ```bash
   cp env.example .env.local
   ```

2. 在 Supabase 项目设置中获取配置：
   - 访问：https://app.supabase.com/project/YOUR_PROJECT/settings/api
   - 复制 `Project URL` 到 `NEXT_PUBLIC_SUPABASE_URL`
   - 复制 `anon public` key 到 `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. 编辑 `.env.local` 文件，填入你的 Supabase 配置

### 3. 创建数据库表

在 Supabase SQL Editor 中执行 `supabase/migrations/001_create_reminders_table.sql` 文件中的 SQL：

```sql
CREATE TABLE IF NOT EXISTS reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('medication', 'checkup', 'test', 'other')),
  description TEXT,
  time_slots JSONB NOT NULL DEFAULT '[]'::jsonb,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'custom')),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON reminders FOR ALL USING (true);
```

### 4. 运行开发服务器

```bash
npm run dev
```

### 5. 访问应用

- **首页**: http://localhost:3000
- **展示页面**: http://localhost:3000/display
- **管理后台**: http://localhost:3000/admin
- **实时预览**: http://localhost:3000/admin/preview
- **测试页面**: http://localhost:3000/test

## 项目结构

```
betterandbetter/
├── app/
│   ├── display/           # 老人 Pad 端展示页面
│   ├── admin/             # 管理后台
│   │   ├── reminders/      # 提醒管理
│   │   └── preview/        # 实时预览
│   └── test/               # 测试页面
├── components/
│   ├── display/             # 展示页面组件
│   ├── admin/               # 管理页面组件
│   └── ui/                  # shadcn/ui 组件
├── lib/
│   ├── supabase/           # Supabase 客户端
│   ├── offline.ts          # 离线缓存工具
│   └── types.ts            # 类型定义
├── types/
│   └── database.ts         # 数据库类型
└── supabase/
    └── migrations/         # 数据库迁移文件
```

## 设计系统

- **字体**: Lexend (标题) + Source Sans 3 (正文)
- **颜色方案**: Healthcare App 配色
  - Primary: #0891B2 (Calm Blue)
  - Secondary: #22D3EE
  - CTA: #059669 (Health Green)
  - Background: #ECFEFF
  - Text: #164E63

## 部署到 Vercel

### 方法一：使用 Vercel CLI（推荐，一键部署）

#### Windows (PowerShell)
```powershell
.\scripts\deploy.ps1
```

#### Linux/Mac
```bash
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

#### 手动步骤
1. 安装 Vercel CLI（如果未安装）：
   ```bash
   npm install -g vercel
   ```

2. 登录 Vercel：
   ```bash
   vercel login
   ```

3. 部署到生产环境：
   ```bash
   vercel --prod
   ```

4. 在 Vercel Dashboard 中配置环境变量：
   - 访问：https://vercel.com/dashboard
   - 选择项目 > Settings > Environment Variables
   - 添加以下变量：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - 重新部署以应用环境变量

### 方法二：使用 GitHub Actions（自动部署）

1. 在 GitHub 仓库中添加 Secrets：
   - `VERCEL_TOKEN` - 从 Vercel Dashboard > Settings > Tokens 获取
   - `VERCEL_ORG_ID` - 从 Vercel Dashboard > Settings > General 获取
   - `VERCEL_PROJECT_ID` - 首次部署后从项目设置获取
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase 项目 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anon Key

2. 推送代码到 main/master 分支，自动触发部署

### 方法三：通过 Vercel Dashboard

1. 访问 https://vercel.com/new
2. 导入 GitHub/GitLab/Bitbucket 仓库
3. 配置项目：
   - Framework Preset: Next.js
   - Root Directory: `./betterandbetter`（如果项目在子目录）
4. 添加环境变量（同方法一）
5. 点击 Deploy

### 获取 Vercel Token

1. 访问：https://vercel.com/account/tokens
2. 点击 "Create Token"
3. 输入名称，选择过期时间
4. 复制生成的 token

## 开发计划

- [x] 项目初始化
- [x] Supabase 连接配置
- [x] 数据库表设计
- [x] Pad 端展示页面
- [x] 管理页面
- [x] 实时预览功能
- [x] 离线支持
- [x] 响应式设计和优化

## 注意事项

1. **可访问性**: 所有交互元素足够大，文字对比度符合 WCAG AA 标准
2. **性能**: Pad 端页面优化了长期运行的性能
3. **实时性**: 使用 Supabase Realtime 实现实时同步
4. **离线**: 使用 IndexedDB 缓存数据，支持离线查看
5. **安全性**: 输入验证和 XSS 防护
