# Cloudflare Pages 构建错误修复

## 问题
`npm ci` 错误：package-lock.json 和 package.json 不同步

## 解决方案

### 方法一：修改构建命令（推荐）

在 Cloudflare Pages 项目设置中，将构建命令改为：

```
npm install && npm run build
```

而不是使用默认的 `npm ci`。

### 方法二：使用构建脚本

1. 在项目设置中，Build command 填写：
   ```
   bash _cloudflare_build.sh
   ```

2. 确保脚本有执行权限（GitHub 会自动处理）

### 方法三：更新 package-lock.json

如果问题仍然存在，在本地运行：

```bash
rm package-lock.json
npm install
git add package-lock.json
git commit -m "Update package-lock.json"
git push
```

## 当前状态

✅ package-lock.json 已更新并推送到 GitHub
✅ 添加了 .nvmrc 文件指定 Node.js 版本
✅ 添加了构建脚本 _cloudflare_build.sh

## 下一步

1. 在 Cloudflare Pages 项目设置中
2. 将 Build command 改为：`npm install && npm run build`
3. 点击 "Save and Deploy"
4. 重新部署
