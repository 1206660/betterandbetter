# Cloudflare Pages 配置修正

## 当前错误配置

❌ **构建命令**：`npm install && npm run build`
❌ **构建输出目录**：`/.next`

## 问题

1. `/.next` 是绝对路径，Cloudflare Pages 需要相对路径
2. 没有设置 `CLOUDFLARE_PAGES=true`，不会进行静态导出
3. 使用 `.next` 目录在 Cloudflare Pages 上会导致 404 错误

## ✅ 正确配置（静态导出方式）

### 修改构建设置

进入 Settings > Builds & deployments，修改为：

**构建命令**：
```
CLOUDFLARE_PAGES=true npm install --legacy-peer-deps && npm run build
```

**构建输出目录**：
```
out
```

**根目录**：
```
（留空或填写 /）
```

### 为什么使用 `out`？

- 当设置 `CLOUDFLARE_PAGES=true` 时，Next.js 会进行静态导出
- 静态导出的输出目录是 `out`，不是 `.next`
- Cloudflare Pages 需要静态文件才能正常部署

## 配置步骤

1. 进入 Cloudflare Pages 项目
2. Settings > Builds & deployments
3. 修改：
   - Build command: `CLOUDFLARE_PAGES=true npm install --legacy-peer-deps && npm run build`
   - Build output directory: `out`
4. 保存设置
5. 重新部署

## 验证

部署成功后，所有页面应该都能正常访问。
