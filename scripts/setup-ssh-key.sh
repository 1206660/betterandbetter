#!/bin/bash
# SSH 免密登录配置脚本

set -e

SERVER_IP="81.70.220.9"
SERVER_USER="${SERVER_USER:-root}"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_step() {
    echo -e "${BLUE}[步骤]${NC} $1"
}

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 配置 SSH 免密登录"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 步骤 1: 检查是否已有 SSH 密钥
log_step "1. 检查本地 SSH 密钥..."
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
SSH_PUB_KEY_PATH="$HOME/.ssh/id_rsa.pub"

if [ ! -f "$SSH_KEY_PATH" ]; then
    log_warn "未找到 SSH 密钥，将创建新的密钥对..."
    echo ""
    echo "请按提示操作："
    echo "  - 如果提示输入密码，可以直接按回车（不设置密码）"
    echo "  - 或者设置一个密码（更安全）"
    echo ""
    read -p "按回车键继续生成密钥..."
    
    ssh-keygen -t rsa -b 4096 -f "$SSH_KEY_PATH" -N "" -C "betterandbetter-deploy"
    log_info "✅ SSH 密钥已生成"
else
    log_info "✅ 已找到现有 SSH 密钥: $SSH_KEY_PATH"
fi

# 步骤 2: 显示公钥内容
log_step "2. 准备复制公钥到服务器..."
echo ""
log_info "你的公钥内容："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat "$SSH_PUB_KEY_PATH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 步骤 3: 测试 SSH 连接
log_step "3. 测试 SSH 连接..."
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo '连接成功'" 2>/dev/null; then
    log_info "✅ SSH 连接正常"
else
    log_error "❌ 无法连接到服务器"
    echo ""
    echo "请检查："
    echo "  1. 服务器 IP 是否正确: ${SERVER_IP}"
    echo "  2. 服务器是否允许 SSH 连接（端口 22）"
    echo "  3. 防火墙是否开放 22 端口"
    echo ""
    read -p "是否继续配置？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 步骤 4: 复制公钥到服务器
log_step "4. 复制公钥到服务器..."
echo ""
log_info "正在将公钥复制到服务器..."
log_warn "如果这是第一次连接，需要输入服务器密码"

# 方法 1: 使用 ssh-copy-id（推荐）
if command -v ssh-copy-id &> /dev/null; then
    log_info "使用 ssh-copy-id 复制公钥..."
    ssh-copy-id -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} || {
        log_warn "ssh-copy-id 失败，尝试手动方法..."
        # 方法 2: 手动复制
        cat "$SSH_PUB_KEY_PATH" | ssh ${SERVER_USER}@${SERVER_IP} \
            "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
    }
else
    log_info "使用手动方法复制公钥..."
    cat "$SSH_PUB_KEY_PATH" | ssh ${SERVER_USER}@${SERVER_IP} \
        "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"
fi

# 步骤 5: 测试免密登录
log_step "5. 测试免密登录..."
echo ""
if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} "echo '免密登录成功！'" 2>/dev/null; then
    log_info "✅ 免密登录配置成功！"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 配置完成！现在可以免密登录服务器了"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "测试命令："
    echo "  ssh ${SERVER_USER}@${SERVER_IP}"
    echo ""
    echo "现在可以运行部署脚本了："
    echo "  ./scripts/deploy-tencent.sh"
    echo ""
else
    log_error "❌ 免密登录测试失败"
    echo ""
    echo "可能的原因："
    echo "  1. 服务器上的 ~/.ssh/authorized_keys 权限不正确"
    echo "  2. 服务器 SSH 配置不允许密钥认证"
    echo ""
    echo "请手动检查服务器配置："
    echo "  ssh ${SERVER_USER}@${SERVER_IP}"
    echo "  ls -la ~/.ssh/"
    echo "  cat ~/.ssh/authorized_keys"
    exit 1
fi
