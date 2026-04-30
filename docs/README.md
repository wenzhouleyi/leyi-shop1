# 温州乐翼电商系统

完整仿温州乐翼风格的电商网站 + 微信小程�?+ 后台管理系统�?
## 📁 项目结构

```
hzxk-shop/
├── backend/          # Node.js + Express 后端API
├── website/          # 响应式网站前�?(Vue3 CDN)
├── mini-program/     # 微信小程�?├── admin/            # 后台管理系统 (Vue3 + Element Plus)
└── docs/             # 文档
```

## 🚀 快速启�?
### 1. 安装依赖

```bash
cd backend
npm install
```

### 2. 初始化数据库

```bash
npm run init
```

### 3. 启动服务

```bash
npm start
```

服务启动后访问：
- 🌐 网站前端: http://localhost:3000
- 🖥�?后台管理: http://localhost:3000/admin/login.html
- 📱 小程�? 用微信开发者工具导�?mini-program 目录

## 🔑 默认账号

- 管理�? `admin` / `admin123`
- 测试用户: `testuser` / `user123`

## 📦 功能模块

| 模块 | 功能 |
|------|------|
| 商品管理 | 增删改查、分类、图片上�?|
| 购物�?| 添加、修改数量、删�?|
| 订单系统 | 下单、状态管理、订单列�?|
| 用户系统 | 注册、登录、个人中�?|
| 轮播�?| 首页Banner管理 |
| 后台管理 | 仪表盘、数据统计、全功能管理 |

## 🎨 设计风格

- 主色�?1890ff (蓝色)
- 辅色�?40a9ff
- 价格色：#ff4d4f (红色)
- 背景�?f0f2f5

## 🌐 部署到服务器

### 推荐方案

1. **阿里�?腾讯云轻量服务器** (2�?G �?9�?�?
2. **宝塔面板** 一键部�?3. **PM2** 进程管理

### 部署步骤

```bash
# 1. 服务器安装Node.js 18+
# 2. 上传项目代码
# 3. 安装依赖并启�?cd hzxk-shop/backend
npm install
npm run init
npm start

# 4. 使用PM2守护进程
npm install -g pm2
pm2 start server.js --name hzxk-shop
pm2 startup
pm2 save
```

### Nginx配置

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📱 小程序配�?
1. 打开 `mini-program/config/api.js`
2. 修改 `BASE_URL` 为你的服务器地址
3. 在微信开发者工具中导入项目
4. 配置合法域名

## 📝 API文档

所有API前缀: `/api`

| 接口 | 方法 | 说明 |
|------|------|------|
| /auth/login | POST | 用户登录 |
| /auth/register | POST | 用户注册 |
| /products | GET | 商品列表 |
| /products/:id | GET | 商品详情 |
| /cart | GET/POST | 购物�?|
| /orders | GET/POST | 订单 |
| /categories | GET | 分类列表 |
| /banners | GET | 轮播�?|

## ⚠️ 注意事项

1. 生产环境请修�?`JWT_SECRET`
2. 建议配置HTTPS
3. 图片上传目录 `uploads/` 需要可写权�?4. 数据库文件在 `backend/data/shop.db`

## 📄 许可�?
MIT License
