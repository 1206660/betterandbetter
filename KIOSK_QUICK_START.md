# Kiosk 模式快速开始指南

## 🎯 推荐方案：树莓派 + 触摸屏

**成本**: 约 ¥650-900  
**配置时间**: 30 分钟  
**稳定性**: ⭐⭐⭐⭐⭐

## 📦 硬件清单

1. **树莓派 4B** (4GB RAM) - ¥300-400
2. **7寸触摸屏** - ¥200-300
3. **电源适配器** (5V 3A) - ¥50
4. **MicroSD 卡** (32GB+) - ¥50
5. **外壳** (可选) - ¥50-100

**总成本**: ¥650-900

## 🚀 5 步快速部署

### 步骤 1: 准备系统

1. 下载 [Raspberry Pi Imager](https://www.raspberrypi.com/software/)
2. 烧录 **Raspberry Pi OS (Desktop)** 到 SD 卡
3. 在首次启动前配置：
   - ✅ 启用 SSH
   - ✅ 设置 WiFi
   - ✅ 设置用户名和密码

### 步骤 2: 上传脚本

```bash
# 在 Windows 上使用 PowerShell
scp -r scripts/raspberry-pi pi@raspberrypi.local:~/
```

或使用 WinSCP、FileZilla 等工具上传 `scripts/raspberry-pi` 文件夹。

### 步骤 3: 运行配置脚本

```bash
# SSH 连接到树莓派
ssh pi@raspberrypi.local

# 进入脚本目录
cd ~/raspberry-pi

# 运行自动配置脚本
sudo bash setup-kiosk.sh
```

### 步骤 4: 重启设备

```bash
sudo reboot
```

### 步骤 5: 完成！

设备重启后会自动：
- ✅ 进入全屏 Kiosk 模式
- ✅ 显示 BetterAndBetter 应用
- ✅ 自动连接网络
- ✅ 防止屏幕休眠

## 🔧 常用命令

### 查看服务状态
```bash
sudo systemctl status betterandbetter-kiosk.service
```

### 查看日志
```bash
journalctl -u betterandbetter-kiosk.service -f
```

### 重启服务
```bash
sudo systemctl restart betterandbetter-kiosk.service
```

### 停止服务（退出 Kiosk 模式）
```bash
sudo systemctl stop betterandbetter-kiosk.service
```

## 🛠️ 故障排除

### 问题：页面无法加载

1. 检查网络：`ping 8.8.8.8`
2. 检查 DNS：`nslookup betterandbetter.pages.dev`
3. 手动测试：`chromium-browser https://betterandbetter.pages.dev/display`

### 问题：触摸屏不工作

```bash
# 校准触摸屏
sudo apt install xinput-calibrator
xinput_calibrator
```

### 问题：自动启动失败

```bash
# 查看启动日志
journalctl -b -u betterandbetter-kiosk.service

# 手动测试启动脚本
/home/pi/kiosk.sh
```

## 📱 其他方案

### Android 平板（快速部署）

1. 安装 **Fully Kiosk Browser**
2. 设置启动 URL: `https://betterandbetter.pages.dev/display`
3. 启用全屏和开机自启
4. 锁定应用

**成本**: ¥500-1500（已有平板）

### 迷你PC（高性能）

1. 安装 Windows/Linux
2. 配置浏览器 Kiosk 模式
3. 设置开机自启

**成本**: ¥1000-3000

## 💡 优化建议

### 1. 网络优化

配置静态 IP（可选）：
```bash
sudo nano /etc/dhcpcd.conf
```

添加：
```
interface wlan0
static ip_address=192.168.1.100/24
static routers=192.168.1.1
```

### 2. 电源管理

确保电源稳定，建议使用：
- 官方电源适配器
- 或质量好的 5V 3A USB-C 电源

### 3. 定期维护

```bash
# 每月更新一次系统
sudo apt update && sudo apt upgrade -y
```

## 📞 需要帮助？

查看详细文档：
- [DEPLOY_KIOSK.md](./DEPLOY_KIOSK.md) - 完整部署指南
- [scripts/raspberry-pi/README.md](./scripts/raspberry-pi/README.md) - 脚本说明

## ✅ 检查清单

部署前确认：
- [ ] 树莓派已安装系统
- [ ] WiFi 已配置
- [ ] SSH 已启用
- [ ] 脚本已上传
- [ ] 配置脚本已运行
- [ ] 设备已重启
- [ ] 页面正常显示
- [ ] 触摸屏工作正常
- [ ] 断电重启测试通过

---

**完成！** 现在你的设备已经配置为 Kiosk 模式，断电重启后会自动显示应用。
