# 国内部署方案

**GitHub 仓库**: https://github.com/1206660/betterandbetter.git

由于 Vercel 在国内访问受限，以下是几个可行的替代方案：

## 方案一：Cloudflare Pages（推荐，免费）

Cloudflare Pages 在国内访问相对稳定，且完全免费。

### 部署步骤

1. **安装 Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

2. **登录 Cloudflare**
   ```bash
   wrangler login
   ```

3. **在 Cloudflare Dashboard 创建项目**
   - 访问：https://dash.cloudflare.com
   - 进入 Workers & Pages
   - 点击 "Create application" > "Pages" > "Connect to Git"
   - 连接 GitHub 仓库
   - 配置：
     - Framework preset: Next.js
     - Build command: `npm run build`
     - Build output directory: `.next`

4. **配置环境变量**
   - 在项目设置中添加：
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 使用脚本部署

```bash
npm run deploy:cloudflare
```

## 方案二：阿里云/腾讯云/华为云（需要服务器）

### 使用 Docker 部署

1. **创建 Dockerfile**
   ```dockerfile
   FROM node:20-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build

   FROM node:20-alpine AS runner
   WORKDIR /app
   ENV NODE_ENV production
   COPY --from=builder /app/public ./public
   COPY --from=builder /app/.next/standalone ./
   COPY --from=builder /app/.next/static ./.next/static
   EXPOSE 3000
   CMD ["node", "server.js"]
   ```

2. **构建和运行**
   ```bash
   docker build -t betterandbetter .
   docker run -p 3000:3000 \
     -e NEXT_PUBLIC_SUPABASE_URL=xxx \
     -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
     betterandbetter
   ```

## 方案三：静态导出 + 国内 CDN

将 Next.js 导出为静态站点，部署到国内 CDN（如阿里云 OSS、腾讯云 COS）。

### 配置静态导出

需要修改 `next.config.ts` 支持静态导出。

## 方案四：使用 Netlify（可能也有访问问题）

类似 Vercel，但可能在国内访问也有问题。

## 方案五：自建服务器（最稳定）

在阿里云/腾讯云购买服务器，使用 PM2 或 Docker 部署。
