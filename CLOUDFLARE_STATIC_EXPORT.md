# Cloudflare Pages 静态导出配置

## 问题

Next.js App Router 在 Cloudflare Pages 上使用 `.next` 输出目录会导致 404 错误。

## 解决方案：使用静态导出

由于应用主要使用客户端组件和 Supabase 客户端连接，可以使用静态导出方式。

## 配置步骤

### 1. 修改 Cloudflare Pages 构建设置

进入项目 Settings > Builds & deployments：

- **Build command**（构建命令）：
  ```
  CLOUDFLARE_PAGES=true npm install --legacy-peer-deps && npm run build
  ```
  或者：
  ```
  npm install --legacy-peer-deps && CLOUDFLARE_PAGES=true npm run build
  ```

- **Build output directory**（构建输出目录）：
  ```
  out
  ```
  
  **重要**：静态导出后，输出目录是 `out`，不是 `.next`！

- **Root directory**（根目录）：
  ```
  （留空）
  ```

### 2. 环境变量

确保已配置：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. 重新部署

1. 保存设置
2. 进入 Deployments 页面
3. 点击 "Retry deployment" 或创建新部署

## 验证

部署成功后，访问：
- `https://betterandbetter.pages.dev`
- `https://betterandbetter.pages.dev/display`
- `https://betterandbetter.pages.dev/admin`

应该都能正常访问。

## 注意事项

静态导出方式：
- ✅ 支持客户端组件
- ✅ 支持 Supabase 客户端连接
- ✅ 支持 Realtime 订阅
- ❌ 不支持 API Routes
- ❌ 不支持服务器端渲染（SSR）
- ❌ 不支持增量静态再生（ISR）

对于这个应用，静态导出完全够用。
