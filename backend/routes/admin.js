const express = require('express');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const router = express.Router();

// 所有路由都需要登录和管理员权限
router.use(adminAuth);

// 获取统计数据
router.get('/stats', (req, res) => {
  try {
    const products = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const orders = db.prepare('SELECT COUNT(*) as count FROM orders').get().count;
    const users = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
    const todayOrders = db.prepare(`SELECT COUNT(*) as count FROM orders WHERE date(created_at) = date('now')`).get().count;
    res.json({ code: 200, data: { products, orders, users, todayOrders } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 商品列表（带分页）
router.get('/products', (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const keyword = req.query.keyword || '';
    
    let where = '';
    let params = [];
    if (keyword) {
      where = 'WHERE name LIKE ?';
      params.push(`%${keyword}%`);
    }
    
    const total = db.prepare(`SELECT COUNT(*) as count FROM products ${where}`).get(...params).count;
    const list = db.prepare(`SELECT * FROM products ${where} ORDER BY id DESC LIMIT ? OFFSET ?`).all(...params, limit, offset);
    
    res.json({ code: 200, data: { list, total, page, limit } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 添加商品
router.post('/products', (req, res) => {
  try {
    const { name, price, original_price, stock, description, category_id } = req.body;
    const result = db.prepare(`
      INSERT INTO products (name, category_id, price, original_price, stock, description, images, specs, status)
      VALUES (?, ?, ?, ?, ?, ?, '[]', '{}', 'active')
    `).run(name, category_id || 1, price, original_price, stock, description);
    res.json({ code: 200, data: { id: result.lastInsertRowid } });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 更新商品
router.put('/products/:id', (req, res) => {
  try {
    const { name, price, original_price, stock, description, status } = req.body;
    db.prepare(`
      UPDATE products SET name=?, price=?, original_price=?, stock=?, description=?, status=?, updated_at=CURRENT_TIMESTAMP
      WHERE id=?
    `).run(name, price, original_price, stock, description, status, req.params.id);
    res.json({ code: 200, message: '更新成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 删除商品
router.delete('/products/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM products WHERE id=?').run(req.params.id);
    res.json({ code: 200, message: '删除成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 用户列表
router.get('/users', (req, res) => {
  try {
    const users = db.prepare('SELECT id, username, phone, role, created_at, remark FROM users ORDER BY id DESC').all();
    res.json({ code: 200, data: users });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 更新用户备注
router.put('/users/:id/remark', (req, res) => {
  try {
    const { remark } = req.body;
    db.prepare('UPDATE users SET remark=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(remark || '', req.params.id);
    res.json({ code: 200, message: '备注更新成功' });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

// 订单列表
router.get('/orders', (req, res) => {
  try {
    const orders = db.prepare(`
      SELECT o.*, u.username as user_name 
      FROM orders o 
      LEFT JOIN users u ON o.user_id = u.id 
      ORDER BY o.id DESC
    `).all();
    res.json({ code: 200, data: orders });
  } catch (e) {
    res.json({ code: 500, message: e.message });
  }
});

module.exports = router;
