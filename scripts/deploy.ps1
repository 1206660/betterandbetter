# PowerShell 一键部署脚本

Write-Host "🚀 开始部署 BetterAndBetter 到 Vercel..." -ForegroundColor Cyan

# 检查是否安装了 Vercel CLI
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "📦 安装 Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
}

# 检查是否已登录
try {
    vercel whoami | Out-Null
} catch {
    Write-Host "🔐 请先登录 Vercel..." -ForegroundColor Yellow
    vercel login
}

# 构建项目
Write-Host "🔨 构建项目..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 构建失败！" -ForegroundColor Red
    exit 1
}

# 部署到生产环境
Write-Host "🌐 部署到生产环境..." -ForegroundColor Yellow
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ 部署完成！" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 下一步：" -ForegroundColor Cyan
    Write-Host "1. 在 Vercel Dashboard 中配置环境变量：" -ForegroundColor White
    Write-Host "   - NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Gray
    Write-Host "   - NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Gray
    Write-Host "2. 重新部署以应用环境变量" -ForegroundColor White
} else {
    Write-Host "❌ 部署失败！" -ForegroundColor Red
    exit 1
}
