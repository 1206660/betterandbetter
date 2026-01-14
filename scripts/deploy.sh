#!/bin/bash
# 一键部署脚本

set -e

echo "🚀 开始部署 BetterAndBetter 到 Vercel..."

# 检查是否安装了 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 安装 Vercel CLI..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录 Vercel..."
    vercel login
fi

# 构建项目
echo "🔨 构建项目..."
npm run build

# 部署到生产环境
echo "🌐 部署到生产环境..."
vercel --prod

echo "✅ 部署完成！"
echo ""
echo "📝 下一步："
echo "1. 在 Vercel Dashboard 中配置环境变量："
echo "   - NEXT_PUBLIC_SUPABASE_URL"
echo "   - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "2. 重新部署以应用环境变量"
