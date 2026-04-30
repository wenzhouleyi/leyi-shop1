const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// 启动时自动初始化数据库
require('./init-db');

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件（上传图片、前端页面）
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, '..', 'website')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/banners', require('./routes/banners'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));

// 管理后台静态页面
app.use('/admin', express.static(path.join(__dirname, '..', 'admin')));
app.get('/admin/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin', 'index.html'));
});

// 前端路由回退
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ code: 404, message: '接口不存在' });
  res.sendFile(path.join(__dirname, '..', 'website', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 温州乐翼电商系统已启动，端口 ${PORT}`);
  console.log(`📱 前台: http://localhost:${PORT}/`);
  console.log(`🔐 后台: http://localhost:${PORT}/admin/login.html`);
  console.log(`🔑 默认管理员: admin / admin123`);
});
