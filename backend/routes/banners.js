const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// 轮播图列表
router.get('/', (req, res) => {
  const list = db.prepare('SELECT * FROM banners WHERE status = ? ORDER BY sort_order ASC', ['active']).all();
  res.json({ code: 200, data: list });
});

// 所有轮播图（管理员）
router.get('/admin/all', adminAuth, (req, res) => {
  const list = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all();
  res.json({ code: 200, data: list });
});

// 添加轮播图
router.post('/', adminAuth, upload.single('image'), (req, res) => {
  const { title, link, sort_order, status } = req.body;
  const image_url = req.file ? '/uploads/' + req.file.filename : '';
  db.prepare('INSERT INTO banners (title, image_url, link, sort_order, status) VALUES (?, ?, ?, ?, ?)')
    .run(title, image_url, link || '', sort_order || 0, status || 'active');
  res.json({ code: 200, message: '添加成功' });
});

// 删除轮播图
router.delete('/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

module.exports = router;
