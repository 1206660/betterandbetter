# 树莓派 Kiosk 模式快速部署

## 快速开始

### 1. 准备硬件

- 树莓派 4B (4GB+)
- MicroSD 卡 (32GB+)
- 触摸屏（7-10寸）
- 电源适配器

### 2. 安装系统

1. 下载 [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. 烧录 Raspberry Pi OS（Lite 或 Desktop 版本）
3. 在首次启动前配置：
   - 启用 SSH
   - 设置 WiFi
   - 设置用户名和密码

### 3. 部署脚本

#### 方法一：使用自动配置脚本（推荐）

```bash
# 1. 将脚本上传到树莓派
scp -r scripts/raspberry-pi pi@raspberrypi.local:~/

# 2. SSH 连接到树莓派
ssh pi@raspberrypi.local

# 3. 运行配置脚本
cd ~/raspberry-pi
sudo bash setup-kiosk.sh
```

#### 方法二：手动配置

```bash
# 1. 复制启动脚本
sudo cp kiosk.sh /home/pi/kiosk.sh
sudo chmod +x /home/pi/kiosk.sh

# 2. 配置自动启动（参考 DEPLOY_KIOSK.md）
```

### 4. 重启设备

```bash
sudo reboot
```

设备重启后应该自动进入 Kiosk 模式，显示 BetterAndBetter 应用。

## 故障排除

### 查看服务状态

```bash
sudo systemctl status betterandbetter-kiosk.service
```

### 查看日志

```bash
# 查看服务日志
journalctl -u betterandbetter-kiosk.service -f

# 查看应用日志
tail -f /var/log/kiosk.log
```

### 手动测试

```bash
# 手动运行启动脚本
/home/pi/kiosk.sh
```

### 重启服务

```bash
sudo systemctl restart betterandbetter-kiosk.service
```

## 自定义配置

### 修改启动 URL

编辑 `/home/pi/kiosk.sh`，修改 URL：

```bash
--app=https://your-custom-url.com/display
```

### 修改屏幕方向

在 `kiosk.sh` 中添加：

```bash
xrandr --output HDMI-1 --rotate left  # 或 right, inverted
```

### 调整鼠标隐藏时间

修改 `unclutter` 参数：

```bash
unclutter -idle 10 -root  # 10秒后隐藏
```

## 维护

### 更新应用

应用会自动从云端加载最新版本，无需更新设备。

### 更新系统

```bash
sudo apt update && sudo apt upgrade -y
sudo reboot
```

### 远程访问

```bash
# SSH 访问
ssh pi@raspberrypi.local

# VNC 远程桌面（可选）
sudo apt install realvnc-vnc-server
```

## 成本估算

- 树莓派 4B (4GB): ¥300-400
- 7寸触摸屏: ¥200-300
- 电源适配器: ¥50
- MicroSD 卡: ¥50
- 外壳: ¥50-100

**总计: 约 ¥650-900**
