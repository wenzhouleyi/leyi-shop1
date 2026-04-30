const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = 'hzxk-shop-secret-key-2024';

function auth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ code: 401, message: '未登录' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, username, role, phone, avatar FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ code: 401, message: '用户不存在' });
    req.user = user;
    next();
  } catch (e) {
    res.status(401).json({ code: 401, message: 'token无效或已过期' });
  }
}

function adminAuth(req, res, next) {
  auth(req, res, () => {
    if (req.user.role !== 'admin') return res.status(403).json({ code: 403, message: '无管理员权限' });
    next();
  });
}

function generateToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

module.exports = { auth, adminAuth, generateToken, JWT_SECRET };
