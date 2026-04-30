const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// 用户列表（管理员）
router.get('/', adminAuth, (req, res) => {
  const { page = 1, size = 20 } = req.query;
  const offset = (page - 1) * size;
  const list = db.prepare('SELECT id, username, phone, avatar, role, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?')
    .all(Number(size), Number(offset));
  const total = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  res.json({ code: 200, data: { list, total, page: Number(page) } });
});

// 用户详情
router.get('/:id', adminAuth, (req, res) => {
  const user = db.prepare('SELECT id, username, phone, avatar, role, created_at FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.json({ code: 404, message: '用户不存在' });
  res.json({ code: 200, data: user });
});

module.exports = router;
