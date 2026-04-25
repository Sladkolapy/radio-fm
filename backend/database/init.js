const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');

const dbPath = path.join(__dirname, 'music.db');
const db = new sqlite3.Database(dbPath);

const AUDIO_DIR = path.join(__dirname, '..', 'uploads', 'audio');
const COVERS_DIR = path.join(__dirname, '..', 'uploads', 'covers');

async function initializeDatabase() {
    console.log('🔄 Initializing database...\n');

    try {
        await db.serialize(async () => {
            console.log('📊 Creating tables...');

            await db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            await db.run(`
                CREATE TABLE IF NOT EXISTS tracks (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    title TEXT NOT NULL,
                    artist TEXT NOT NULL,
                    file_path TEXT NOT NULL,
                    cover_url TEXT,
                    mood_type TEXT NOT NULL,
                    created_by INTEGER NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (created_by) REFERENCES users(id)
                )
            `);

            await db.run(`
                CREATE TABLE IF NOT EXISTS user_tracks (
                    user_id INTEGER NOT NULL,
                    track_id INTEGER NOT NULL,
                    PRIMARY KEY (user_id, track_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (track_id) REFERENCES tracks(id) ON DELETE CASCADE
                )
            `);
        });

        console.log('✅ Tables created successfully\n');

        await seedDatabase();
    } catch (error) {
        console.error('❌ Error initializing database:', error.message);
        process.exit(1);
    }
}

function seedDatabase() {
    console.log('🌱 Seeding database with initial data...\n');

    bcrypt.hash('admin123', 10, (err, passwordHash) => {
        if (err) {
            console.error('❌ Error hashing password:', err.message);
            process.exit(1);
            return;
        }

        console.log('👤 Creating admin user...');
        db.run(
            `INSERT OR IGNORE INTO users (username, password_hash) VALUES (?, ?)`,
            ['admin', passwordHash],
            function(err) {
                if (err) {
                    console.error('❌ Error creating admin user:', err.message);
                    process.exit(1);
                    return;
                }
                console.log('✅ Admin user created\n');

                console.log('🎵 Creating sample tracks...');
                const sampleTracks = [
                    { title: 'Morning Focus', artist: 'Deep Chill', mood: 'focus', fileName: 'morning_focus.mp3', coverName: 'morning_focus.jpg' },
                    { title: 'Energize Workout', artist: 'Power Beats', mood: 'energy', fileName: 'energize.mp3', coverName: 'energize.jpg' },
                    { title: 'Peaceful Mind', artist: 'Quiet Vibes', mood: 'calm', fileName: 'peaceful.mp3', coverName: 'peaceful.jpg' },
                    { title: 'High Performance', artist: 'Motivation Mix', mood: 'motivation', fileName: 'high_performance.mp3', coverName: 'high_performance.jpg' },
                    { title: 'Calm Nights', artist: 'Relaxation', mood: 'relax', fileName: 'calm_nights.mp3', coverName: 'calm_nights.jpg' },
                    { title: 'Study Session', artist: 'Focus Beats', mood: 'focus', fileName: 'study.mp3', coverName: 'study.jpg' },
                    { title: 'Energy Boost', artist: 'Active', mood: 'energy', fileName: 'energy_boost.mp3', coverName: 'energy_boost.jpg' },
                    { title: 'Zen State', artist: 'Relax', mood: 'relax', fileName: 'zen_state.mp3', coverName: 'zen_state.jpg' },
                    { title: 'Creative Flow', artist: 'Inspire', mood: 'focus', fileName: 'creative_flow.mp3', coverName: 'creative_flow.jpg' },
                    { title: 'Workout Groove', artist: 'Beat Masters', mood: 'energy', fileName: 'workout_groove.mp3', coverName: 'workout_groove.jpg' }
                ];

                let trackCount = 0;
                sampleTracks.forEach((track, index) => {
                    db.run(
                        `INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, (SELECT id FROM users WHERE username = 'admin'))`,
                        [
                            track.title,
                            track.artist,
                            `/uploads/audio/${track.fileName}`,
                            `/uploads/covers/${track.coverName}`,
                            track.mood
                        ],
                        function(err) {
                            if (err) {
                                console.error('❌ Error inserting track:', err.message);
                                return;
                            }
                            trackCount++;
                            if (trackCount === sampleTracks.length) {
                                console.log('✅ Sample tracks created\n');

                                console.log('📁 Ensuring uploads directories exist...');
                                if (!fs.existsSync(AUDIO_DIR)) {
                                    fs.mkdirSync(AUDIO_DIR, { recursive: true });
                                }
                                if (!fs.existsSync(COVERS_DIR)) {
                                    fs.mkdirSync(COVERS_DIR, { recursive: true });
                                }
                                console.log('✅ Uploads directories created\n');

                                console.log('📊 Verifying database...');
                                db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
                                    if (err) {
                                        console.error('❌ Error counting users:', err.message);
                                        return;
                                    }
                                    console.log(`   Users: ${row.count}`);
                                });

                                db.get(`SELECT COUNT(*) as count FROM tracks`, (err, row) => {
                                    if (err) {
                                        console.error('❌ Error counting tracks:', err.message);
                                        return;
                                    }
                                    console.log(`   Tracks: ${row.count}`);

                                    console.log('\n✅ Database initialization completed successfully!');
                                    console.log(`   Admin username: admin`);
                                    console.log(`   Admin password: admin123`);
                                    console.log(`   Audio directory: ${AUDIO_DIR}`);
                                    console.log(`   Covers directory: ${COVERS_DIR}`);
                                    db.close();
                                });
                            }
                        }
                    );
                });
            }
        );
    });
}

db.serialize(initializeDatabase);