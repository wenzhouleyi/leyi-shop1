const express = require('express');
const db = require('../config/database');
const { adminAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// 商品列表
router.get('/', (req, res) => {
  try {
    const { page = 1, size = 20, category_id, keyword, status } = req.query;
    const offset = (page - 1) * size;
    let where = 'WHERE 1=1';
    const params = [];
    if (category_id) {
      // 同时查询该分类及其子分类的商品
      const catIds = db.prepare(`
        SELECT id FROM categories WHERE id = ? OR parent_id = ?
      `).all(category_id, category_id).map(r => r.id);
      if (catIds.length > 0) {
        where += ` AND p.category_id IN (${catIds.map(() => '?').join(',')})`;
        params.push(...catIds);
      }
    }
    if (keyword) { where += ' AND p.name LIKE ?'; params.push(`%${keyword}%`); }
    if (status) { where += ' AND p.status = ?'; params.push(status); }
    const list = db.prepare(`
      SELECT p.*, c.name as category_name
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      ${where} ORDER BY p.sort_order DESC, p.id DESC LIMIT ? OFFSET ?
    `).all(...params, Number(size), Number(offset));
    const total = db.prepare(`SELECT COUNT(*) as count FROM products p ${where}`).get(...params).count;
    res.json({ code: 200, data: { list, total, page: Number(page), size: Number(size) } });
  } catch (e) { res.json({ code: 500, message: e.message }); }
});

// 商品详情
router.get('/:id', (req, res) => {
  const product = db.prepare(`
    SELECT p.*, c.name as category_name
    FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?
  `).get(req.params.id);
  if (!product) return res.json({ code: 404, message: '商品不存在' });
  res.json({ code: 200, data: product });
});

// 添加商品（管理员）
router.post('/', adminAuth, upload.array('images', 5), (req, res) => {
  try {
    const { name, category_id, price, original_price, stock, description, specs, sort_order } = req.body;
    const images = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    const result = db.prepare(`
      INSERT INTO products (name, category_id, price, original_price, stock, description, images, specs, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(name, category_id || null, price, original_price || null, stock || 0, description || '', JSON.stringify(images), specs || '{}', sort_order || 0);
    res.json({ code: 200, message: '添加成功', data: { id: result.lastInsertRowid } });
  } catch (e) { res.json({ code: 500, message: e.message }); }
});

// 编辑商品（管理员）
router.put('/:id', adminAuth, upload.array('images', 5), (req, res) => {
  try {
    const { name, category_id, price, original_price, stock, description, specs, status, sort_order, images: oldImages } = req.body;
    const newImages = req.files ? req.files.map(f => '/uploads/' + f.filename) : [];
    let images = oldImages ? JSON.parse(oldImages) : [];
    images = [...images, ...newImages];
    db.prepare(`
      UPDATE products SET name=?, category_id=?, price=?, original_price=?, stock=?, description=?, images=?, specs=?, status=?, sort_order=?
      WHERE id=?
    `).run(name, category_id || null, price, original_price || null, stock || 0, description || '', JSON.stringify(images), specs || '{}', status || 'active', sort_order || 0, req.params.id);
    res.json({ code: 200, message: '更新成功' });
  } catch (e) { res.json({ code: 500, message: e.message }); }
});

// 删除商品（管理员）
router.delete('/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

module.exports = router;
