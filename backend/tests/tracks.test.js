const request = require('supertest');
const express = require('express');
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');
const upload = require('../../middleware/upload');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const trackController = require('../../controllers/trackController');
const authController = require('../../controllers/authController');

app.get('/api/tracks', trackController.getPublicTracks);
app.get('/api/tracks/:id', trackController.getTrackById);
app.get('/api/tracks/private', authMiddleware, trackController.getUserPrivateTracks);
app.post('/api/tracks', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), trackController.createTrack);
app.put('/api/tracks/:id', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), trackController.updateTrack);
app.delete('/api/tracks/:id', authMiddleware, trackController.deleteTrack);

let dbPath = path.join(__dirname, '../../database/music.db');
const dbInstance = new sqlite3.Database(dbPath);
let adminToken = null;
let regularUserToken = null;
let regularUserId = null;
let testTrackId = null;
let testUserTrackId = null;

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
      regularUserId = users[1].id;
    });

    await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)', 
      ['Test Track', 'Test Artist', '/uploads/audio/test.mp3', '/uploads/covers/test.jpg', 'focus', users[0].id]);
  });
});

afterEach(async () => {
  if (testTrackId) {
    const track = await new Promise((resolve, reject) => {
      dbInstance.get('SELECT * FROM tracks WHERE id = ?', [testTrackId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (track) {
      const audioPath = path.join(__dirname, '..', track.file_path);
      const coverPath = path.join(__dirname, '..', track.cover_url);
      if (audioPath && require('fs').existsSync(audioPath)) require('fs').unlinkSync(audioPath);
      if (coverPath && require('fs').existsSync(coverPath)) require('fs').unlinkSync(coverPath);
    }
    
    await dbInstance.run('DELETE FROM tracks WHERE id = ?', [testTrackId]);
    testTrackId = null;
  }
  
  await dbInstance.run('DELETE FROM user_tracks');
  testUserTrackId = null;
});

afterAll(() => {
  dbInstance.close();
});

describe('Tracks API Endpoints', () => {
  describe('GET /api/tracks', () => {
    it('should get all public tracks', async () => {
      const response = await request(app).get('/api/tracks');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      expect(response.body.tracks).toHaveLength(1);
      expect(response.body.tracks[0]).toHaveProperty('title');
      expect(response.body.tracks[0]).toHaveProperty('artist');
      expect(response.body.tracks[0]).toHaveProperty('is_public');
    });

    it('should return empty array when no tracks exist', async () => {
      await dbInstance.run('DELETE FROM tracks');
      
      const response = await request(app).get('/api/tracks');
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      expect(response.body.tracks).toHaveLength(0);
    });
  });

  describe('GET /api/tracks/:id', () => {
    it('should get track by ID', async () => {
      const response = await request(app).get('/api/tracks/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('track');
      expect(response.body.track.id).toBe(1);
      expect(response.body.track.title).toBe('Test Track');
      expect(response.body.track.artist).toBe('Test Artist');
      expect(response.body.track.is_public).toBe(true);
    });

    it('should return 404 for non-existent track', async () => {
      const response = await request(app).get('/api/tracks/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Track not found');
    });

    it('should return 400 for invalid track ID', async () => {
      const response = await request(app).get('/api/tracks/invalid');
      
      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/tracks/private', () => {
    it('should get private tracks for authorized user', async () => {
      const response = await request(app)
        .get('/api/tracks/private')
        .set('Authorization', `Bearer ${regularUserToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      testUserTrackId = response.body.tracks.length > 0 ? response.body.tracks[0].id : null;
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/tracks/private');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/tracks/private')
        .set('Authorization', 'Bearer invalid.token');
      
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should return empty array for user with no private tracks', async () => {
      await dbInstance.run('DELETE FROM user_tracks');
      
      const response = await request(app)
        .get('/api/tracks/private')
        .set('Authorization', `Bearer ${regularUserToken}`);
      
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.tracks)).toBe(true);
      expect(response.body.tracks).toHaveLength(0);
    });
  });

  describe('POST /api/tracks', () => {
    it('should create a new track as admin', async () => {
      const response = await request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'New Track')
        .field('artist', 'New Artist')
        .field('mood_type', 'focus')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('track');
      expect(response.body.track.title).toBe('New Track');
      testTrackId = response.body.track.id;
    });

    it('should reject creation without auth token', async () => {
      const response = await request(app)
        .post('/api/tracks')
        .field('title', 'Track')
        .field('artist', 'Artist')
        .field('mood_type', 'focus')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(401);
    });

    it('should reject creation without required fields', async () => {
      const response = await request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Track')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should reject invalid mood type', async () => {
      const response = await request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Track')
        .field('artist', 'Artist')
        .field('mood_type', 'invalid')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid mood type');
    });

    it('should reject creation without audio file', async () => {
      const response = await request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Track')
        .field('artist', 'Artist')
        .field('mood_type', 'focus');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Audio file');
    });

    it('should create track with cover image', async () => {
      const response = await request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Track with Cover')
        .field('artist', 'Artist')
        .field('mood_type', 'calm')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3')
        .attach('cover', Buffer.from('fake cover'), 'cover.jpg');

      expect(response.status).toBe(201);
      expect(response.body.track).toHaveProperty('cover_url');
    });
  });

  describe('PUT /api/tracks/:id', () => {
    beforeEach(async () => {
      await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        ['Original Track', 'Original Artist', '/uploads/audio/original.mp3', '/uploads/covers/original.jpg', 'focus', regularUserId]);
    });

    it('should update track owned by owner', async () => {
      const response = await request(app)
        .put(`/api/tracks/1`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('title', 'Updated Track')
        .field('artist', 'Updated Artist')
        .field('mood_type', 'energy')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject update by non-owner', async () => {
      const response = await request(app)
        .put(`/api/tracks/1`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Updated Track')
        .field('artist', 'Updated Artist')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject update of non-existent track', async () => {
      const response = await request(app)
        .put(`/api/tracks/999`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('title', 'Updated Track')
        .field('artist', 'Updated Artist')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject update with invalid mood type', async () => {
      const response = await request(app)
        .put(`/api/tracks/1`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('title', 'Updated Track')
        .field('mood_type', 'invalid');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid mood type');
    });

    it('should allow partial updates', async () => {
      const response = await request(app)
        .put(`/api/tracks/1`)
        .set('Authorization', `Bearer ${regularUserToken}`)
        .field('artist', 'Only Artist Update');

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/tracks/:id', () => {
    beforeEach(async () => {
      await dbInstance.run('INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)',
        ['Track to Delete', 'Artist', '/uploads/audio/delete.mp3', '/uploads/covers/delete.jpg', 'focus', regularUserId]);
    });

    it('should delete track owned by owner', async () => {
      const response = await request(app)
        .delete(`/api/tracks/1`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should reject delete by non-owner', async () => {
      const response = await request(app)
        .delete(`/api/tracks/1`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Not authorized');
    });

    it('should reject delete of non-existent track', async () => {
      const response = await request(app)
        .delete(`/api/tracks/999`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });

    it('should delete audio and cover files', async () => {
      const track = await new Promise((resolve, reject) => {
        dbInstance.get('SELECT * FROM tracks WHERE id = ?', [1], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      const audioPath = path.join(__dirname, '..', track.file_path);
      const coverPath = path.join(__dirname, '..', track.cover_url);

      const response = await request(app)
        .delete(`/api/tracks/1`)
        .set('Authorization', `Bearer ${regularUserToken}`);

      expect(response.status).toBe(200);
      expect(require('fs').existsSync(audioPath)).toBe(false);
      expect(require('fs').existsSync(coverPath)).toBe(false);
    });
  });

  describe('Integration: Full CRUD Flow', () => {
    it('should create, update, and delete a track', async () => {
      const createResponse = await request(app)
        .post('/api/tracks')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Integration Track')
        .field('artist', 'Integration Artist')
        .field('mood_type', 'focus')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(createResponse.status).toBe(201);
      const trackId = createResponse.body.track.id;

      const updateResponse = await request(app)
        .put(`/api/tracks/${trackId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('title', 'Updated Integration Track')
        .field('artist', 'Updated Integration Artist')
        .attach('audio', Buffer.from('fake audio'), 'audio.mp3');

      expect(updateResponse.status).toBe(200);

      const getResponse = await request(app).get(`/api/tracks/${trackId}`);
      expect(getResponse.body.track.title).toBe('Updated Integration Track');

      const deleteResponse = await request(app)
        .delete(`/api/tracks/${trackId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteResponse.status).toBe(200);

      const verifyResponse = await request(app).get(`/api/tracks/${trackId}`);
      expect(verifyResponse.status).toBe(404);
    });
  });
});