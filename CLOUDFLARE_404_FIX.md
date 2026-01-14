# Cloudflare Pages 404 错误修复

## 问题

访问 `betterandbetter.pages.dev` 出现 404 错误，说明：
- ✅ Pages 项目已创建
- ❌ 构建输出目录配置不正确
- ❌ 或者构建失败

## 解决方案

### 方法一：修正构建输出目录（推荐）

在 Cloudflare Pages 项目设置中：

1. **进入 Settings > Builds & deployments**

2. **修改以下设置**：

   **Build command**（构建命令）：
   ```
   npm install && npm run build
   ```

   **Build output directory**（构建输出目录）：
   ```
   .next
   ```
   
   **重要**：对于 Next.js App Router，输出目录应该是 `.next`，但 Cloudflare Pages 可能需要 `out` 目录。

3. **如果 `.next` 不行，尝试**：
   - Build output directory: `out`（如果使用静态导出）
   - 或者：`.vercel/output/static`（如果使用 Cloudflare 适配器）

### 方法二：检查构建日志

1. 进入 Deployments 页面
2. 查看最新的部署日志
3. 检查是否有构建错误

### 方法三：使用静态导出（如果方法一不行）

修改 `next.config.ts`：

```typescript
const nextConfig: NextConfig = {
  output: 'export', // 静态导出
  images: {
    unoptimized: true, // 静态导出需要
  },
};
```

然后：
- Build output directory: `out`

## 立即检查

1. **查看部署状态**：
   - 进入 Cloudflare Pages 项目
   - 查看 Deployments 页面
   - 检查最新部署是否成功

2. **查看构建日志**：
   - 点击失败的部署
   - 查看详细日志
   - 确认构建是否成功

3. **验证配置**：
   - Build command: `npm install && npm run build`
   - Build output directory: `.next` 或 `out`
   - 环境变量已配置

## 常见问题

### Q: 为什么是 404？
A: 构建输出目录不正确，Cloudflare Pages 找不到构建产物。

### Q: 应该使用哪个输出目录？
A: 
- Next.js 默认：`.next`
- 静态导出：`out`
- Cloudflare 适配器：`.vercel/output/static`

### Q: 如何确认构建成功？
A: 查看 Deployments 页面，应该显示 "Success" 状态。
