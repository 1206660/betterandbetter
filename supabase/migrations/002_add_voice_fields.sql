-- 添加语音播报相关字段到 reminders 表
-- 注意：这是可选的，Phase 1 可以先不执行此迁移

-- 添加语音启用字段
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS voice_enabled BOOLEAN DEFAULT true;

-- 添加语音设置字段（JSONB 格式）
ALTER TABLE reminders 
ADD COLUMN IF NOT EXISTS voice_settings JSONB DEFAULT '{
  "rate": 0.9,
  "pitch": 1,
  "volume": 1,
  "lang": "zh-CN"
}'::jsonb;

-- 创建语音播报记录表（可选，用于统计和分析）
CREATE TABLE IF NOT EXISTS voice_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reminder_id UUID REFERENCES reminders(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  played_at TIMESTAMPTZ DEFAULT NOW(),
  duration INTEGER, -- 播报时长（毫秒）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_voice_logs_reminder_id ON voice_logs(reminder_id);
CREATE INDEX IF NOT EXISTS idx_voice_logs_played_at ON voice_logs(played_at);

-- 启用 Row Level Security
ALTER TABLE voice_logs ENABLE ROW LEVEL SECURITY;

-- 允许所有操作（单用户场景）
CREATE POLICY "Allow all operations on voice_logs" ON voice_logs FOR ALL USING (true);
