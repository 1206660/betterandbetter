# 快速部署指南

## GitHub 仓库
https://github.com/1206660/betterandbetter.git

## 推荐部署方案（国内可访问）

### 🥇 Cloudflare Pages（推荐，免费）

**优点**：免费、国内访问相对稳定、自动部署

**步骤**：
1. 访问：https://dash.cloudflare.com
2. Workers & Pages > Create application > Pages > Connect to Git
3. 选择仓库：`1206660/betterandbetter`
4. 配置：
   - Framework: Next.js
   - Build command: `npm run build`
   - Build output: `.next`
5. 添加环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. 部署完成！

详细步骤见：[cloudflare-pages.md](cloudflare-pages.md)

### 🥈 Docker + 国内服务器（最稳定）

**优点**：完全可控、访问稳定

**步骤**：
```bash
# 1. 构建镜像
docker build -t betterandbetter .

# 2. 运行容器
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=xxx \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx \
  betterandbetter
```

详细步骤见：[DEPLOY_CN.md](DEPLOY_CN.md)

### 🥉 Vercel（国外访问）

如果主要用户在国外，可以使用 Vercel。

详细步骤见：[DEPLOY.md](DEPLOY.md)
