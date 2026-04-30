const express = require('express');
const db = require('../config/database');
const { auth, adminAuth } = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();

// 创建订单
router.post('/', auth, (req, res) => {
  try {
    const { items, remark, address } = req.body;
    if (!items || !items.length) return res.json({ code: 400, message: '订单商品不能为空' });
    const cartIds = items.map(i => i.cart_id).filter(Boolean);
    
    let total = 0;
    const orderItems = [];
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.product_id);
      if (!product) return res.json({ code: 404, message: `商品不存在: ${item.product_id}` });
      if (product.stock < item.quantity) return res.json({ code: 400, message: `库存不足: ${product.name}` });
      total += product.price * item.quantity;
      orderItems.push({
        product_id: product.id, product_name: product.name,
        price: product.price, quantity: item.quantity,
        image: JSON.parse(product.images || '[]')[0] || ''
      });
    }
    const orderNo = uuidv4().slice(0, 8).toUpperCase() + Date.now().toString().slice(-6);
    const orderResult = db.prepare(
      'INSERT INTO orders (order_no, user_id, total_amount, remark, address) VALUES (?, ?, ?, ?, ?)'
    ).run(orderNo, req.user.id, total, remark || '', address || '');
    const orderId = orderResult.lastInsertRowid;
    const insertItem = db.prepare(
      'INSERT INTO order_items (order_id, product_id, product_name, price, quantity, image) VALUES (?, ?, ?, ?, ?, ?)'
    );
    const deductStock = db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?');
    for (const oi of orderItems) {
      insertItem.run(orderId, oi.product_id, oi.product_name, oi.price, oi.quantity, oi.image);
      deductStock.run(oi.quantity, oi.product_id);
    }
    // 清除购物车
    if (cartIds.length) {
      const placeholders = cartIds.map(() => '?').join(',');
      db.prepare(`DELETE FROM cart WHERE id IN (${placeholders}) AND user_id = ?`).run(...cartIds, req.user.id);
    }
    res.json({ code: 200, message: '下单成功', data: { order_id: orderId, order_no: orderNo, total_amount: total } });
  } catch (e) { res.json({ code: 500, message: e.message }); }
});

// 订单列表
router.get('/', auth, (req, res) => {
  const { page = 1, size = 20, status } = req.query;
  const offset = (page - 1) * size;
  let where = 'WHERE o.user_id = ?';
  const params = [req.user.id];
  if (status) { where += ' AND o.status = ?'; params.push(status); }
  const list = db.prepare(`
    SELECT o.*, (SELECT GROUP_CONCAT(oi.product_name, '、') FROM order_items oi WHERE oi.order_id = o.id) as product_names
    FROM orders o ${where} ORDER BY o.id DESC LIMIT ? OFFSET ?
  `).all(...params, Number(size), Number(offset));
  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o ${where}`).get(...params).count;
  // 获取每个订单的商品
  const ordersWithItems = list.map(o => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    return { ...o, items };
  });
  res.json({ code: 200, data: { list: ordersWithItems, total, page: Number(page) } });
});

// 订单详情
router.get('/:id', auth, (req, res) => {
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
  if (!order) return res.json({ code: 404, message: '订单不存在' });
  const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(order.id);
  res.json({ code: 200, data: { ...order, items } });
});

// 更新订单状态（管理员）
router.put('/:id/status', adminAuth, (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ code: 200, message: '状态更新成功' });
});

// 管理员查看所有订单
router.get('/admin/all', adminAuth, (req, res) => {
  const { page = 1, size = 20, status } = req.query;
  const offset = (page - 1) * size;
  let where = 'WHERE 1=1';
  const params = [];
  if (status) { where += ' AND o.status = ?'; params.push(status); }
  const list = db.prepare(`
    SELECT o.*, u.username as user_name
    FROM orders o LEFT JOIN users u ON o.user_id = u.id
    ${where} ORDER BY o.id DESC LIMIT ? OFFSET ?
  `).all(...params, Number(size), Number(offset));
  const total = db.prepare(`SELECT COUNT(*) as count FROM orders o ${where}`).get(...params).count;
  const ordersWithItems = list.map(o => {
    const items = db.prepare('SELECT * FROM order_items WHERE order_id = ?').all(o.id);
    return { ...o, items };
  });
  res.json({ code: 200, data: { list: ordersWithItems, total, page: Number(page) } });
});

module.exports = router;
