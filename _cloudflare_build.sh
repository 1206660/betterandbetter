#!/bin/bash
# Cloudflare Pages 构建脚本

set -e

echo "🔨 开始构建..."

# 安装依赖
npm install

# 构建项目
npm run build

echo "✅ 构建完成！"
