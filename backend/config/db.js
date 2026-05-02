const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, '..', 'database', 'music.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tracks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        artist TEXT NOT NULL,
        file_path TEXT NOT NULL,
        cover_url TEXT,
        mood_type TEXT NOT NULL,
        created_by INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS user_tracks (
        user_id INTEGER NOT NULL,
        track_id INTEGER NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, track_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        color TEXT DEFAULT '#6366f1',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS track_tags (
        track_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (track_id, tag_id),
        FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    db.run("ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'", (err) => {
      if (err && !err.message.includes('duplicate column name')) {
        console.error('Error adding role column:', err.message);
      }
    });

    // Avoid racing integration tests that manage users/tracks (Jest sets JEST_WORKER_ID).
    if (process.env.JEST_WORKER_ID === undefined) {
      seedAdminUser();
      seedTags();
      seedSampleTracks();
    }
  });
}

function seedAdminUser() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  db.get('SELECT id FROM users WHERE username = ?', [adminUsername], (err, row) => {
    if (err) {
      console.error('Error checking admin user:', err.message);
      return;
    }

    if (row) {
      db.run('UPDATE users SET role = ? WHERE username = ?', ['admin', adminUsername], (err) => {
        if (err) console.error('Error updating admin role:', err.message);
        else console.log('Admin user role ensured');
      });
      return;
    }

    bcrypt.hash(adminPassword, 10, (err, hash) => {
      if (err) {
        console.error('Error hashing admin password:', err.message);
        return;
      }
      db.run(
        'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)',
        [adminUsername, hash, 'admin'],
        (err) => {
          if (err) console.error('Error creating admin user:', err.message);
          else console.log(`Admin user created: ${adminUsername}`);
        }
      );
    });
  });
}

function seedTags() {
  db.get('SELECT COUNT(*) as count FROM tags', (err, row) => {
    if (err || (row && row.count > 0)) return;

    const defaultTags = [
      { name: 'Фокус', color: '#3b82f6' },
      { name: 'Энергия', color: '#f97316' },
      { name: 'Спокойствие', color: '#22c55e' },
      { name: 'Мотивация', color: '#ef4444' },
      { name: 'Релакс', color: '#a855f7' },
      { name: 'Тренировка', color: '#eab308' },
      { name: 'Медитация', color: '#14b8a6' },
      { name: 'Работа', color: '#6366f1' }
    ];

    const stmt = db.prepare('INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)');
    defaultTags.forEach((tag) => stmt.run(tag.name, tag.color));
    stmt.finalize();
    console.log('Default tags seeded');
  });
}

function seedSampleTracks() {
  db.get('SELECT COUNT(*) as count FROM tracks', (err, row) => {
    if (err || (row && row.count > 0)) return;

    const sampleTracks = [
      { title: "Morning Focus", artist: "Chill Vibes", file: "/uploads/audio/morning.mp3", cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300", mood: "focus" },
      { title: "Workout Energy", artist: "Gym Beats", file: "/uploads/audio/workout.mp3", cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300", mood: "energy" },
      { title: "Peaceful Calm", artist: "Relax Sounds", file: "/uploads/audio/peace.mp3", cover: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=300", mood: "calm" },
      { title: "Success Motivation", artist: "Motivation Mix", file: "/uploads/audio/motivation.mp3", cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300", mood: "motivation" },
      { title: "Evening Relax", artist: "After Hours", file: "/uploads/audio/relax.mp3", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300", mood: "relax" },
      { title: "Deep Concentration", artist: "Study Music", file: "/uploads/audio/study.mp3", cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300", mood: "focus" },
      { title: "Running Fast", artist: "Speed Demon", file: "/uploads/audio/run.mp3", cover: "https://images.unsplash.com/photo-1552674605-469455965fee?w=300", mood: "energy" },
      { title: "Sleep Therapy", artist: "Dreamscape", file: "/uploads/audio/sleep.mp3", cover: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=300", mood: "relax" }
    ];

    const stmt = db.prepare(
      'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)'
    );
    sampleTracks.forEach((track) => stmt.run(track.title, track.artist, track.file, track.cover, track.mood, null));
    stmt.finalize();
    console.log('Sample tracks seeded');
  });
}

module.exports = db;
