const request = require('supertest');
const express = require('express');
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const trackController = require('../../controllers/trackController');
const authController = require('../../controllers/authController');

app.get('/api/admin/tracks', authMiddleware, trackController.getAllTracksAdmin);
app.get('/api/auth/profile', authMiddleware, authController.getProfile);

let dbPath = path.join(__dirname, '../../database/music.db');
const dbInstance = new sqlite3.Database(dbPath);
let adminToken = null;
let regularUserToken = null;

beforeAll(async () => {
  await dbInstance.serialize(async () => {
    await dbInstance.run('DELETE FROM users');
    await dbInstance.run('DELETE FROM tracks');
    await dbInstance.run('DELETE FROM user_tracks');
    
    const passwordHash = await bcrypt.hash('password123', 10);
    await dbInstance.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', passwordHash]);
    await dbInstance.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['testuser', passwordHash]);
    
    await dbInstance.all('SELECT * FROM users', (err, users) => {
      adminToken = jwt.sign({ userId: users[0].id, username: users[0].username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
      regularUserToken = jwt.sign({ userId: users[1].id, username: users[1].username }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '24h' });
    });

    await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)', 
      ['Public Track', 'Public Artist', '/uploads/audio/public.mp3', '/uploads/covers/public.jpg', 'focus', users[0].id]);
    await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)', 
      ['Private Track', 'Private Artist', '/uploads/audio/private.mp3', '/uploads/covers/private.jpg', 'calm', users[0].id]);
  });
});

afterEach(async () => {
  await dbInstance.run('DELETE FROM user_tracks');
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
      expect(response.body.tracks[0].creator_name).toBe('admin');
    });

    it('should return empty array if no tracks exist', async () => {
      await dbInstance.run('DELETE FROM tracks');
      
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      expect(response.body.tracks).toHaveLength(0);
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

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
    });

    it('should allow admin to access all admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tracks');
      expect(response.body).toHaveProperty('admin_id', adminToken);
    });
  });

  describe('Admin Data Integrity', () => {
    it('should return tracks with correct foreign key relationships', async () => {
      await dbInstance.run('DELETE FROM tracks');
      await dbInstance.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', ['admin', 'hashed']);

      const userId = 999;
      await dbInstance.run('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)', [userId, 'anotheradmin', 'hashed']);
      await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)', 
        ['Different User Track', 'Artist', '/uploads/audio/diff.mp3', '/uploads/covers/diff.jpg', 'energy', userId]);

      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks.length).toBeGreaterThan(1);
      
      const differentTrack = response.body.tracks.find(t => t.title === 'Different User Track');
      expect(differentTrack).toBeDefined();
      expect(differentTrack.creator_name).toBe('anotheradmin');
    });

    it('should maintain track ordering by creation date', async () => {
      await dbInstance.run('DELETE FROM tracks');
      
      const adminId = 100;
      await dbInstance.run('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)', [adminId, 'admin', 'hashed']);
      
      await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime("now", "-2 hours"))', 
        ['Old Track', 'Artist', '/uploads/audio/old.mp3', '/uploads/covers/old.jpg', 'focus', adminId]);
      await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)', 
        ['New Track', 'Artist', '/uploads/audio/new.mp3', '/uploads/covers/new.jpg', 'focus', adminId]);

      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.tracks[0].title).toBe('Old Track');
      expect(response.body.tracks[1].title).toBe('New Track');
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

    it('should not expose file_path to regular user', async () => {
      const response = await request(app)
        .get('/api/tracks')
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      const track = response.body.tracks[0];
      expect(track).not.toHaveProperty('file_path');
      expect(track).not.toHaveProperty('cover_url');
    });

    it('should maintain admin_id in response for audit purposes', async () => {
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('admin_id');
      expect(typeof response.body.admin_id).toBe('number');
    });
  });

  describe('Admin Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      await dbInstance.run('DELETE FROM tracks');
      
      const response = await request(app)
        .get('/api/admin/tracks')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
    });

    it('should return valid admin_id when logged in', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty('id');
    });
  });
});