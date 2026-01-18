#!/bin/bash
# 立即部署到服务器（同步代码并重新构建）

set -e

SERVER_IP="81.70.220.9"
SERVER_USER="${SERVER_USER:-root}"
APP_DIR="/opt/betterandbetter"

echo "🚀 开始部署到服务器..."

# 1. 同步代码
echo "📦 同步代码到服务器..."
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

echo "✅ 代码同步完成"

# 2. 在服务器上构建和重启
echo "🔨 在服务器上构建并重启..."
ssh ${SERVER_USER}@${SERVER_IP} << 'REMOTE_SCRIPT'
set -e
cd /opt/betterandbetter
export PATH=/opt/node20/bin:$PATH

echo "安装依赖..."
npm install --legacy-peer-deps

echo "构建项目..."
npm run build

echo "重启服务..."
pkill -f 'next-server' || true
sleep 2
PORT=80 HOSTNAME=0.0.0.0 nohup npm start > /tmp/betterandbetter.log 2>&1 &

sleep 5
if netstat -tlnp | grep -q ':80 '; then
    echo "✅ 服务已启动"
else
    echo "❌ 服务启动失败，查看日志:"
    tail -20 /tmp/betterandbetter.log
    exit 1
fi
REMOTE_SCRIPT

echo ""
echo "✅ 部署完成！"
echo "访问地址: http://${SERVER_IP}"
