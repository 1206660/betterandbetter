# 数据库设置说明

## 在 Supabase 中创建 reminders 表

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单的 **SQL Editor**
4. 点击 **New query**
5. **方法一（推荐）**：直接复制 `setup_database.sql` 文件的全部内容并执行
6. **方法二**：复制并执行以下 SQL（注意：只复制 SQL 代码，不要复制 Markdown 格式）：

**重要提示**：请直接打开项目根目录下的 `setup_database.sql` 文件，复制其中的 SQL 代码（不包含任何 Markdown 格式），然后粘贴到 Supabase SQL Editor 中执行。

或者，如果你要手动输入，请确保：
- 只复制 SQL 代码部分
- 不要复制 Markdown 的代码块标记（```sql 和 ```）
- 不要复制任何 `#` 开头的注释（SQL 使用 `--` 作为注释）

7. 点击 **Run** 执行 SQL
8. 确认表创建成功

## 验证表创建

在 SQL Editor 中执行：

```sql
SELECT * FROM reminders LIMIT 1;
```

如果返回空结果（没有错误），说明表创建成功。

## 启用 Realtime（可选）

如果需要实时功能（已默认启用）：

1. 进入 **Database** > **Replication**
2. 找到 `reminders` 表
3. 确保 **Enable Realtime** 已开启

## 测试数据（可选）

可以插入一条测试数据：

```sql
INSERT INTO reminders (title, type, description, time_slots, frequency, is_active)
VALUES (
  '测试提醒',
  'medication',
  '这是一条测试提醒',
  '[{"time": "08:00", "label": "早餐后"}, {"time": "20:00", "label": "晚餐后"}]'::jsonb,
  'daily',
  true
);
```
