const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'shop.db');
const db = new Database(dbPath);

// 确保有手机分类
let phoneCat = db.prepare('SELECT id FROM categories WHERE name = ?').get('手机');
if (!phoneCat) {
  const result = db.prepare('INSERT INTO categories (name, icon, parent_id, sort_order) VALUES (?, ?, 0, 1)').run('手机', '📱', 0);
  phoneCat = { id: result.lastInsertRowid };
  console.log('创建分类: 手机, ID:', phoneCat.id);
} else {
  console.log('使用现有分类: 手机, ID:', phoneCat.id);
}

// iPhone 17 系列商品数据
const iphones = [
  // iPhone 17 256GB
  { name: 'iPhone 17 256GB 黑色', price: 5360, color: '黑色', model: '6W4-774', code: 'A3521' },
  { name: 'iPhone 17 256GB 白色', price: 5360, color: '白色', model: '6X4-784', code: 'A3521' },
  { name: 'iPhone 17 256GB 青雾蓝色', price: 5360, color: '青雾蓝色', model: '6Y4-794', code: 'A3521' },
  { name: 'iPhone 17 256GB 薰衣草紫色', price: 5360, color: '薰衣草紫色', model: '704-7A4', code: 'A3521' },
  { name: 'iPhone 17 256GB 鼠尾草绿色', price: 5360, color: '鼠尾草绿色', model: '714-7C4', code: 'A3521' },
  // iPhone 17 512GB
  { name: 'iPhone 17 512GB 黑色', price: 7250, color: '黑色', model: '724-7D4', code: 'A3521' },
  { name: 'iPhone 17 512GB 白色', price: 7250, color: '白色', model: '734-7E4', code: 'A3521' },
  { name: 'iPhone 17 512GB 青雾蓝色', price: 7250, color: '青雾蓝色', model: '744-7F4', code: 'A3521' },
  { name: 'iPhone 17 512GB 薰衣草紫色', price: 7250, color: '薰衣草紫色', model: '754-7G4', code: 'A3521' },
  { name: 'iPhone 17 512GB 鼠尾草绿色', price: 7250, color: '鼠尾草绿色', model: '764-7H4', code: 'A3521' },
  // iPhone 17 Pro 256GB
  { name: 'iPhone 17 Pro 256GB 银色', price: 8150, color: '银色', model: '8T4-934', code: 'A3524' },
  { name: 'iPhone 17 Pro 256GB 星宇橙色', price: 8150, color: '星宇橙色', model: '8U4-944', code: 'A3524' },
  { name: 'iPhone 17 Pro 256GB 深蓝色', price: 8130, color: '深蓝色', model: '8V4-954', code: 'A3524' },
  // iPhone 17 Pro 512GB
  { name: 'iPhone 17 Pro 512GB 银色', price: 9900, color: '银色', model: '8W4-964', code: 'A3524' },
  { name: 'iPhone 17 Pro 512GB 星宇橙色', price: 9900, color: '星宇橙色', model: '8X4-974', code: 'A3524' },
  { name: 'iPhone 17 Pro 512GB 深蓝色', price: 9900, color: '深蓝色', model: '8Y4-984', code: 'A3524' },
  // iPhone 17 Pro Max 256GB
  { name: 'iPhone 17 Pro Max 256GB 银色', price: 9060, color: '银色', model: '034-0U4', code: 'A3527' },
  { name: 'iPhone 17 Pro Max 256GB 星宇橙色', price: 9060, color: '星宇橙色', model: '044-0V4', code: 'A3527' },
  { name: 'iPhone 17 Pro Max 256GB 深蓝色', price: 9060, color: '深蓝色', model: '054-0W4', code: 'A3527' },
  // iPhone 17 Pro Max 512GB
  { name: 'iPhone 17 Pro Max 512GB 银色', price: 10920, color: '银色', model: '064-0X4', code: 'A3527' },
  { name: 'iPhone 17 Pro Max 512GB 星宇橙色', price: 10920, color: '星宇橙色', model: '074-104', code: 'A3527' },
  { name: 'iPhone 17 Pro Max 512GB 深蓝色', price: 10980, color: '深蓝色', model: '084-114', code: 'A3527' },
];

let added = 0;
iphones.forEach((item) => {
  const existing = db.prepare('SELECT id FROM products WHERE name = ?').get(item.name);
  if (!existing) {
    db.prepare(`
      INSERT INTO products (name, category_id, price, original_price, stock, description, images, specs, status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `).run(
      item.name,
      phoneCat.id,
      item.price,
      Math.floor(item.price * 1.1), // 原价为售价的110%
      50, // 默认库存50
      `型号: ${item.model}, 代码: ${item.code}`,
      JSON.stringify(['/uploads/iphone-placeholder.jpg']),
      JSON.stringify({ '颜色': item.color, '型号': item.model, '代码': item.code }),
      added
    );
    added++;
    console.log('添加:', item.name, '¥' + item.price);
  } else {
    console.log('已存在:', item.name);
  }
});

console.log(`\n完成！新增 ${added} 个商品`);
db.close();
