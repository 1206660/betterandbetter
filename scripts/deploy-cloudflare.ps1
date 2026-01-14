# Cloudflare Pages 部署脚本

Write-Host "☁️ 开始部署到 Cloudflare Pages..." -ForegroundColor Cyan

# 检查是否安装了 Wrangler
if (-not (Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "📦 安装 Wrangler CLI..." -ForegroundColor Yellow
    npm install -g wrangler
}

# 检查是否已登录
try {
    wrangler whoami | Out-Null
} catch {
    Write-Host "🔐 请先登录 Cloudflare..." -ForegroundColor Yellow
    wrangler login
}

# 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}

Write-Host "✅ 构建完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📝 下一步：" -ForegroundColor Cyan
Write-Host "1. 访问 Cloudflare Dashboard：" -ForegroundColor White
Write-Host "   https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "2. 进入 Workers & Pages > Create application" -ForegroundColor White
Write-Host "3. 选择 Pages > Connect to Git" -ForegroundColor White
Write-Host "4. 连接你的 GitHub 仓库" -ForegroundColor White
Write-Host "5. 配置：" -ForegroundColor White
Write-Host "   - Framework preset: Next.js" -ForegroundColor Gray
Write-Host "   - Build command: npm run build" -ForegroundColor Gray
Write-Host "   - Build output directory: .next" -ForegroundColor Gray
Write-Host "6. 在项目设置中添加环境变量" -ForegroundColor White
