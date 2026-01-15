# 一体化设备部署指南（Kiosk 模式）

本指南帮助你将 BetterAndBetter 应用部署到一体化设备上，实现断电重启后立即显示。

## 方案概述

### 推荐方案对比

| 方案 | 优点 | 缺点 | 适用场景 |
|------|------|------|----------|
| **树莓派 + 触摸屏** | 成本低、功耗低、稳定 | 需要组装、配置复杂 | 预算有限、DIY能力强 |
| **Android 平板** | 开箱即用、触摸屏、电池 | 需要Root、定制化有限 | 快速部署、移动需求 |
| **迷你PC + 显示器** | 性能好、配置灵活 | 成本较高、体积大 | 固定位置、性能要求高 |
| **Chromebox/Chromebit** | 专为Kiosk设计、稳定 | 价格较高、配置受限 | 商业场景、长期运行 |

### 推荐方案：树莓派 4B + 触摸屏（性价比最高）

## 方案一：树莓派 + 触摸屏（推荐）

### 硬件清单

1. **树莓派 4B** (4GB/8GB RAM)
   - 价格：约 ¥300-500
   - 性能：足够运行浏览器和显示页面

2. **触摸屏** (7-10寸)
   - 官方触摸屏：7寸 IPS 触摸屏
   - 第三方：10寸 HDMI 触摸屏
   - 价格：约 ¥200-500

3. **电源适配器**
   - 官方 5V 3A USB-C 电源
   - 价格：约 ¥50

4. **MicroSD 卡** (32GB+)
   - Class 10 或更高
   - 价格：约 ¥50

5. **外壳**（可选）
   - 3D打印或购买现成外壳
   - 价格：约 ¥50-100

**总成本：约 ¥650-1200**

### 软件配置

#### 1. 安装 Raspberry Pi OS

```bash
# 下载 Raspberry Pi Imager
# https://www.raspberrypi.com/software/

# 使用 Imager 烧录系统到 SD 卡
# 配置：
# - 启用 SSH
# - 设置 WiFi
# - 设置用户名和密码
```

#### 2. 安装必要软件

```bash
# SSH 连接到树莓派
ssh pi@raspberrypi.local

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Chromium（轻量级浏览器）
sudo apt install chromium-browser unclutter -y

# 安装 Node.js（如果需要本地运行）
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 3. 配置自动启动和全屏模式

创建启动脚本：

```bash
# 创建启动脚本
sudo nano /home/pi/kiosk.sh
```

脚本内容：

```bash
#!/bin/bash

# 禁用屏幕保护程序
xset s off
xset -dpms
xset s noblank

# 隐藏鼠标光标（5秒后）
unclutter -idle 5 &

# 启动 Chromium 全屏模式
chromium-browser \
  --kiosk \
  --noerrdialogs \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-restore-session-state \
  --autoplay-policy=no-user-gesture-required \
  --check-for-update-interval=31536000 \
  --disable-features=TranslateUI \
  --disable-ipc-flooding-protection \
  https://betterandbetter.pages.dev/display
```

设置执行权限：

```bash
chmod +x /home/pi/kiosk.sh
```

#### 4. 配置自动登录和启动

```bash
# 配置自动登录
sudo raspi-config
# 选择: System Options > Boot / Auto Login > Desktop Autologin

# 或者手动编辑
sudo nano /etc/systemd/system/getty@tty1.service.d/autologin.conf
```

内容：

```ini
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin pi --noclear %I $TERM
```

#### 5. 配置桌面自动启动

```bash
# 创建 .xprofile 文件
nano /home/pi/.xprofile
```

内容：

```bash
#!/bin/bash
/home/pi/kiosk.sh
```

设置权限：

```bash
chmod +x /home/pi/.xprofile
```

#### 6. 配置网络自动连接

```bash
# 编辑 WiFi 配置
sudo nano /etc/wpa_supplicant/wpa_supplicant.conf
```

确保包含：

```conf
country=CN
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1

network={
    ssid="你的WiFi名称"
    psk="你的WiFi密码"
    priority=1
}
```

#### 7. 配置自动刷新（防止页面卡死）

在应用端添加自动刷新逻辑（已在代码中实现），或使用浏览器扩展。

#### 8. 配置电源管理（防止自动休眠）

```bash
# 编辑电源管理配置
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

添加：

```ini
@xset s off
@xset -dpms
@xset s noblank
```

#### 9. 配置开机自启服务（更可靠的方式）

创建 systemd 服务：

```bash
sudo nano /etc/systemd/system/kiosk.service
```

内容：

```ini
[Unit]
Description=BetterAndBetter Kiosk Mode
After=graphical.target

[Service]
Type=simple
User=pi
Environment=DISPLAY=:0
ExecStart=/home/pi/kiosk.sh
Restart=always
RestartSec=10

[Install]
WantedBy=graphical.target
```

启用服务：

```bash
sudo systemctl enable kiosk.service
sudo systemctl start kiosk.service
```

### 测试和调试

```bash
# 查看服务状态
sudo systemctl status kiosk.service

# 查看日志
journalctl -u kiosk.service -f

# 手动测试启动脚本
/home/pi/kiosk.sh
```

---

## 方案二：Android 平板（快速部署）

### 硬件要求

- Android 7.0+ 平板
- 支持充电底座（保持供电）
- 触摸屏

### 配置步骤

#### 1. 安装 Kiosk 浏览器

推荐应用：
- **Kiosk Browser Lock** (免费)
- **Fully Kiosk Browser** (付费，功能更全)

#### 2. 配置 Fully Kiosk Browser

1. 安装应用
2. 设置启动 URL: `https://betterandbetter.pages.dev/display`
3. 启用全屏模式
4. 禁用所有导航按钮
5. 设置自动刷新（每 5 分钟）
6. 启用开机自启动
7. 锁定应用（防止退出）

#### 3. 配置 Android 开机自启

```bash
# 需要 Root 权限或使用 Tasker
# 或使用 Fully Kiosk Browser 的内置功能
```

#### 4. 防止休眠

- 在设置中禁用自动休眠
- 保持充电状态
- 使用"保持屏幕常亮"应用

---

## 方案三：迷你PC + 显示器

### 硬件清单

- 迷你PC（如 Intel NUC、Beelink）
- HDMI 显示器（触摸屏可选）
- 键盘鼠标（仅配置时使用）

### 配置步骤

#### Windows 系统

1. **安装 Edge/Chrome**
2. **配置 Kiosk 模式**：

创建批处理文件 `kiosk.bat`：

```batch
@echo off
start msedge.exe --kiosk --edge-kiosk-type=fullscreen https://betterandbetter.pages.dev/display
```

3. **配置开机自启**：

- Win + R 输入 `shell:startup`
- 将批处理文件放入启动文件夹

4. **禁用屏幕保护程序**：
- 控制面板 > 电源选项 > 关闭显示器：从不

#### Linux 系统

参考树莓派配置方案。

---

## 方案四：Chromebox/Chromebit（商业方案）

### 优势

- 专为 Kiosk 设计
- 系统稳定
- 自动更新
- 远程管理

### 配置步骤

1. 启用开发者模式
2. 配置 Kiosk 模式
3. 设置启动 URL
4. 锁定设备

---

## 通用优化配置

### 1. 应用端优化

#### 防止页面休眠

在 `app/display/page.tsx` 中添加：

```typescript
// 防止页面休眠
useEffect(() => {
  if ('wakeLock' in navigator) {
    navigator.wakeLock.request('screen').catch(() => {})
  }
  
  // 页面可见性 API
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      fetchReminders()
    }
  }
  
  document.addEventListener('visibilitychange', handleVisibilityChange)
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
  }
}, [])
```

#### 自动重连

```typescript
// 网络断开时自动重连
useEffect(() => {
  const handleOnline = () => {
    fetchReminders()
    // 重新订阅 Realtime
  }
  
  window.addEventListener('online', handleOnline)
  return () => window.removeEventListener('online', handleOnline)
}, [])
```

### 2. 浏览器优化

#### 禁用更新提示

在启动参数中添加：
```bash
--disable-background-networking
--disable-background-timer-throttling
--disable-breakpad
--disable-component-update
--disable-default-apps
--disable-dev-shm-usage
--disable-extensions
--disable-features=TranslateUI
--disable-hang-monitor
--disable-prompt-on-repost
--disable-sync
--disable-translate
--metrics-recording-only
--no-first-run
--safebrowsing-disable-auto-update
--enable-automation
--password-store=basic
--use-mock-keychain
```

### 3. 网络配置

#### 静态 IP（可选）

```bash
# 树莓派配置静态 IP
sudo nano /etc/dhcpcd.conf
```

添加：

```
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
static domain_name_servers=8.8.8.8 8.8.4.4
```

### 4. 监控和维护

#### 远程访问

```bash
# 启用 SSH（已默认启用）
# 使用 VNC 远程桌面（可选）
sudo apt install realvnc-vnc-server
```

#### 日志监控

```bash
# 创建日志脚本
sudo nano /home/pi/check_kiosk.sh
```

```bash
#!/bin/bash
if ! pgrep -x "chromium" > /dev/null; then
    systemctl restart kiosk.service
    echo "$(date): Kiosk restarted" >> /var/log/kiosk.log
fi
```

添加到 crontab：

```bash
crontab -e
# 每 5 分钟检查一次
*/5 * * * * /home/pi/check_kiosk.sh
```

---

## 故障排除

### 问题：断电后无法自动启动

**解决方案**：
1. 检查 SD 卡是否损坏
2. 检查电源是否稳定
3. 检查启动脚本权限
4. 查看系统日志：`journalctl -b`

### 问题：页面无法加载

**解决方案**：
1. 检查网络连接：`ping 8.8.8.8`
2. 检查 DNS：`nslookup betterandbetter.pages.dev`
3. 检查浏览器日志
4. 尝试手动访问 URL

### 问题：触摸屏不工作

**解决方案**：
1. 检查触摸屏驱动
2. 校准触摸屏：`xinput_calibrator`
3. 检查 USB 连接

### 问题：自动休眠

**解决方案**：
1. 检查电源管理设置
2. 禁用屏幕保护程序
3. 使用 Wake Lock API（应用端）

---

## 成本对比

| 方案 | 硬件成本 | 配置难度 | 稳定性 | 推荐度 |
|------|----------|----------|--------|--------|
| 树莓派 + 触摸屏 | ¥650-1200 | 中等 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Android 平板 | ¥500-1500 | 简单 | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| 迷你PC + 显示器 | ¥1000-3000 | 简单 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Chromebox | ¥1500-3000 | 简单 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 推荐方案总结

**最佳性价比**：树莓派 4B + 7寸触摸屏
- 成本：约 ¥800
- 配置时间：2-3 小时
- 稳定性：高
- 可维护性：好

**快速部署**：Android 平板 + Fully Kiosk Browser
- 成本：约 ¥800-1500
- 配置时间：30 分钟
- 稳定性：中等
- 可维护性：中等

---

## 下一步

1. 选择硬件方案
2. 按照对应方案配置
3. 测试断电重启
4. 部署到实际环境
5. 配置监控和维护

需要我帮你创建具体的配置脚本吗？
