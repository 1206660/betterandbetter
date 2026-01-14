#!/bin/bash
# Docker 部署脚本

set -e

echo "🐳 开始使用 Docker 部署..."

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，请先安装 Docker"
    exit 1
fi

# 读取环境变量
if [ ! -f .env.local ]; then
    echo "❌ 未找到 .env.local 文件"
    exit 1
fi

source .env.local

# 构建 Docker 镜像
echo "🔨 构建 Docker 镜像..."
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t betterandbetter:latest .

echo "✅ 构建完成！"
echo ""
echo "📝 运行容器："
echo "docker run -d -p 3000:3000 --name betterandbetter betterandbetter:latest"
echo ""
echo "或者使用 docker-compose："
echo "docker-compose up -d"
