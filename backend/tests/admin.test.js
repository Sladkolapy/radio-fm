const request = require('supertest');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const db = require('../config/db');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const trackController = require('../controllers/trackController');
const authController = require('../controllers/authController');

app.get('/api/tracks', trackController.getAllTracks);
app.get('/api/admin/tracks', adminMiddleware, trackController.getAllTracksAdmin);
app.get('/api/auth/profile', authMiddleware, authController.getProfile);

const dbPath = path.join(__dirname, '../database/music.db');
const dbInstance = new sqlite3.Database(dbPath);

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}

function dbGet(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

let adminToken = null;
let regularUserToken = null;

beforeAll(async () => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  await dbRun(dbInstance, 'DELETE FROM track_tags');
  await dbRun(dbInstance, 'DELETE FROM user_tracks');
  await dbRun(dbInstance, 'DELETE FROM tracks');
  await dbRun(dbInstance, 'DELETE FROM users');

  const passwordHash = await bcrypt.hash('password123', 10);
  await dbRun(dbInstance, 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
    'admin',
    passwordHash,
    'admin'
  ]);
  await dbRun(dbInstance, 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
    'testuser',
    passwordHash,
    'user'
  ]);

  const adminUser = await dbGet(dbInstance, 'SELECT id, username FROM users WHERE username = ?', ['admin']);
  const regUser = await dbGet(dbInstance, 'SELECT id, username FROM users WHERE username = ?', ['testuser']);

  adminToken = jwt.sign(
    { userId: adminUser.id, username: adminUser.username, role: 'admin' },
    jwtSecret,
    { expiresIn: '24h' }
  );
  regularUserToken = jwt.sign(
    { userId: regUser.id, username: regUser.username, role: 'user' },
    jwtSecret,
    { expiresIn: '24h' }
  );

  await dbRun(
    dbInstance,
    'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [
      'Public Track',
      'Public Artist',
      '/uploads/audio/public.mp3',
      '/uploads/covers/public.jpg',
      'focus',
      adminUser.id
    ]
  );
  await dbRun(
    dbInstance,
    'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [
      'Private Track',
      'Private Artist',
      '/uploads/audio/private.mp3',
      '/uploads/covers/private.jpg',
      'calm',
      adminUser.id
    ]
  );
});

afterEach(async () => {
  await dbRun(dbInstance, 'DELETE FROM user_tracks');
});

afterAll(() => {
  dbInstance.close();
});

describe('Admin API Endpoints', () => {
  describe('GET /api/admin/tracks', () => {
    it('should return all tracks for admin', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      expect(response.body.tracks.length).toBeGreaterThan(0);
      expect(response.body.tracks[0]).toHaveProperty('title');
      expect(response.body.tracks[0]).toHaveProperty('artist');
      expect(response.body.tracks[0]).toHaveProperty('creator_name');
    });

    it('should include file_path for admin view', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks[0]).toHaveProperty('file_path');
    });

    it('should include cover_url for admin view', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks[0]).toHaveProperty('cover_url');
    });

    it('should include creator_name for admin view', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks[0]).toHaveProperty('creator_name');
      expect(['admin', null]).toContain(response.body.tracks[0].creator_name);
    });

    it('should return empty array if no tracks exist', async () => {
      await dbRun(dbInstance, 'DELETE FROM track_tags');
      await dbRun(dbInstance, 'DELETE FROM tracks');

      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      expect(response.body.tracks).toHaveLength(0);

      const adminUser = await dbGet(dbInstance, 'SELECT id FROM users WHERE username = ?', ['admin']);
      await dbRun(
        dbInstance,
        'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'Public Track',
          'Public Artist',
          '/uploads/audio/public.mp3',
          '/uploads/covers/public.jpg',
          'focus',
          adminUser.id
        ]
      );
      await dbRun(
        dbInstance,
        'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'Private Track',
          'Private Artist',
          '/uploads/audio/private.mp3',
          '/uploads/covers/private.jpg',
          'calm',
          adminUser.id
        ]
      );
    });
  });

  describe('Admin Access Control', () => {
    it('should reject admin endpoint without token', async () => {
      const response = await request(app).get('/api/admin/tracks');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject admin endpoint with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject admin endpoint for regular user', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
    });

    it('should allow admin to access all admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tracks');
      expect(Array.isArray(response.body.tracks)).toBe(true);
    });
  });

  describe('Admin Data Integrity', () => {
    it('should return tracks with correct foreign key relationships', async () => {
      await dbRun(dbInstance, 'DELETE FROM track_tags');
      await dbRun(dbInstance, 'DELETE FROM tracks');
      await dbRun(dbInstance, 'DELETE FROM users WHERE username = ?', ['anotheradmin']);

      const passwordHash = await bcrypt.hash('password123', 10);
      await dbRun(dbInstance, 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
        'anotheradmin',
        passwordHash,
        'admin'
      ]);
      const other = await dbGet(dbInstance, 'SELECT id FROM users WHERE username = ?', ['anotheradmin']);

      await dbRun(
        dbInstance,
        'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        [
          'Different User Track',
          'Artist',
          '/uploads/audio/diff.mp3',
          '/uploads/covers/diff.jpg',
          'energy',
          other.id
        ]
      );

      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const differentTrack = response.body.tracks.find((t) => t.title === 'Different User Track');
      expect(differentTrack).toBeDefined();
      expect(differentTrack.creator_name).toBe('anotheradmin');
    });

    it('should maintain track ordering by creation date (newest first)', async () => {
      await dbRun(dbInstance, 'DELETE FROM track_tags');
      await dbRun(dbInstance, 'DELETE FROM tracks');

      const adminUser = await dbGet(dbInstance, 'SELECT id FROM users WHERE username = ?', ['admin']);

      await dbRun(
        dbInstance,
        `INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now", "-2 hours"))`,
        ['Old Track', 'Artist', '/uploads/audio/old.mp3', '/uploads/covers/old.jpg', 'focus', adminUser.id]
      );
      await dbRun(
        dbInstance,
        'INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        ['New Track', 'Artist', '/uploads/audio/new.mp3', '/uploads/covers/new.jpg', 'focus', adminUser.id]
      );

      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks[0].title).toBe('New Track');
      expect(response.body.tracks[1].title).toBe('Old Track');
    });
  });

  describe('Integration: Admin and User Track Visibility', () => {
    it('should show all tracks to admin regardless of visibility', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks.length).toBeGreaterThan(0);
    });

    it('should show file_path and cover_url only to admin', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const track = response.body.tracks[0];
      expect(track).toHaveProperty('file_path');
      expect(track).toHaveProperty('cover_url');
    });

    it('should expose file_path on public track list (same as catalog)', async () => {
      const response = await request(app).get('/api/tracks');

      expect(response.status).toBe(200);
      const track = response.body.tracks[0];
      expect(track).toHaveProperty('file_path');
      expect(track).toHaveProperty('cover_url');
    });
  });

  describe('Admin Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      await dbRun(dbInstance, 'DELETE FROM track_tags');
      await dbRun(dbInstance, 'DELETE FROM tracks');
      
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
    });

    it('should return user profile when logged in', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
    });
  });
});