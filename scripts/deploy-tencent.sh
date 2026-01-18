#!/bin/bash
# 腾讯云服务器一键部署脚本

set -e

# 配置变量
SERVER_IP="81.70.220.9"
SERVER_USER="${SERVER_USER:-root}"
APP_NAME="betterandbetter"
APP_DIR="/opt/${APP_NAME}"
PORT=3000

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查本地环境变量文件
if [ ! -f .env.local ]; then
    log_error "未找到 .env.local 文件，请先创建并配置环境变量"
    exit 1
fi

log_info "开始部署到腾讯云服务器 ${SERVER_IP}..."

# 检查 SSH 连接
log_info "检查 SSH 连接..."
if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo 'SSH连接成功'" 2>/dev/null; then
    log_error "无法连接到服务器，请检查："
    log_error "1. 服务器 IP 是否正确: ${SERVER_IP}"
    log_error "2. SSH 密钥是否已配置"
    log_error "3. 服务器是否允许 SSH 连接"
    exit 1
fi

# 在服务器上执行命令的函数
remote_exec() {
    ssh ${SERVER_USER}@${SERVER_IP} "$1"
}

# 安装 Docker
log_info "检查并安装 Docker..."
remote_exec "command -v docker >/dev/null 2>&1 || {
    echo '安装 Docker...'
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
}"

# 安装 Docker Compose
log_info "检查并安装 Docker Compose..."
remote_exec "command -v docker-compose >/dev/null 2>&1 || {
    echo '安装 Docker Compose...'
    curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
}"

# 创建应用目录
log_info "创建应用目录..."
remote_exec "mkdir -p ${APP_DIR}"

# 检查是否已存在项目（Git 仓库）
log_info "同步项目代码..."
if remote_exec "test -d ${APP_DIR}/.git"; then
    log_info "更新现有代码..."
    remote_exec "cd ${APP_DIR} && git pull || true"
else
    log_info "准备上传项目代码..."
    # 获取当前 Git 仓库 URL
    GIT_URL=$(cd /Volumes/SSD01/Code/betterandbetter && git remote get-url origin 2>/dev/null || echo "")
    if [ -z "$GIT_URL" ]; then
        log_warn "未检测到 Git 远程仓库，将直接上传文件..."
        # 使用 rsync 同步文件
        log_info "使用 rsync 同步文件..."
        cd /Volumes/SSD01/Code/betterandbetter
        rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
            --exclude '.env.local' \
            -e "ssh -o StrictHostKeyChecking=no" \
            ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/
    else
        log_info "克隆项目代码..."
        remote_exec "cd /opt && rm -rf ${APP_NAME} && git clone ${GIT_URL} ${APP_NAME}"
    fi
fi

# 上传环境变量文件
log_info "上传环境变量配置..."
scp -o StrictHostKeyChecking=no .env.local ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/.env.local

# 上传 Docker 相关文件
log_info "上传 Docker 配置文件..."
scp -o StrictHostKeyChecking=no Dockerfile ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/
scp -o StrictHostKeyChecking=no docker-compose.yml ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

# 构建并启动容器
log_info "构建并启动 Docker 容器..."
remote_exec "cd ${APP_DIR} && \
    docker-compose down || true && \
    docker-compose build --no-cache && \
    docker-compose up -d"

# 等待容器启动
log_info "等待容器启动..."
sleep 5

# 检查容器状态
log_info "检查容器状态..."
sleep 3
CONTAINER_STATUS=$(remote_exec "cd ${APP_DIR} && docker-compose ps -q" | head -1)
if [ -n "$CONTAINER_STATUS" ] && remote_exec "docker ps | grep -q $CONTAINER_STATUS"; then
    log_info "✅ 容器运行成功！"
    remote_exec "cd ${APP_DIR} && docker-compose ps"
else
    log_error "❌ 容器启动失败，查看日志："
    remote_exec "cd ${APP_DIR} && docker-compose logs --tail=50"
    exit 1
fi

# 配置防火墙
log_info "配置防火墙规则..."
remote_exec "command -v ufw >/dev/null 2>&1 && {
    ufw allow ${PORT}/tcp 2>/dev/null || true
    ufw allow 80/tcp 2>/dev/null || true
    ufw allow 443/tcp 2>/dev/null || true
} || command -v firewall-cmd >/dev/null 2>&1 && {
    firewall-cmd --permanent --add-port=${PORT}/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
    firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
    firewall-cmd --reload 2>/dev/null || true
} || {
    echo '未检测到防火墙工具，请手动开放端口 ${PORT}'
}"

# 显示部署信息
log_info "✅ 部署完成！"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 应用信息："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "服务器地址: ${SERVER_IP}"
echo "应用端口: ${PORT}"
echo "访问地址: http://${SERVER_IP}:${PORT}"
echo ""
echo "📝 常用命令："
echo "  查看日志: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && docker-compose logs -f'"
echo "  重启服务: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && docker-compose restart'"
echo "  停止服务: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && docker-compose down'"
echo "  更新代码: ssh ${SERVER_USER}@${SERVER_IP} 'cd ${APP_DIR} && git pull && docker-compose up -d --build'"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
