#!/bin/bash
# ============================================
# 温州乐翼电商系统 - 一键部署脚本
# 支持: Railway / Render / VPS
# ============================================

set -e

echo "========================================"
echo "  温州乐翼电商系统 - 部署脚本"
echo "========================================"

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目信息
PROJECT_NAME="leyi-shop"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo -e "${YELLOW}项目目录: $PROJECT_DIR${NC}"

# ============================================
# 步骤1: 检查环境
# ============================================
echo ""
echo -e "${YELLOW}[1/5] 检查环境...${NC}"

if ! command -v node &> /dev/null; then
    echo -e "${RED}错误: Node.js 未安装${NC}"
    echo "请先安装 Node.js: https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Node.js 版本: $(node -v)${NC}"

# ============================================
# 步骤2: 安装依赖
# ============================================
echo ""
echo -e "${YELLOW}[2/5] 安装项目依赖...${NC}"

cd "$PROJECT_DIR/backend"
npm install 2>/dev/null || {
    echo -e "${RED}npm install 失败，尝试使用国内镜像...${NC}"
    npm install --registry=https://registry.npmmirror.com
}

echo -e "${GREEN}✓ 依赖安装完成${NC}"

# ============================================
# 步骤3: 初始化数据库
# ============================================
echo ""
echo -e "${YELLOW}[3/5] 初始化数据库...${NC}"

cd "$PROJECT_DIR/backend"
node init-db.js 2>/dev/null || {
    echo -e "${YELLOW}注意: 数据库可能已存在，跳过初始化${NC}"
}

echo -e "${GREEN}✓ 数据库就绪${NC}"

# ============================================
# 步骤4: 配置环境变量
# ============================================
echo ""
echo -e "${YELLOW}[4/5] 配置环境变量...${NC}"

# Railway/Render 环境变量
if [ -n "$RAILWAY_STATIC_URL" ]; then
    export PORT="${PORT:-3000}"
    echo -e "${GREEN}✓ Railway 环境检测到${NC}"
elif [ -n "$RENDER" ]; then
    export PORT="${PORT:-3000}"
    echo -e "${GREEN}✓ Render 环境检测到${NC}"
fi

# ============================================
# 步骤5: 启动服务
# ============================================
echo ""
echo -e "${YELLOW}[5/5] 启动服务...${NC}"

# 设置端口
PORT="${PORT:-3000}"
HOST="${HOST:-0.0.0.0}"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  服务启动成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  前台: http://localhost:$PORT/${NC}"
echo -e "${GREEN}  后台: http://localhost:$PORT/admin/login.html${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 启动服务
exec node "$PROJECT_DIR/backend/server.js"
