#!/bin/bash
# Nginx 反向代理配置脚本（可选）

set -e

SERVER_IP="81.70.220.9"
SERVER_USER="${SERVER_USER:-root}"
APP_NAME="betterandbetter"
DOMAIN="${DOMAIN:-}"  # 如果配置了域名，替换为空则使用 IP

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

remote_exec() {
    ssh ${SERVER_USER}@${SERVER_IP} "$1"
}

log_info "配置 Nginx 反向代理..."

# 安装 Nginx
remote_exec "command -v nginx >/dev/null 2>&1 || {
    if command -v apt-get >/dev/null 2>&1; then
        apt-get update && apt-get install -y nginx
    elif command -v yum >/dev/null 2>&1; then
        yum install -y nginx
    fi
    systemctl enable nginx
    systemctl start nginx
}"

# 创建 Nginx 配置
if [ -n "$DOMAIN" ]; then
    SERVER_NAME="$DOMAIN"
else
    SERVER_NAME="${SERVER_IP}"
fi

NGINX_CONFIG="/etc/nginx/sites-available/${APP_NAME}"
if remote_exec "test -d /etc/nginx/sites-available"; then
    CONFIG_PATH="$NGINX_CONFIG"
else
    CONFIG_PATH="/etc/nginx/conf.d/${APP_NAME}.conf"
fi

log_info "创建 Nginx 配置文件..."
remote_exec "cat > ${CONFIG_PATH} << 'EOF'
server {
    listen 80;
    server_name ${SERVER_NAME};

    client_max_body_size 20M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
"

# 启用配置（如果使用 sites-available）
if remote_exec "test -d /etc/nginx/sites-available"; then
    remote_exec "ln -sf ${CONFIG_PATH} /etc/nginx/sites-enabled/${APP_NAME}"
fi

# 测试并重载 Nginx
log_info "测试 Nginx 配置..."
remote_exec "nginx -t && systemctl reload nginx"

log_info "✅ Nginx 配置完成！"
echo "访问地址: http://${SERVER_NAME}"
