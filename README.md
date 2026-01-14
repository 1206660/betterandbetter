# BetterAndBetter - 家庭健康提醒应用

**GitHub**: https://github.com/1206660/betterandbetter

一个为老年人设计的健康提醒应用，包含 Pad 端展示页面和后端管理页面。

## 技术栈

- **前端框架**: Next.js 16+ (App Router)
- **UI框架**: Tailwind CSS + shadcn/ui
- **后端/数据库**: Supabase (PostgreSQL + Realtime)
- **部署**: Cloudflare Pages / Vercel
- **语言**: TypeScript
- **状态管理**: React Hooks + Supabase Realtime

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

## 部署选项

### Cloudflare Pages（推荐，国内访问更快）

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. 创建 Pages 项目并连接 GitHub 仓库
3. 配置构建设置：
   - **构建命令**: `CLOUDFLARE_PAGES=true npm install --legacy-peer-deps && npm run build`
   - **构建输出目录**: `out`
   - **根目录**: `/`
4. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `CLOUDFLARE_PAGES`: `true`

详细部署指南请参考：[CLOUDFLARE_PAGES_SETUP.md](./CLOUDFLARE_PAGES_SETUP.md)

### Vercel

详见下方"部署到 Vercel"章节。

## 注意事项

1. **可访问性**: 所有交互元素足够大，文字对比度符合 WCAG AA 标准
2. **性能**: Pad 端页面优化了长期运行的性能
3. **实时性**: 使用 Supabase Realtime 实现实时同步
4. **离线**: 使用 IndexedDB 缓存数据，支持离线查看
5. **安全性**: 输入验证和 XSS 防护

## 未来优化方向

### 1. 语音播报功能 🎙️

**目标**: 为视力不佳的老人提供语音提醒，提升无障碍体验。

**实现方案**:

#### 技术选型
- **Web Speech API**: 使用浏览器原生 `speechSynthesis` API 实现文本转语音
- **备选方案**: 集成第三方 TTS 服务（如 Azure Cognitive Services、Google Cloud TTS）

#### 功能设计
```typescript
// lib/voice.ts
export class VoiceService {
  // 播报提醒内容
  speak(text: string, options?: { rate?: number; pitch?: number }): void
  
  // 停止播报
  stop(): void
  
  // 检查浏览器支持
  isSupported(): boolean
}
```

#### 数据库扩展
- 在 `reminders` 表中添加 `voice_enabled` 布尔字段
- 添加 `voice_settings` JSONB 字段存储语音参数（语速、音调、音量）

#### 实现步骤
1. **Phase 1**: 基础语音播报
   - 创建 `lib/voice.ts` 语音服务
   - 在展示页面添加语音播报按钮
   - 提醒时间到达时自动播报

2. **Phase 2**: 语音设置
   - 在管理后台添加语音设置页面
   - 支持自定义语速、音调、音量
   - 支持选择不同语音（男声/女声）

3. **Phase 3**: 智能播报
   - 根据提醒类型选择不同的播报语气
   - 支持多语言播报
   - 添加语音确认功能（"已服药"语音确认）

#### 文件结构
```
lib/
  └── voice.ts              # 语音服务
components/
  └── display/
      └── VoiceButton.tsx   # 语音控制按钮
app/
  └── admin/
      └── voice-settings/   # 语音设置页面
```

---

### 2. 多设备同步 📱

**目标**: 老人可在不同设备（Pad、手机、智能电视）上查看任务，数据实时同步。

**实现方案**:

#### 技术选型
- **Supabase Realtime**: 已集成，支持实时数据同步
- **Service Worker**: 实现跨设备推送通知
- **Web Push API**: 浏览器推送通知

#### 功能设计
```typescript
// lib/sync.ts
export class MultiDeviceSync {
  // 注册设备
  registerDevice(deviceInfo: DeviceInfo): Promise<void>
  
  // 获取所有设备
  getDevices(): Promise<Device[]>
  
  // 同步数据
  syncData(): Promise<void>
}
```

#### 数据库扩展
```sql
-- 设备表
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL, -- 'pad', 'phone', 'tv'
  push_token TEXT,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户表（如果还没有）
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 实现步骤
1. **Phase 1**: 设备识别与注册
   - 创建设备表
   - 实现设备自动识别（User-Agent、屏幕尺寸）
   - 设备注册流程

2. **Phase 2**: 跨设备数据同步
   - 利用 Supabase Realtime 实现实时同步
   - 添加冲突解决机制（最后写入优先）
   - 显示设备在线状态

3. **Phase 3**: 推送通知
   - 实现 Web Push API
   - 跨设备推送提醒通知
   - 设备离线时队列通知

#### 文件结构
```
lib/
  └── sync.ts              # 多设备同步服务
components/
  └── admin/
      └── DevicesList.tsx  # 设备管理组件
app/
  └── admin/
      └── devices/         # 设备管理页面
```

---

### 3. 健康数据记录功能 📊

**目标**: 记录血压、血糖等健康数据，形成健康档案，便于追踪和医疗参考。

**实现方案**:

#### 技术选型
- **Chart.js / Recharts**: 数据可视化图表
- **Supabase Storage**: 存储健康报告图片
- **日期选择器**: 选择记录日期

#### 功能设计
```typescript
// lib/health.ts
export interface HealthRecord {
  id: string
  type: 'blood_pressure' | 'blood_sugar' | 'weight' | 'temperature' | 'custom'
  value: number
  unit: string
  notes?: string
  recorded_at: Date
  created_at: Date
}
```

#### 数据库扩展
```sql
-- 健康记录表
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL CHECK (type IN ('blood_pressure', 'blood_sugar', 'weight', 'temperature', 'custom')),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 健康档案表（汇总数据）
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  profile_data JSONB NOT NULL, -- 存储各种健康指标的历史数据
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 实现步骤
1. **Phase 1**: 基础数据记录
   - 创建健康记录表
   - 实现数据录入表单（血压、血糖、体重等）
   - 数据列表展示

2. **Phase 2**: 数据可视化
   - 集成图表库（Recharts）
   - 实现趋势图表（血压趋势、血糖趋势）
   - 添加数据统计（平均值、最高值、最低值）

3. **Phase 3**: 健康档案
   - 生成健康报告
   - 导出 PDF 功能
   - 数据异常提醒（如血压过高）

#### 文件结构
```
lib/
  └── health.ts            # 健康数据服务
components/
  ├── health/
  │   ├── RecordForm.tsx   # 记录表单
  │   ├── HealthChart.tsx # 健康图表
  │   └── HealthStats.tsx # 健康统计
app/
  ├── health/             # 健康数据页面
  │   ├── record/         # 记录页面
  │   ├── chart/          # 图表页面
  │   └── profile/        # 健康档案页面
  └── admin/
      └── health/         # 健康数据管理
```

---

### 4. AI 智能推荐 🤖

**目标**: 根据老人健康数据自动调整提醒内容，提供个性化健康建议。

**实现方案**:

#### 技术选型
- **OpenAI API / Anthropic Claude**: 大语言模型 API
- **Supabase Edge Functions**: 服务端 AI 调用
- **规则引擎**: 基于健康数据的规则判断

#### 功能设计
```typescript
// lib/ai.ts
export class AIRecommendationService {
  // 生成个性化提醒
  generateReminder(healthData: HealthData): Promise<Reminder>
  
  // 分析健康趋势
  analyzeHealthTrend(records: HealthRecord[]): Promise<Analysis>
  
  // 生成健康建议
  generateAdvice(profile: HealthProfile): Promise<string[]>
}
```

#### 数据库扩展
```sql
-- AI 推荐记录表
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  recommendation_type TEXT NOT NULL, -- 'reminder', 'advice', 'alert'
  content TEXT NOT NULL,
  confidence_score NUMERIC, -- 0-1
  source_data JSONB, -- 生成推荐的数据来源
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 规则配置表
CREATE TABLE ai_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT NOT NULL,
  condition JSONB NOT NULL, -- 规则条件
  action JSONB NOT NULL,    -- 规则动作
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 实现步骤
1. **Phase 1**: 规则引擎
   - 实现基础规则引擎
   - 基于健康数据触发规则（如：血压 > 140 时增加提醒频率）
   - 规则配置界面

2. **Phase 2**: AI 集成
   - 集成 OpenAI/Claude API
   - 实现健康数据分析
   - 生成个性化提醒内容

3. **Phase 3**: 智能学习
   - 记录用户反馈（接受/拒绝推荐）
   - 优化推荐算法
   - 个性化模型训练

#### 文件结构
```
lib/
  ├── ai.ts               # AI 服务
  └── rules.ts            # 规则引擎
components/
  └── ai/
      ├── RecommendationCard.tsx
      └── AISettings.tsx
app/
  └── admin/
      └── ai/             # AI 设置页面
supabase/
  └── functions/
      └── ai-recommend/   # Edge Function
```

---

## 开发路线图

### 短期目标（1-2个月）
- [ ] 语音播报功能（Phase 1）
- [ ] 多设备同步（Phase 1）
- [ ] 健康数据记录（Phase 1）

### 中期目标（3-4个月）
- [ ] 语音播报功能（Phase 2-3）
- [ ] 多设备同步（Phase 2-3）
- [ ] 健康数据可视化（Phase 2）
- [ ] AI 智能推荐（Phase 1）

### 长期目标（6个月+）
- [ ] 健康档案完整功能
- [ ] AI 智能推荐（Phase 2-3）
- [ ] 多语言支持
- [ ] 医疗设备集成（血压计、血糖仪等）

---

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License
