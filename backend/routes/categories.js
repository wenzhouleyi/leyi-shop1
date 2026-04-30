const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// 分类列表（树形）
router.get('/', (req, res) => {
  const all = db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, id ASC').all();
  const tree = [];
  const map = {};
  all.forEach(c => { c.children = []; map[c.id] = c; });
  all.forEach(c => {
    if (c.parent_id && map[c.parent_id]) map[c.parent_id].children.push(c);
    else tree.push(c);
  });
  res.json({ code: 200, data: tree });
});

// 添加分类
router.post('/', adminAuth, (req, res) => {
  const { name, icon, parent_id, sort_order } = req.body;
  const result = db.prepare('INSERT INTO categories (name, icon, parent_id, sort_order) VALUES (?, ?, ?, ?)')
    .run(name, icon || '', parent_id || 0, sort_order || 0);
  res.json({ code: 200, message: '添加成功', data: { id: result.lastInsertRowid } });
});

// 编辑分类
router.put('/:id', adminAuth, (req, res) => {
  const { name, icon, parent_id, sort_order } = req.body;
  db.prepare('UPDATE categories SET name=?, icon=?, parent_id=?, sort_order=? WHERE id=?')
    .run(name, icon || '', parent_id || 0, sort_order || 0, req.params.id);
  res.json({ code: 200, message: '更新成功' });
});

// 删除分类
router.delete('/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

module.exports = router;
