const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'shop.db');
const db = new Database(dbPath);

const user = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
console.log('Admin user:', { id: user.id, username: user.username, role: user.role });
console.log('Password hash:', user.password.substring(0, 30) + '...');

// Test passwords
const testPwds = ['admin', '123456', 'admin123', '12345678'];
testPwds.forEach(pwd => {
  const match = bcrypt.compareSync(pwd, user.password);
  console.log(`Password '${pwd}': ${match ? 'MATCH' : 'no match'}`);
});

db.close();
