const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'shop.db');
const db = new Database(dbPath);

console.log('Checking database...');

// Check users table
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name));

// Check admin user
const users = db.prepare('SELECT id, username, role FROM users').all();
console.log('Users:', users);

db.close();
