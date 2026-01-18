# 🔐 SSH 免密登录配置指南

## 方法一：使用自动配置脚本（推荐）

```bash
# 运行自动配置脚本
./scripts/setup-ssh-key.sh
```

脚本会自动：
1. 检查或生成 SSH 密钥
2. 复制公钥到服务器
3. 测试免密登录

## 方法二：手动配置

### 步骤 1: 检查是否已有 SSH 密钥

```bash
ls -la ~/.ssh/id_rsa
```

如果文件不存在，继续下一步生成密钥。

### 步骤 2: 生成 SSH 密钥对

```bash
# 生成新的 SSH 密钥（按提示操作，密码可直接回车跳过）
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa

# 或者不设置密码（直接回车）
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
```

### 步骤 3: 复制公钥到服务器

**方法 A: 使用 ssh-copy-id（最简单）**

```bash
ssh-copy-id root@81.70.220.9
```

首次连接需要输入服务器密码。

**方法 B: 手动复制**

```bash
# 1. 查看公钥内容
cat ~/.ssh/id_rsa.pub

# 2. 复制输出的内容，然后 SSH 登录服务器
ssh root@81.70.220.9

# 3. 在服务器上执行：
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo "你的公钥内容" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
exit
```

**方法 C: 一行命令复制**

```bash
cat ~/.ssh/id_rsa.pub | ssh root@81.70.220.9 \
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && \
   cat >> ~/.ssh/authorized_keys && \
   chmod 600 ~/.ssh/authorized_keys"
```

### 步骤 4: 测试免密登录

```bash
ssh root@81.70.220.9
```

如果不需要输入密码就能登录，说明配置成功！

## 🔧 常见问题

### 问题 1: 仍然需要输入密码

**检查服务器上的权限：**

```bash
ssh root@81.70.220.9
ls -la ~/.ssh/
# 应该看到：
# drwx------ .ssh
# -rw------- authorized_keys
```

如果权限不对，执行：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

**检查 SSH 配置：**

```bash
# 在服务器上检查
cat /etc/ssh/sshd_config | grep -E "PubkeyAuthentication|AuthorizedKeysFile"

# 应该看到：
# PubkeyAuthentication yes
# AuthorizedKeysFile .ssh/authorized_keys
```

如果 `PubkeyAuthentication` 是 `no`，需要修改：

```bash
sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
sudo systemctl restart sshd
```

### 问题 2: 连接超时

- 检查服务器 IP 是否正确
- 检查服务器是否开放 22 端口
- 检查防火墙设置

### 问题 3: 权限被拒绝 (Permission denied)

- 确认用户名正确（root 或其他用户）
- 检查服务器上的 `~/.ssh/authorized_keys` 文件是否存在
- 检查文件权限（必须是 600）

## 📝 使用不同的密钥文件

如果你有多个服务器，可以使用不同的密钥：

```bash
# 生成指定名称的密钥
ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa_tencent -N ""

# 使用指定密钥连接
ssh -i ~/.ssh/id_rsa_tencent root@81.70.220.9

# 或者在 ~/.ssh/config 中配置
cat >> ~/.ssh/config << EOF
Host tencent
    HostName 81.70.220.9
    User root
    IdentityFile ~/.ssh/id_rsa_tencent
EOF

# 然后就可以直接使用
ssh tencent
```

## ✅ 验证配置

配置成功后，运行部署脚本应该不需要输入密码：

```bash
./scripts/deploy-tencent.sh
```

如果脚本执行过程中不再提示输入密码，说明配置成功！
