#!/bin/bash
# 同步代码到服务器并触发更新

set -e

SERVER_IP="81.70.220.9"
SERVER_USER="${SERVER_USER:-root}"
APP_DIR="/opt/betterandbetter"

echo "🔄 同步代码到服务器..."

# 使用 rsync 同步代码
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

echo "✅ 代码同步完成"
echo ""
echo "📝 服务器上的操作："
echo "  1. 代码已同步到 ${APP_DIR}"
echo "  2. 自动更新服务会检测到本地更改（如果 Git 状态不同）"
echo "  3. 或者手动执行: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && git add . && git commit -m \"sync\" && export PATH=/opt/node20/bin:\$PATH && npm run build && pkill -f next-server && PORT=80 HOSTNAME=0.0.0.0 nohup npm start > /tmp/betterandbetter.log 2>&1 &'"
