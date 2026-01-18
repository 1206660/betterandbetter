# 🚀 腾讯云快速部署（3 步完成）

## 第一步：配置环境变量

```bash
# 复制环境变量模板
cp env.example .env.local

# 编辑并填入你的 Supabase 配置
# NEXT_PUBLIC_SUPABASE_URL=你的supabase地址
# NEXT_PUBLIC_SUPABASE_ANON_KEY=你的supabase密钥
```

## 第二步：配置 SSH 免密登录

```bash
# 如果还没有配置 SSH 密钥，执行：
ssh-copy-id root@81.70.220.9

# 或者手动添加公钥到服务器的 ~/.ssh/authorized_keys
```

## 第三步：一键部署

```bash
# 运行部署脚本
./scripts/deploy-tencent.sh
```

## ✅ 完成！

部署成功后访问：**http://81.70.220.9:3000**

---

## 🔧 可选：配置域名和 HTTPS

如果需要使用域名访问：

```bash
# 配置 Nginx 反向代理
DOMAIN=your-domain.com ./scripts/setup-nginx.sh

# 然后配置 SSL 证书（使用 Let's Encrypt）
ssh root@81.70.220.9
apt-get install certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

## 📝 常用命令

```bash
# 查看日志
ssh root@81.70.220.9 'cd /opt/betterandbetter && docker-compose logs -f'

# 重启服务
ssh root@81.70.220.9 'cd /opt/betterandbetter && docker-compose restart'

# 更新代码
./scripts/deploy-tencent.sh
```
