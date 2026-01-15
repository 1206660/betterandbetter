#!/bin/bash

# BetterAndBetter Kiosk 模式启动脚本
# 适用于树莓派

# 禁用屏幕保护程序
xset s off
xset -dpms
xset s noblank

# 隐藏鼠标光标（5秒后自动隐藏）
unclutter -idle 5 -root &

# 设置显示方向（如果需要旋转屏幕）
# xrandr --output HDMI-1 --rotate left

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
  --disable-background-networking \
  --disable-background-timer-throttling \
  --disable-breakpad \
  --disable-component-update \
  --disable-default-apps \
  --disable-dev-shm-usage \
  --disable-extensions \
  --disable-hang-monitor \
  --disable-prompt-on-repost \
  --disable-sync \
  --disable-translate \
  --metrics-recording-only \
  --no-first-run \
  --safebrowsing-disable-auto-update \
  --enable-automation \
  --password-store=basic \
  --use-mock-keychain \
  --app=https://betterandbetter.pages.dev/display

# 如果浏览器崩溃，自动重启
while true; do
  sleep 5
  if ! pgrep -x "chromium" > /dev/null; then
    echo "$(date): Chromium 已退出，正在重启..." >> /var/log/kiosk.log
    chromium-browser \
      --kiosk \
      --noerrdialogs \
      --disable-infobars \
      --app=https://betterandbetter.pages.dev/display &
  fi
done
