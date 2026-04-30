const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// 存储验证码（生产环境应该用Redis）
const verifyCodes = new Map();

// 发送验证码
router.post('/send-code', (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return res.json({ code: 400, message: '请输入正确的手机号' });
    }
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // 存储验证码（5分钟有效）
    verifyCodes.set(phone, { code, time: Date.now() });
    // TODO: 这里应该调用短信服务商API发送真实短信
    // 目前模拟发送成功，验证码会在控制台打印
    console.log(`[验证码] 手机号 ${phone} 的验证码是: ${code}`);
    res.json({ code: 200, message: '验证码已发送' });
  } catch (e) {
    res.json({ code: 500, message: '发送失败' });
  }
});

// 用户注册
router.post('/register', (req, res) => {
  try {
    const { username, password, phone, verifyCode, businessName, storeAddress, contactName } = req.body;
    
    if (!username || !password) return res.json({ code: 400, message: '用户名和密码不能为空' });
    if (!phone || !verifyCode) return res.json({ code: 400, message: '手机号和验证码不能为空' });
    if (!businessName || !storeAddress || !contactName) {
      return res.json({ code: 400, message: '营业执照名称、门店地址和负责人姓名不能为空' });
    }
    
    // 验证验证码
    const stored = verifyCodes.get(phone);
    if (!stored || stored.code !== verifyCode) {
      return res.json({ code: 400, message: '验证码错误或已过期' });
    }
    if (Date.now() - stored.time > 5 * 60 * 1000) {
      verifyCodes.delete(phone);
      return res.json({ code: 400, message: '验证码已过期' });
    }
    
    // 清除验证码
    verifyCodes.delete(phone);
    
    const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
    if (exists) return res.json({ code: 400, message: '用户名已存在' });
    
    const phoneExists = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    if (phoneExists) return res.json({ code: 400, message: '该手机号已注册' });
    
    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(`
      INSERT INTO users (username, password, phone, business_name, store_address, contact_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(username, hash, phone, businessName, storeAddress, contactName);
    
    res.json({ code: 200, message: '注册成功，请登录' });
  } catch (e) {
    res.json({ code: 500, message: '注册失败: ' + e.message });
  }
});

// 用户登录
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ code: 400, message: '用户名和密码不能为空' });
    
    // 支持用户名或手机号登录
    const user = db.prepare('SELECT * FROM users WHERE username = ? OR phone = ?').get(username, username);
    if (!user) return res.json({ code: 400, message: '用户名或密码错误' });
    if (!bcrypt.compareSync(password, user.password)) return res.json({ code: 400, message: '用户名或密码错误' });
    
    const token = generateToken({ id: user.id, role: user.role });
    res.json({ 
      code: 200, 
      message: '登录成功', 
      data: { 
        token, 
        id: user.id, 
        username: user.username, 
        phone: user.phone,
        role: user.role 
      } 
    });
  } catch (e) {
    res.json({ code: 500, message: '登录失败: ' + e.message });
  }
});

// 管理员登录
router.post('/admin/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ? AND role = ?').get(username, 'admin');
    if (!user) return res.json({ code: 400, message: '管理员账号不存在' });
    if (!bcrypt.compareSync(password, user.password)) return res.json({ code: 400, message: '密码错误' });
    const token = generateToken({ id: user.id, role: user.role });
    res.json({ code: 200, message: '登录成功', data: { token, id: user.id, username: user.username, role: user.role } });
  } catch (e) {
    res.json({ code: 500, message: '登录失败: ' + e.message });
  }
});

// 获取用户信息
router.get('/profile', (req, res) => {
  const { auth } = require('../middleware/auth');
  auth(req, res, () => {
    const user = db.prepare('SELECT id, username, phone, avatar, role, business_name, store_address, contact_name, created_at FROM users WHERE id = ?').get(req.user.id);
    res.json({ code: 200, data: user });
  });
});

module.exports = router;