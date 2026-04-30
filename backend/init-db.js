/**
 * 数据库初始化脚本
 * 运行: node init-db.js
 */
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'shop.db');
const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

// ==================== 创建�?====================

// 用户�?db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT,
    avatar TEXT,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 分类�?db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    icon TEXT,
    parent_id INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// 商品�?db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER DEFAULT 0,
    description TEXT,
    images TEXT DEFAULT '[]',
    specs TEXT DEFAULT '{}',
    status TEXT DEFAULT 'active',
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
  )
`);

// 购物车表
db.exec(`
  CREATE TABLE IF NOT EXISTS cart (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  )
`);

// 订单�?db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    remark TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// 订单商品�?db.exec(`
  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER,
    product_name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
  )
`);

// 轮播图表
db.exec(`
  CREATE TABLE IF NOT EXISTS banners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    link TEXT,
    sort_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// ==================== 插入示例数据 ====================

console.log('开始插入示例数�?..');

// 管理员账�?const adminPassword = bcrypt.hashSync('admin123', 10);
const adminExists = db.prepare('SELECT id FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  db.prepare(`INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, 'admin')`)
    .run('admin', adminPassword, '13800138000');
  console.log('�?管理员账号已创建: admin / admin123');
}

// 测试用户
const userPassword = bcrypt.hashSync('user123', 10);
const userExists = db.prepare('SELECT id FROM users WHERE username = ?').get('testuser');
if (!userExists) {
  db.prepare(`INSERT INTO users (username, password, phone, role) VALUES (?, ?, ?, 'user')`)
    .run('testuser', userPassword, '13900139000');
  console.log('�?测试用户已创�? testuser / user123');
}

// 分类 - 先插入父分类，再插入子分�?const categories = [
  // 一级分�?  { name: '手机数码', icon: '📱', parent_id: 0, sort_order: 1 },
  { name: '电脑办公', icon: '💻', parent_id: 0, sort_order: 2 },
  { name: '配件', icon: '🎧', parent_id: 0, sort_order: 3 },
  // 二级分类
  { name: '手机', icon: '📱', parent_id: 1, sort_order: 1 },
  { name: '平板电脑', icon: '📲', parent_id: 1, sort_order: 2 },
  { name: '笔记本电�?, icon: '💻', parent_id: 2, sort_order: 1 },
  { name: '台式�?, icon: '🖥�?, parent_id: 2, sort_order: 2 },
  { name: '耳机音箱', icon: '🎧', parent_id: 3, sort_order: 1 },
  { name: '充电�?, icon: '🔌', parent_id: 3, sort_order: 2 },
];

const categoryIds = {};
categories.forEach((cat, index) => {
  const existing = db.prepare('SELECT id FROM categories WHERE name = ? AND parent_id = ?').get(cat.name, cat.parent_id);
  if (!existing) {
    const result = db.prepare('INSERT INTO categories (name, icon, parent_id, sort_order) VALUES (?, ?, ?, ?)')
      .run(cat.name, cat.icon, cat.parent_id, cat.sort_order);
    categoryIds[cat.name] = result.lastInsertRowid;
  } else {
    categoryIds[cat.name] = existing.id;
  }
});
console.log('�?分类已创�?);

// 商品数据 - 温州乐翼风格数码产品
const products = [
  // 手机
  {
    name: 'iPhone 15 Pro Max 256GB 深空�?,
    category_id: categoryIds['手机'],
    price: 8999,
    original_price: 9999,
    stock: 50,
    description: 'A17 Pro芯片，钛金属设计，全新Action按钮，专业级摄像系统。支持灵动岛，全天候显示�?,
    images: JSON.stringify(['/uploads/iphone15-1.jpg', '/uploads/iphone15-2.jpg']),
    specs: JSON.stringify({ '存储': '256GB', '颜色': '深空�?, '芯片': 'A17 Pro', '屏幕': '6.7英寸' }),
  },
  {
    name: '华为 Mate 60 Pro 12+512GB 雅丹�?,
    category_id: categoryIds['手机'],
    price: 6999,
    original_price: 7999,
    stock: 30,
    description: '麒麟9000S芯片，卫星通话，全焦段超清影像，HarmonyOS 4操作系统�?,
    images: JSON.stringify(['/uploads/mate60-1.jpg']),
    specs: JSON.stringify({ '存储': '512GB', '颜色': '雅丹�?, '芯片': '麒麟9000S', '屏幕': '6.82英寸' }),
  },
  {
    name: '小米 14 Ultra 16+512GB 黑色',
    category_id: categoryIds['手机'],
    price: 6499,
    original_price: 6999,
    stock: 40,
    description: '徕卡光学Summilux镜头，骁�? Gen3处理器，120W超级快充�?,
    images: JSON.stringify(['/uploads/xiaomi14-1.jpg']),
    specs: JSON.stringify({ '存储': '512GB', '颜色': '黑色', '芯片': '骁龙8 Gen3', '屏幕': '6.73英寸' }),
  },
  // 平板电脑
  {
    name: 'iPad Pro 12.9英寸 M2芯片 256GB',
    category_id: categoryIds['平板电脑'],
    price: 9299,
    original_price: 9999,
    stock: 25,
    description: 'M2芯片，Liquid视网膜XDR显示屏，支持Apple Pencil和妙控键盘�?,
    images: JSON.stringify(['/uploads/ipadpro-1.jpg']),
    specs: JSON.stringify({ '存储': '256GB', '屏幕': '12.9英寸', '芯片': 'M2', '网络': 'WiFi�? }),
  },
  {
    name: '华为 MatePad Pro 13.2英寸',
    category_id: categoryIds['平板电脑'],
    price: 5699,
    original_price: 5999,
    stock: 20,
    description: '13.2英寸柔性OLED大屏，麒�?000S芯片，HUAWEI M-Pencil手写笔支持�?,
    images: JSON.stringify(['/uploads/matepad-1.jpg']),
    specs: JSON.stringify({ '存储': '256GB', '屏幕': '13.2英寸', '芯片': '麒麟9000S' }),
  },
  // 智能穿戴
  {
    name: 'Apple Watch Ultra 2 49mm 钛金�?,
    category_id: categoryIds['智能穿戴'],
    price: 6499,
    original_price: 6999,
    stock: 15,
    description: '钛金属表壳，精准双频GPS�?00米防水，最�?6小时电池续航�?,
    images: JSON.stringify(['/uploads/watch-ultra-1.jpg']),
    specs: JSON.stringify({ '尺寸': '49mm', '材质': '钛金�?, 'GPS': '精准双频', '防水': '100�? }),
  },
  {
    name: '华为 WATCH GT 4 46mm 云衫�?,
    category_id: categoryIds['智能穿戴'],
    price: 1688,
    original_price: 1888,
    stock: 50,
    description: 'TruSeen 5.5+心率监测�?4天超长续航，支持100+运动模式�?,
    images: JSON.stringify(['/uploads/watch-gt4-1.jpg']),
    specs: JSON.stringify({ '尺寸': '46mm', '续航': '14�?, '防水': '5ATM', '颜色': '云衫�? }),
  },
  // 笔记本电�?  {
    name: 'MacBook Pro 14英寸 M3 Pro芯片',
    category_id: categoryIds['笔记本电�?],
    price: 16999,
    original_price: 18999,
    stock: 10,
    description: 'M3 Pro芯片�?8小时电池续航，Liquid视网膜XDR显示屏�?,
    images: JSON.stringify(['/uploads/macbookpro-1.jpg']),
    specs: JSON.stringify({ '芯片': 'M3 Pro', '内存': '18GB', '存储': '512GB', '屏幕': '14.2英寸' }),
  },
  {
    name: 'ThinkPad X1 Carbon Gen 11 i7-1365U',
    category_id: categoryIds['笔记本电�?],
    price: 12999,
    original_price: 14999,
    stock: 8,
    description: 'Intel�?3代酷睿处理器�?4英寸2.8K OLED屏幕，仅1.12kg超轻机身�?,
    images: JSON.stringify(['/uploads/thinkpad-1.jpg']),
    specs: JSON.stringify({ '芯片': 'i7-1365U', '内存': '32GB', '存储': '1TB SSD', '屏幕': '14英寸2.8K' }),
  },
  // 耳机音箱
  {
    name: 'AirPods Pro (第二�? 带MagSafe充电�?,
    category_id: categoryIds['耳机音箱'],
    price: 1899,
    original_price: 1999,
    stock: 100,
    description: '自适应音频，个性化空间音频，USB-C接口，MagSafe充电盒�?,
    images: JSON.stringify(['/uploads/airpods-1.jpg']),
    specs: JSON.stringify({ '降噪': '主动降噪', '空间音频': '支持', '充电': 'MagSafe/USB-C', '续航': '6小时' }),
  },
  {
    name: '华为 FreeBuds Pro 3 星河�?,
    category_id: categoryIds['耳机音箱'],
    price: 1499,
    original_price: 1699,
    stock: 60,
    description: '麒麟A2芯片，智慧动态降�?.0，L2HC 2.0高清音频传输�?,
    images: JSON.stringify(['/uploads/freebuds-1.jpg']),
    specs: JSON.stringify({ '降噪': '智慧动态降�?.0', '音质': 'L2HC 2.0', '续航': '7小时', '颜色': '星河�? }),
  },
  // 充电�?  {
    name: '小米 120W GaN 充电�?套装�?,
    category_id: categoryIds['充电�?],
    price: 299,
    original_price: 349,
    stock: 200,
    description: '120W超大功率，氮化镓技术，体积小巧，发热低，附�?.5米数据线�?,
    images: JSON.stringify(['/uploads/charger-120w-1.jpg']),
    specs: JSON.stringify({ '功率': '120W', '技�?: '氮化�?, '接口': 'USB-A+USB-C', '线长': '1.5�? }),
  },
  // 数据�?  {
    name: '绿联 Type-C to Type-C 100W 快充�?2�?,
    category_id: categoryIds['数据�?],
    price: 49,
    original_price: 59,
    stock: 500,
    description: '100W大功率，支持PD快充，E-Marker芯片，编织线身耐用抗折�?,
    images: JSON.stringify(['/uploads/cable-1.jpg']),
    specs: JSON.stringify({ '功率': '100W', '长度': '2�?, '材质': '编织线身', '协议': 'PD/PPS' }),
  },
];

products.forEach((product) => {
  const existing = db.prepare('SELECT id FROM products WHERE name = ?').get(product.name);
  if (!existing) {
    db.prepare(`
      INSERT INTO products (name, category_id, price, original_price, stock, description, images, specs, status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      product.name,
      product.category_id,
      product.price,
      product.original_price,
      product.stock,
      product.description,
      product.images,
      product.specs,
      products.indexOf(product)
    );
  }
});
console.log('�?商品数据已创�?);

// 轮播�?const banners = [
  { title: 'iPhone 15 系列 限时优惠', image_url: '/uploads/banner-iphone.jpg', link: '/products/1', sort_order: 1, status: 'active' },
  { title: '华为 Mate 60 Pro 现货发售', image_url: '/uploads/banner-mate60.jpg', link: '/products/2', sort_order: 2, status: 'active' },
  { title: 'MacBook Pro 学生专属优惠', image_url: '/uploads/banner-macbook.jpg', link: '/products/8', sort_order: 3, status: 'active' },
  { title: '智能穿戴 运动必备', image_url: '/uploads/banner-watch.jpg', link: '/products/6', sort_order: 4, status: 'active' },
];

banners.forEach((banner) => {
  const existing = db.prepare('SELECT id FROM banners WHERE title = ?').get(banner.title);
  if (!existing) {
    db.prepare('INSERT INTO banners (title, image_url, link, sort_order, status) VALUES (?, ?, ?, ?, ?)')
      .run(banner.title, banner.image_url, banner.link, banner.sort_order, banner.status);
  }
});
console.log('�?轮播图数据已创建');

db.close();
console.log('\n🎉 数据库初始化完成�?);
console.log('\n默认账号:');
console.log('  管理�? admin / admin123');
console.log('  测试用户: testuser / user123');
console.log('\n运行服务: npm start');
