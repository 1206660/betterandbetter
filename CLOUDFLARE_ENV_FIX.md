# Cloudflare Pages 环境变量配置修复

## 问题

构建成功，但是 `out` 目录没有被找到。原因是环境变量 `CLOUDFLARE_PAGES=true` 需要在 Cloudflare Pages 的环境变量中设置，而不是在构建命令中。

## ✅ 正确配置

### 1. 在 Cloudflare Pages 环境变量中设置

进入项目 Settings > Environment variables，添加：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `CLOUDFLARE_PAGES` | `true` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://fanpgiptyqupseikdczv.supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_teJPIzQyJWIJkU9QzFUdTA_qSFb4K18` | Production, Preview |

### 2. 修改构建命令

进入 Settings > Builds & deployments，修改：

**构建命令**：
```
npm install --legacy-peer-deps && npm run build
```

**注意**：不要在构建命令中设置 `CLOUDFLARE_PAGES=true`，应该在环境变量中设置。

**构建输出目录**：
```
out
```

### 3. 更新 wrangler.toml（可选）

已更新 `wrangler.toml` 文件，添加了 `pages_build_output_dir = "out"`。

## 为什么这样修复？

1. **环境变量设置位置**：在构建命令中设置环境变量可能不会传递到 `npm run build` 中
2. **Cloudflare Pages 环境变量**：在项目设置的环境变量中设置，会在整个构建过程中可用
3. **wrangler.toml**：添加 `pages_build_output_dir` 可以帮助 Cloudflare Pages 识别输出目录

## 重新部署

1. 保存环境变量设置
2. 保存构建配置
3. 重新部署

部署成功后，`out` 目录应该会被正确生成和部署。
