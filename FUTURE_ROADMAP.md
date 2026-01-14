# BetterAndBetter 未来优化路线图

本文档详细描述了 BetterAndBetter 项目的未来优化方向和实现方案。

## 目录

1. [语音播报功能](#1-语音播报功能)
2. [多设备同步](#2-多设备同步)
3. [健康数据记录功能](#3-健康数据记录功能)
4. [AI 智能推荐](#4-ai-智能推荐)

---

## 1. 语音播报功能 🎙️

### 1.1 目标

为视力不佳的老人提供语音提醒功能，提升无障碍体验，让老人无需看屏幕也能接收提醒。

### 1.2 技术选型

#### 主要方案：Web Speech API
- **优点**: 
  - 浏览器原生支持，无需额外依赖
  - 免费使用
  - 支持多种语言和语音
- **缺点**: 
  - 语音质量一般
  - 浏览器兼容性有限

#### 备选方案：第三方 TTS 服务
- **Azure Cognitive Services**: 高质量语音，支持多种语言
- **Google Cloud TTS**: 自然语音合成
- **Amazon Polly**: AWS 语音服务

### 1.3 功能设计

#### 核心功能
1. **自动播报**: 提醒时间到达时自动语音播报
2. **手动播报**: 点击按钮重新播报
3. **语音设置**: 自定义语速、音调、音量
4. **语音确认**: 支持语音确认操作（如"已服药"）

#### API 设计
```typescript
// lib/voice.ts
export class VoiceService {
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  /**
   * 播报文本
   * @param text 要播报的文本
   * @param options 播报选项
   */
  speak(
    text: string,
    options?: {
      rate?: number;      // 语速 0.1-10，默认 1
      pitch?: number;     // 音调 0-2，默认 1
      volume?: number;    // 音量 0-1，默认 1
      lang?: string;      // 语言代码，默认 'zh-CN'
      voice?: SpeechSynthesisVoice; // 语音对象
    }
  ): Promise<void>

  /**
   * 停止播报
   */
  stop(): void

  /**
   * 检查浏览器是否支持语音合成
   */
  isSupported(): boolean

  /**
   * 获取可用的语音列表
   */
  getVoices(): SpeechSynthesisVoice[]

  /**
   * 播报提醒内容
   */
  speakReminder(reminder: Reminder): Promise<void>
}
```

### 1.4 数据库扩展

```sql
-- 在 reminders 表中添加语音相关字段
ALTER TABLE reminders 
ADD COLUMN voice_enabled BOOLEAN DEFAULT true,
ADD COLUMN voice_settings JSONB DEFAULT '{
  "rate": 1,
  "pitch": 1,
  "volume": 1,
  "lang": "zh-CN"
}'::jsonb;

-- 语音播报记录表（可选，用于统计）
CREATE TABLE voice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID REFERENCES reminders(id),
  text TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER -- 播报时长（毫秒）
);
```

### 1.5 实现步骤

#### Phase 1: 基础语音播报（2周）
- [ ] 创建 `lib/voice.ts` 语音服务类
- [ ] 实现基础 `speak()` 和 `stop()` 方法
- [ ] 在展示页面添加语音播报按钮
- [ ] 提醒时间到达时自动播报
- [ ] 添加浏览器兼容性检查

#### Phase 2: 语音设置（2周）
- [ ] 创建语音设置页面 `/admin/voice-settings`
- [ ] 实现语速、音调、音量调节
- [ ] 支持选择不同语音（男声/女声）
- [ ] 保存设置到数据库
- [ ] 在展示页面应用设置

#### Phase 3: 智能播报（2周）
- [ ] 根据提醒类型选择不同语气
- [ ] 支持多语言播报
- [ ] 实现语音确认功能
- [ ] 添加播报历史记录
- [ ] 优化播报体验（避免打断、队列管理）

### 1.6 文件结构

```
lib/
  └── voice.ts                    # 语音服务核心类
components/
  └── display/
      ├── VoiceButton.tsx         # 语音控制按钮
      └── VoiceSettings.tsx       # 语音设置组件
app/
  └── admin/
      └── voice-settings/
          └── page.tsx            # 语音设置页面
types/
  └── voice.ts                    # 语音相关类型定义
```

### 1.7 用户体验设计

- **自动播报**: 提醒时间到达时，自动播放语音，无需用户操作
- **重复播报**: 支持点击按钮重复播报，方便老人听清楚
- **音量控制**: 在展示页面提供大按钮音量调节
- **语音反馈**: 操作后提供语音反馈（如"已确认"）

---

## 2. 多设备同步 📱

### 2.1 目标

老人可在不同设备（Pad、手机、智能电视）上查看任务，数据实时同步，确保信息一致性。

### 2.2 技术选型

#### 核心技术
- **Supabase Realtime**: 已集成，支持实时数据同步
- **Service Worker**: 实现离线同步和推送
- **Web Push API**: 跨设备推送通知
- **IndexedDB**: 本地数据缓存

#### 设备识别
- **User-Agent**: 识别设备类型
- **屏幕尺寸**: 区分 Pad/手机/电视
- **设备指纹**: 唯一标识设备

### 2.3 功能设计

#### 核心功能
1. **设备注册**: 自动识别并注册设备
2. **实时同步**: 多设备数据实时同步
3. **设备管理**: 查看和管理所有设备
4. **推送通知**: 跨设备推送提醒
5. **离线同步**: 设备离线时队列同步

#### API 设计
```typescript
// lib/sync.ts
export interface DeviceInfo {
  id: string
  name: string
  type: 'pad' | 'phone' | 'tv' | 'desktop'
  userAgent: string
  screenSize: { width: number; height: number }
  pushToken?: string
  lastSeen: Date
}

export class MultiDeviceSync {
  /**
   * 注册当前设备
   */
  registerDevice(): Promise<DeviceInfo>

  /**
   * 获取所有已注册设备
   */
  getDevices(): Promise<DeviceInfo[]>

  /**
   * 同步数据到所有设备
   */
  syncData(data: any): Promise<void>

  /**
   * 发送推送通知到指定设备
   */
  sendPushNotification(deviceId: string, notification: Notification): Promise<void>

  /**
   * 处理离线队列
   */
  processOfflineQueue(): Promise<void>
}
```

### 2.4 数据库扩展

```sql
-- 用户表（如果还没有）
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 设备表
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  device_name TEXT NOT NULL,
  device_type TEXT NOT NULL CHECK (device_type IN ('pad', 'phone', 'tv', 'desktop')),
  user_agent TEXT,
  screen_width INTEGER,
  screen_height INTEGER,
  push_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 同步日志表（用于调试和审计）
CREATE TABLE sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id),
  action TEXT NOT NULL, -- 'create', 'update', 'delete'
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW()
);

-- 离线队列表
CREATE TABLE offline_queue (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID REFERENCES devices(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  synced_at TIMESTAMPTZ
);
```

### 2.5 实现步骤

#### Phase 1: 设备识别与注册（2周）
- [ ] 创建用户表和设备表
- [ ] 实现设备自动识别逻辑
- [ ] 创建设备注册流程
- [ ] 实现设备列表展示
- [ ] 添加设备管理功能（重命名、删除）

#### Phase 2: 跨设备数据同步（3周）
- [ ] 利用 Supabase Realtime 实现实时同步
- [ ] 实现冲突解决机制（最后写入优先）
- [ ] 添加同步状态指示器
- [ ] 实现数据版本控制
- [ ] 添加同步日志记录

#### Phase 3: 推送通知（3周）
- [ ] 实现 Web Push API
- [ ] 配置 Service Worker
- [ ] 实现跨设备推送通知
- [ ] 设备离线时队列通知
- [ ] 通知权限管理

### 2.6 文件结构

```
lib/
  ├── sync.ts              # 多设备同步服务
  └── device.ts            # 设备识别和管理
components/
  └── admin/
      ├── DevicesList.tsx  # 设备列表组件
      └── DeviceCard.tsx  # 设备卡片组件
app/
  └── admin/
      └── devices/
          └── page.tsx     # 设备管理页面
public/
  └── sw.js                # Service Worker
```

### 2.7 冲突解决策略

- **最后写入优先**: 简单有效，适合大多数场景
- **时间戳比较**: 使用 `updated_at` 字段判断
- **用户确认**: 重要数据冲突时提示用户选择

---

## 3. 健康数据记录功能 📊

### 3.1 目标

记录血压、血糖等健康数据，形成健康档案，便于追踪和医疗参考。

### 3.2 技术选型

#### 数据可视化
- **Recharts**: React 图表库，易于使用
- **Chart.js**: 功能丰富的图表库
- **Victory**: 另一个优秀的 React 图表库

#### 数据存储
- **Supabase PostgreSQL**: 存储结构化数据
- **Supabase Storage**: 存储健康报告图片
- **IndexedDB**: 本地缓存

### 3.3 功能设计

#### 核心功能
1. **数据录入**: 支持多种健康指标录入
2. **数据可视化**: 趋势图表、统计图表
3. **健康档案**: 生成健康报告
4. **异常提醒**: 数据异常时自动提醒
5. **数据导出**: 导出 PDF/Excel

#### 数据类型
- **血压**: 收缩压/舒张压
- **血糖**: 空腹血糖、餐后血糖
- **体重**: BMI 计算
- **体温**: 体温记录
- **心率**: 静息心率、运动心率
- **自定义**: 支持自定义指标

#### API 设计
```typescript
// lib/health.ts
export interface HealthRecord {
  id: string
  type: HealthRecordType
  value: number
  unit: string
  notes?: string
  recorded_at: Date
  created_at: Date
  updated_at: Date
}

export type HealthRecordType = 
  | 'blood_pressure' 
  | 'blood_sugar' 
  | 'weight' 
  | 'temperature' 
  | 'heart_rate'
  | 'custom'

export class HealthService {
  /**
   * 创建健康记录
   */
  createRecord(record: Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>): Promise<HealthRecord>

  /**
   * 获取健康记录列表
   */
  getRecords(filters?: {
    type?: HealthRecordType
    startDate?: Date
    endDate?: Date
  }): Promise<HealthRecord[]>

  /**
   * 获取健康统计
   */
  getStatistics(type: HealthRecordType, period: 'week' | 'month' | 'year'): Promise<HealthStatistics>

  /**
   * 生成健康报告
   */
  generateReport(startDate: Date, endDate: Date): Promise<HealthReport>
}
```

### 3.4 数据库扩展

```sql
-- 健康记录表
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL CHECK (type IN (
    'blood_pressure', 
    'blood_sugar', 
    'weight', 
    'temperature', 
    'heart_rate',
    'custom'
  )),
  value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  notes TEXT,
  recorded_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 血压记录（扩展字段）
CREATE TABLE blood_pressure_records (
  id UUID PRIMARY KEY REFERENCES health_records(id),
  systolic INTEGER NOT NULL,  -- 收缩压
  diastolic INTEGER NOT NULL, -- 舒张压
  pulse INTEGER,               -- 脉搏
  position TEXT,              -- 测量位置：'sitting', 'standing', 'lying'
  arm TEXT                    -- 测量手臂：'left', 'right'
);

-- 血糖记录（扩展字段）
CREATE TABLE blood_sugar_records (
  id UUID PRIMARY KEY REFERENCES health_records(id),
  glucose_level NUMERIC NOT NULL,
  measurement_type TEXT NOT NULL CHECK (measurement_type IN ('fasting', 'postprandial', 'random')),
  meal_type TEXT,             -- 餐后测量时的餐类型
  notes TEXT
);

-- 健康档案表
CREATE TABLE health_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  profile_data JSONB NOT NULL, -- 存储各种健康指标的历史数据
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 健康提醒规则表
CREATE TABLE health_alert_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  record_type TEXT NOT NULL,
  condition JSONB NOT NULL, -- 如: {"operator": ">", "value": 140}
  alert_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.5 实现步骤

#### Phase 1: 基础数据记录（3周）
- [ ] 创建健康记录表和相关表
- [ ] 实现数据录入表单（血压、血糖、体重等）
- [ ] 实现数据列表展示
- [ ] 添加数据编辑和删除功能
- [ ] 实现数据验证

#### Phase 2: 数据可视化（3周）
- [ ] 集成 Recharts 图表库
- [ ] 实现趋势图表（血压趋势、血糖趋势）
- [ ] 实现统计图表（平均值、最高值、最低值）
- [ ] 添加时间范围选择（周/月/年）
- [ ] 实现多指标对比图表

#### Phase 3: 健康档案（2周）
- [ ] 实现健康档案生成
- [ ] 添加 PDF 导出功能
- [ ] 实现数据异常提醒
- [ ] 添加健康建议功能
- [ ] 实现数据分享功能

### 3.6 文件结构

```
lib/
  └── health.ts            # 健康数据服务
components/
  └── health/
      ├── RecordForm.tsx  # 记录表单
      ├── HealthChart.tsx # 健康图表
      ├── HealthStats.tsx # 健康统计
      └── HealthAlert.tsx # 健康提醒
app/
  ├── health/             # 健康数据页面
  │   ├── record/         # 记录页面
  │   ├── chart/          # 图表页面
  │   └── profile/        # 健康档案页面
  └── admin/
      └── health/         # 健康数据管理
```

### 3.7 数据可视化示例

- **血压趋势图**: 折线图显示收缩压和舒张压变化
- **血糖趋势图**: 折线图显示血糖水平变化
- **体重趋势图**: 折线图显示体重变化，可叠加 BMI
- **统计卡片**: 显示平均值、最高值、最低值、变化趋势

---

## 4. AI 智能推荐 🤖

### 4.1 目标

根据老人健康数据自动调整提醒内容，提供个性化健康建议，提升健康管理效果。

### 4.2 技术选型

#### AI 服务
- **OpenAI GPT-4**: 强大的语言模型，适合生成个性化内容
- **Anthropic Claude**: 另一个优秀的语言模型
- **本地模型**: 使用 Ollama 等本地部署（可选）

#### 服务端
- **Supabase Edge Functions**: 服务端 AI 调用
- **Next.js API Routes**: 备选方案

#### 规则引擎
- **自定义规则引擎**: 基于健康数据的规则判断
- **JSON 规则配置**: 灵活的规则配置

### 4.3 功能设计

#### 核心功能
1. **智能提醒**: 根据健康数据调整提醒内容
2. **健康分析**: 分析健康趋势，提供建议
3. **个性化推荐**: 基于历史数据推荐健康方案
4. **异常检测**: 自动检测健康数据异常
5. **学习优化**: 根据用户反馈优化推荐

#### API 设计
```typescript
// lib/ai.ts
export interface AIRecommendation {
  id: string
  type: 'reminder' | 'advice' | 'alert'
  content: string
  confidence: number // 0-1
  sourceData: any
  createdAt: Date
}

export class AIRecommendationService {
  /**
   * 生成个性化提醒
   */
  generateReminder(
    reminder: Reminder,
    healthData: HealthRecord[]
  ): Promise<AIRecommendation>

  /**
   * 分析健康趋势
   */
  analyzeHealthTrend(
    records: HealthRecord[],
    period: 'week' | 'month' | 'year'
  ): Promise<HealthAnalysis>

  /**
   * 生成健康建议
   */
  generateAdvice(
    profile: HealthProfile,
    recentRecords: HealthRecord[]
  ): Promise<string[]>

  /**
   * 检测健康异常
   */
  detectAnomalies(
    records: HealthRecord[]
  ): Promise<Anomaly[]>
}
```

### 4.4 数据库扩展

```sql
-- AI 推荐记录表
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('reminder', 'advice', 'alert')),
  content TEXT NOT NULL,
  confidence_score NUMERIC, -- 0-1
  source_data JSONB, -- 生成推荐的数据来源
  user_feedback TEXT, -- 'accepted', 'rejected', 'modified'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 规则配置表
CREATE TABLE ai_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_name TEXT NOT NULL,
  description TEXT,
  condition JSONB NOT NULL, -- 规则条件
  action JSONB NOT NULL,    -- 规则动作
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- AI 模型配置表
CREATE TABLE ai_model_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_name TEXT NOT NULL, -- 'gpt-4', 'claude-3', etc.
  api_key_encrypted TEXT, -- 加密的 API Key
  model_params JSONB, -- 模型参数
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.5 实现步骤

#### Phase 1: 规则引擎（3周）
- [ ] 实现基础规则引擎
- [ ] 创建规则配置界面
- [ ] 实现规则触发逻辑
- [ ] 基于健康数据触发规则（如：血压 > 140 时增加提醒频率）
- [ ] 添加规则测试功能

#### Phase 2: AI 集成（4周）
- [ ] 集成 OpenAI/Claude API
- [ ] 创建 Supabase Edge Function 处理 AI 调用
- [ ] 实现健康数据分析
- [ ] 生成个性化提醒内容
- [ ] 实现健康建议生成
- [ ] 添加 API 密钥管理

#### Phase 3: 智能学习（3周）
- [ ] 记录用户反馈（接受/拒绝推荐）
- [ ] 实现推荐效果评估
- [ ] 优化推荐算法
- [ ] 实现个性化模型训练
- [ ] 添加 A/B 测试功能

### 4.6 文件结构

```
lib/
  ├── ai.ts               # AI 服务核心
  └── rules.ts            # 规则引擎
components/
  └── ai/
      ├── RecommendationCard.tsx
      ├── AISettings.tsx
      └── RuleEditor.tsx
app/
  └── admin/
      └── ai/
          ├── page.tsx           # AI 设置页面
          └── rules/
              └── page.tsx      # 规则管理页面
supabase/
  └── functions/
      └── ai-recommend/
          └── index.ts          # Edge Function
```

### 4.7 AI 提示词示例

```typescript
// 生成个性化提醒的提示词
const generateReminderPrompt = (reminder: Reminder, healthData: HealthRecord[]) => `
你是一个专业的健康管理助手。请根据以下信息生成一个个性化的健康提醒：

提醒信息：
- 标题：${reminder.title}
- 类型：${reminder.type}
- 时间：${reminder.time_slots}

健康数据：
${healthData.map(d => `- ${d.type}: ${d.value} ${d.unit}`).join('\n')}

请生成一个温暖、易懂的提醒内容，适合老年人阅读。要求：
1. 使用简单易懂的语言
2. 语气温和友好
3. 包含必要的健康建议
4. 不超过 50 字
`;
```

---

## 开发优先级

### 高优先级（立即开始）
1. **语音播报功能** - 提升无障碍体验，对视力不佳的老人非常重要
2. **健康数据记录** - 基础功能，为后续 AI 推荐提供数据基础

### 中优先级（3个月后）
3. **多设备同步** - 提升用户体验，但需要更多基础设施
4. **AI 智能推荐** - 需要先有健康数据积累

### 低优先级（6个月后）
5. 医疗设备集成
6. 多语言支持
7. 高级数据分析

---

## 技术债务

在实现新功能前，需要解决以下技术债务：

- [ ] 完善错误处理机制
- [ ] 添加单元测试和集成测试
- [ ] 优化性能（代码分割、懒加载）
- [ ] 完善文档和注释
- [ ] 添加监控和日志系统

---

## 贡献指南

欢迎贡献代码！请遵循以下步骤：

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

MIT License
