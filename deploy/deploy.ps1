# ============================================
# 温州乐翼电商系统 - Windows 一键部署脚本
# 用于本地打包或Windows服务器部署
# ============================================

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  温州乐翼电商系统 - 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 项目配置
$PROJECT_NAME = "leyi-shop"
$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND_DIR = Join-Path $PROJECT_DIR "backend"
$DEPLOY_DIR = Join-Path $PROJECT_DIR "deploy-package"

Write-Host ""
Write-Host "[1/6] 清理旧文件..." -ForegroundColor Yellow

# 清理旧打包文件
if (Test-Path $DEPLOY_DIR) {
    Remove-Item -Recurse -Force $DEPLOY_DIR
}
New-Item -ItemType Directory -Force -Path $DEPLOY_DIR | Out-Null

Write-Host "[2/6] 复制项目文件..." -ForegroundColor Yellow

# 复制必要目录
$dirs = @("backend", "website", "admin", "docs")
foreach ($dir in $dirs) {
    $src = Join-Path $PROJECT_DIR $dir
    $dst = Join-Path $DEPLOY_DIR $dir
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $dst -Recurse -Force
        Write-Host "  ✓ 复制 $dir" -ForegroundColor Green
    }
}

# 复制必要文件
$files = @("package.json", "logo-wenzhou-leyi.png", "logo-wenzhou-leyi.svg")
foreach ($file in $files) {
    $src = Join-Path $PROJECT_DIR $file
    $dst = Join-Path $DEPLOY_DIR $file
    if (Test-Path $src) {
        Copy-Item -Path $src -Destination $DEPLOY_DIR -Force
        Write-Host "  ✓ 复制 $file" -ForegroundColor Green
    }
}

Write-Host "[3/6] 复制部署配置文件..." -ForegroundColor Yellow

# 复制部署配置
$deployFiles = @("deploy/package.json", "deploy/railway.toml", "deploy/deploy.sh")
foreach ($file in $deployFiles) {
    $src = Join-Path $PROJECT_DIR $file
    if (Test-Path $src) {
        $name = Split-Path $file -Leaf
        Copy-Item -Path $src -Destination (Join-Path $DEPLOY_DIR $name) -Force
        Write-Host "  ✓ 复制 $name" -ForegroundColor Green
    }
}

Write-Host "[4/6] 排除 node_modules..." -ForegroundColor Yellow

# 确保没有 node_modules
Get-ChildItem -Path $DEPLOY_DIR -Recurse -Directory -Filter "node_modules" | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "  ✓ 已排除 node_modules" -ForegroundColor Green

Write-Host "[5/6] 创建部署说明..." -ForegroundColor Yellow

# 创建 README
$readme = @"
# 温州乐翼电商系统部署包

## 项目结构
- backend/     - 后端API服务
- website/     - 前台网站
- admin/       - 后台管理
- docs/        - 部署文档

## 快速部署

### 方式1: Railway (推荐免费)
1. 访问 https://railway.app
2. 使用 GitHub 登录
3. 点击 "New Project" → "Deploy from GitHub"
4. 上传本项目到 GitHub 仓库
5. Railway 会自动检测 Node.js 并部署

### 方式2: Render
1. 访问 https://render.com
2. 使用 GitHub 登录
3. 点击 "New" → "Web Service"
4. 连接 GitHub 仓库
5. 设置: Build Command: `npm install`
           Start Command: `node backend/server.js`

### 方式3: VPS 服务器
\`\`\`bash
# 上传文件到服务器
scp -r ./* user@your-server:/var/www/leyi-shop/

# SSH 登录服务器
ssh user@your-server

# 进入项目目录
cd /var/www/leyi-shop/backend

# 安装依赖
npm install

# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start server.js --name leyi-shop

# 设置开机自启
pm2 save
pm2 startup
\`\`\`

## 环境变量
- PORT: 服务器端口 (默认 3000)
- NODE_ENV: production

## 数据库
使用 SQLite，数据库文件: backend/data/shop.db

## 注意事项
1. 首次部署需要初始化数据库
2. 建议配置 HTTPS (Let's Encrypt)
3. 定期备份数据库文件
"@

$readme | Out-File -FilePath (Join-Path $DEPLOY_DIR "README.md") -Encoding UTF8

Write-Host "[6/6] 创建压缩包..." -ForegroundColor Yellow

# 创建压缩包
$zipName = "leyi-shop-deploy-$((Get-Date).ToString('yyyyMMdd-HHmmss')).zip"
$zipPath = Join-Path $PROJECT_DIR $zipName

Compress-Archive -Path "$DEPLOY_DIR\*" -DestinationPath $zipPath -Force

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  部署包创建完成!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "压缩包位置: $zipPath" -ForegroundColor White
Write-Host "解压后请查看 README.md 获取部署说明" -ForegroundColor White
Write-Host ""
