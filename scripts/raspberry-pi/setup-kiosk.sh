#!/bin/bash

# BetterAndBetter 树莓派 Kiosk 模式自动配置脚本
# 使用方法: sudo bash setup-kiosk.sh

set -e

echo "========================================="
echo "BetterAndBetter Kiosk 模式配置脚本"
echo "========================================="

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
  echo "请使用 sudo 运行此脚本"
  exit 1
fi

# 获取当前用户（假设是 pi）
CURRENT_USER=${SUDO_USER:-pi}
HOME_DIR=$(eval echo ~$CURRENT_USER)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "当前用户: $CURRENT_USER"
echo "用户目录: $HOME_DIR"

# 1. 更新系统
echo ""
echo "1. 更新系统..."
apt update && apt upgrade -y

# 2. 安装必要软件
echo ""
echo "2. 安装必要软件..."
apt install -y chromium-browser unclutter xdotool

# 3. 复制启动脚本
echo ""
echo "3. 配置启动脚本..."
cp "$SCRIPT_DIR/kiosk.sh" "$HOME_DIR/kiosk.sh"
chmod +x "$HOME_DIR/kiosk.sh"
chown $CURRENT_USER:$CURRENT_USER "$HOME_DIR/kiosk.sh"

# 4. 配置自动登录
echo ""
echo "4. 配置自动登录..."
if [ ! -d "/etc/systemd/system/getty@tty1.service.d" ]; then
  mkdir -p /etc/systemd/system/getty@tty1.service.d
fi

cat > /etc/systemd/system/getty@tty1.service.d/autologin.conf << EOF
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin $CURRENT_USER --noclear %I \$TERM
EOF

# 5. 配置桌面自动启动
echo ""
echo "5. 配置桌面自动启动..."
if [ ! -d "$HOME_DIR/.config/lxsession/LXDE-pi" ]; then
  mkdir -p "$HOME_DIR/.config/lxsession/LXDE-pi"
fi

cat > "$HOME_DIR/.config/lxsession/LXDE-pi/autostart" << EOF
@lxpanel --profile LXDE-pi
@pcmanfm --desktop --profile LXDE-pi
@xset s off
@xset -dpms
@xset s noblank
@$HOME_DIR/kiosk.sh
EOF

chown $CURRENT_USER:$CURRENT_USER "$HOME_DIR/.config/lxsession/LXDE-pi/autostart"

# 6. 创建 systemd 服务（更可靠）
echo ""
echo "6. 创建 systemd 服务..."
cat > /etc/systemd/system/betterandbetter-kiosk.service << EOF
[Unit]
Description=BetterAndBetter Kiosk Mode
After=graphical.target

[Service]
Type=simple
User=$CURRENT_USER
Environment=DISPLAY=:0
Environment=XAUTHORITY=$HOME_DIR/.Xauthority
ExecStart=$HOME_DIR/kiosk.sh
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=graphical.target
EOF

systemctl daemon-reload
systemctl enable betterandbetter-kiosk.service

# 7. 配置日志
echo ""
echo "7. 配置日志..."
touch /var/log/kiosk.log
chown $CURRENT_USER:$CURRENT_USER /var/log/kiosk.log

# 8. 创建监控脚本
echo ""
echo "8. 创建监控脚本..."
cat > "$HOME_DIR/check-kiosk.sh" << 'EOF'
#!/bin/bash
if ! pgrep -x "chromium" > /dev/null; then
    systemctl restart betterandbetter-kiosk.service
    echo "$(date): Kiosk restarted" >> /var/log/kiosk.log
fi
EOF

chmod +x "$HOME_DIR/check-kiosk.sh"
chown $CURRENT_USER:$CURRENT_USER "$HOME_DIR/check-kiosk.sh"

# 添加到 crontab
(crontab -u $CURRENT_USER -l 2>/dev/null; echo "*/5 * * * * $HOME_DIR/check-kiosk.sh") | crontab -u $CURRENT_USER -

# 9. 配置网络（如果需要）
echo ""
echo "9. 网络配置..."
echo "请确保 WiFi 已配置，可以使用 raspi-config 配置："
echo "  sudo raspi-config"
echo "  选择: System Options > Wireless LAN"

# 10. 完成
echo ""
echo "========================================="
echo "配置完成！"
echo "========================================="
echo ""
echo "下一步："
echo "1. 确保 WiFi 已连接"
echo "2. 重启设备: sudo reboot"
echo "3. 设备启动后应该自动进入 Kiosk 模式"
echo ""
echo "查看日志:"
echo "  journalctl -u betterandbetter-kiosk.service -f"
echo ""
echo "手动启动服务:"
echo "  sudo systemctl start betterandbetter-kiosk.service"
echo ""
echo "停止服务:"
echo "  sudo systemctl stop betterandbetter-kiosk.service"
echo ""
