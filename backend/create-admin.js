require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

db.get('SELECT id FROM users WHERE username = ?', [adminUsername], (err, row) => {
  if (err) {
    console.error('Database error:', err.message);
    process.exit(1);
  }

  if (row) {
    db.run('UPDATE users SET role = ? WHERE username = ?', ['admin', adminUsername], (err) => {
      if (err) {
        console.error('Error updating role:', err.message);
        process.exit(1);
      }
      console.log(`User "${adminUsername}" role updated to admin`);
      process.exit(0);
    });
    return;
  }

  bcrypt.hash(adminPassword, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err.message);
      process.exit(1);
    }

    db.run(
      'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
      [adminUsername, hash, 'admin'],
      (err) => {
        if (err) {
          console.error('Error creating admin:', err.message);
          process.exit(1);
        }
        console.log(`Admin user created: ${adminUsername}`);
        process.exit(0);
      }
    );
  });
});
