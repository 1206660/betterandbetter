# 阿里云部署指南

## 方案一：使用阿里云 ECS + Docker

### 1. 购买 ECS 服务器

- 访问：https://ecs.console.aliyun.com
- 选择配置（建议：2核4G，Ubuntu 22.04）
- 购买并获取公网 IP

### 2. 在服务器上安装 Docker

```bash
# 更新系统
sudo apt update

# 安装 Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装 Docker Compose
sudo apt install docker-compose -y
```

### 3. 上传项目文件

使用 Git 或 SCP 上传项目到服务器：

```bash
# 方式一：使用 Git
git clone <your-repo-url>
cd betterandbetter

# 方式二：使用 SCP
scp -r betterandbetter user@your-server-ip:/home/user/
```

### 4. 配置环境变量

在服务器上创建 `.env.local` 文件：

```bash
nano .env.local
```

添加：
```
NEXT_PUBLIC_SUPABASE_URL=https://fanpgiptyqupseikdczv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_teJPIzQyJWIJkU9QzFUdTA_qSFb4K18
```

### 5. 使用 Docker Compose 部署

```bash
docker-compose up -d
```

### 6. 配置 Nginx 反向代理（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 方案二：使用阿里云函数计算 FC

适合 Serverless 部署，按量付费。

## 方案三：使用阿里云容器服务 ACK

适合大规模部署，需要 Kubernetes 知识。
