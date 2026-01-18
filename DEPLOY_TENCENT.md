# 腾讯云服务器一键部署指南

## 📋 前置要求

1. **本地环境**
   - 已配置 SSH 密钥对，可以免密登录服务器
   - 已创建 `.env.local` 文件并配置了 Supabase 环境变量

2. **服务器要求**
   - Ubuntu 20.04+ / CentOS 7+ / Debian 10+
   - 至少 2GB 内存
   - 开放端口：22 (SSH), 3000 (应用), 80/443 (可选，用于 Nginx)

## 🚀 快速部署

### 方法一：一键部署脚本（推荐）

```bash
# 1. 确保已配置 .env.local 文件
cp env.example .env.local
# 编辑 .env.local，填入你的 Supabase 配置

# 2. 配置服务器 IP（如需要修改）
# 编辑 scripts/deploy-tencent.sh，修改 SERVER_IP 变量

# 3. 运行部署脚本
./scripts/deploy-tencent.sh
```

### 方法二：手动部署

如果一键脚本遇到问题，可以手动执行以下步骤：

```bash
# 1. SSH 连接到服务器
ssh root@81.70.220.9

# 2. 安装 Docker
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# 3. 安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# 4. 创建应用目录
mkdir -p /opt/betterandbetter
cd /opt/betterandbetter

# 5. 克隆项目（或使用 rsync 上传）
git clone <your-repo-url> .

# 6. 上传环境变量文件
# 在本地执行：
scp .env.local root@81.70.220.9:/opt/betterandbetter/.env.local

# 7. 构建并启动
cd /opt/betterandbetter
docker-compose up -d --build
```

## 🔧 配置 Nginx 反向代理（可选）

如果需要通过域名访问，可以配置 Nginx：

```bash
# 运行 Nginx 配置脚本
DOMAIN=your-domain.com ./scripts/setup-nginx.sh

# 或手动配置
ssh root@81.70.220.9
# 然后运行服务器上的配置命令
```

## 📝 常用管理命令

```bash
# 查看应用日志
ssh root@81.70.220.9 'cd /opt/betterandbetter && docker-compose logs -f'

# 重启应用
ssh root@81.70.220.9 'cd /opt/betterandbetter && docker-compose restart'

# 停止应用
ssh root@81.70.220.9 'cd /opt/betterandbetter && docker-compose down'

# 更新代码并重新部署
ssh root@81.70.220.9 'cd /opt/betterandbetter && git pull && docker-compose up -d --build'

# 查看容器状态
ssh root@81.70.220.9 'docker ps'

# 进入容器
ssh root@81.70.220.9 'docker exec -it betterandbetter_betterandbetter_1 sh'
```

## 🔒 安全建议

1. **配置防火墙**
   ```bash
   # Ubuntu/Debian
   ufw allow 22/tcp
   ufw allow 3000/tcp
   ufw enable
   
   # CentOS/RHEL
   firewall-cmd --permanent --add-port=22/tcp
   firewall-cmd --permanent --add-port=3000/tcp
   firewall-cmd --reload
   ```

2. **使用非 root 用户**
   - 创建专用用户并配置 SSH 密钥
   - 修改部署脚本中的 `SERVER_USER` 变量

3. **配置 SSL 证书**
   - 使用 Let's Encrypt 免费证书
   - 配置 Nginx HTTPS 反向代理

## 🐛 故障排查

### 问题：SSH 连接失败
- 检查服务器 IP 是否正确
- 确认 SSH 密钥已配置
- 检查服务器安全组是否开放 22 端口

### 问题：Docker 构建失败
- 检查 `.env.local` 文件是否正确上传
- 查看构建日志：`docker-compose logs`
- 确认服务器内存足够（至少 2GB）

### 问题：应用无法访问
- 检查容器是否运行：`docker ps`
- 检查端口是否开放：`netstat -tlnp | grep 3000`
- 查看应用日志：`docker-compose logs -f`

### 问题：环境变量未生效
- 确认 `.env.local` 文件在服务器上存在
- 检查 `docker-compose.yml` 中的环境变量配置
- 重新构建容器：`docker-compose up -d --build`

## 📞 访问应用

部署成功后，通过以下地址访问：

- **直接访问**：http://81.70.220.9:3000
- **Nginx 代理**：http://your-domain.com（如果配置了域名）

## 🔄 更新部署

当代码更新后，重新运行部署脚本即可：

```bash
./scripts/deploy-tencent.sh
```

脚本会自动：
1. 拉取最新代码
2. 重新构建 Docker 镜像
3. 重启容器
