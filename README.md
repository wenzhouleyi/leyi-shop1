# 温州乐翼电商系统

温州市乐翼通信有限公司官方电商平台。

## 技术栈

- 后端：Node.js + Express + SQLite (sql.js)
- 前台：HTML5 + Vanilla JS
- 管理后台：HTML5 + Element Plus CDN
- 微信小程序：原生开发

## 项目结构

```
leyi-shop/
├── backend/          # 后端 API 服务
├── website/          # 用户端网站
├── admin/            # 管理后台
├── mini-program/     # 微信小程序
├── deploy/           # 部署配置文件
└── docs/             # 文档
```

## 快速部署到 Render

1. Fork 本仓库
2. 在 Render.com (https://render.com) 创建 Web Service
3. 连接 GitHub 仓库，选择 Singapore 区域
4. Root Directory 填写 `backend`
5. Build Command: `npm install`
6. Start Command: `node server.js`

## 后台管理

访问 `/admin/login.html`
- 管理员账号：`admin` / `admin123`

## 开发

```bash
cd backend
npm install
npm start
```
