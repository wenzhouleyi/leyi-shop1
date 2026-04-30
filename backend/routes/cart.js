const express = require('express');
const db = require('../config/database');
const { auth } = require('../middleware/auth');
const router = express.Router();

// 获取购物车
router.get('/', auth, (req, res) => {
  const list = db.prepare(`
    SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.original_price, p.stock, p.images
    FROM cart c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?
  `).all(req.user.id);
  res.json({ code: 200, data: list });
});

// 添加到购物车
router.post('/', auth, (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  const product = db.prepare('SELECT id, stock, status FROM products WHERE id = ?').get(product_id);
  if (!product) return res.json({ code: 404, message: '商品不存在' });
  if (product.stock < quantity) return res.json({ code: 400, message: '库存不足' });
  const existing = db.prepare('SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?').get(req.user.id, product_id);
  if (existing) {
    db.prepare('UPDATE cart SET quantity = quantity + ? WHERE id = ?').run(quantity, existing.id);
  } else {
    db.prepare('INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)').run(req.user.id, product_id, quantity);
  }
  res.json({ code: 200, message: '已加入购物车' });
});

// 更新购物车数量
router.put('/:id', auth, (req, res) => {
  const { quantity } = req.body;
  db.prepare('UPDATE cart SET quantity = ? WHERE id = ? AND user_id = ?').run(quantity, req.params.id, req.user.id);
  res.json({ code: 200, message: '更新成功' });
});

// 删除购物车项
router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM cart WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
  res.json({ code: 200, message: '删除成功' });
});

module.exports = router;
