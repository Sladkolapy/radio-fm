const sqlite3 = require('sqlite3').verbose();
const path = require('path');

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
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
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
      user_id INTEGER,
      track_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, track_id),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (track_id) REFERENCES tracks(id)
    )
  `);

  // Add sample data if empty
  db.all('SELECT COUNT(*) as count FROM tracks', (err, rows) => {
    if (rows && rows[0].count === 0) {
      addSampleData();
    }
  });
}

function addSampleData() {
  const insertTrack = (track) => {
    db.run(
      `INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [track.title, track.artist, track.file, track.cover, track.mood, null],
      (err) => {
        if (err) console.error('Error inserting sample track:', err);
      }
    );
  };

  const sampleTracks = [
    {
      title: "Morning Focus",
      artist: "Chill Vibes",
      file: "uploads/audio/morning.mp3",
      cover: "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=300",
      mood: "focus"
    },
    {
      title: "Workout Energy",
      artist: "Gym Beats",
      file: "uploads/audio/workout.mp3",
      cover: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300",
      mood: "energy"
    },
    {
      title: "Peaceful Calm",
      artist: "Relax Sounds",
      file: "uploads/audio/peace.mp3",
      cover: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=300",
      mood: "calm"
    },
    {
      title: "Success Motivation",
      artist: "Motivation Mix",
      file: "uploads/audio/motivation.mp3",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      mood: "motivation"
    },
    {
      title: "Evening Relax",
      artist: "After Hours",
      file: "uploads/audio/relax.mp3",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300",
      mood: "relax"
    },
    {
      title: "Deep Concentration",
      artist: "Study Music",
      file: "uploads/audio/study.mp3",
      cover: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300",
      mood: "focus"
    },
    {
      title: "Running Fast",
      artist: "Speed Demon",
      file: "uploads/audio/run.mp3",
      cover: "https://images.unsplash.com/photo-1552674605-469455965fee?w=300",
      mood: "energy"
    },
    {
      title: "Sleep Therapy",
      artist: "Dreamscape",
      file: "uploads/audio/sleep.mp3",
      cover: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=300",
      mood: "relax"
    }
  ];

  sampleTracks.forEach(insertTrack);
  console.log('Sample data added');
}

module.exports = db;