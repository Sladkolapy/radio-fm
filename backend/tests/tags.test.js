const request = require('supertest');
const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, adminMiddleware } = require('../middleware/auth');

const {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getTracksByTag
} = require('../controllers/tagController');

const app = express();
app.use(express.json());

app.get('/api/tags', getAllTags);
app.get('/api/tags/:id/tracks', getTracksByTag);
app.post('/api/tags', authenticateToken, adminMiddleware, createTag);
app.put('/api/tags/:id', authenticateToken, adminMiddleware, updateTag);
app.delete('/api/tags/:id', authenticateToken, adminMiddleware, deleteTag);

const dbPath = path.join(__dirname, '../database/music.db');
const dbInstance = new sqlite3.Database(dbPath);

function dbRun(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
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
let userToken = null;

beforeAll(async () => {
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  await dbRun(dbInstance, 'DELETE FROM track_tags');
  await dbRun(dbInstance, 'DELETE FROM tags WHERE name LIKE ? OR name LIKE ? OR name LIKE ?', [
    'jest-tag-a',
    'jest-tag-b',
    'jest-tag-rename'
  ]);
  await dbRun(dbInstance, 'DELETE FROM users WHERE username IN (?, ?)', ['jest_tags_admin', 'jest_tags_user']);

  const hash = await bcrypt.hash('password123', 10);
  await dbRun(dbInstance, 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
    'jest_tags_admin',
    hash,
    'admin'
  ]);
  await dbRun(dbInstance, 'INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)', [
    'jest_tags_user',
    hash,
    'user'
  ]);

  const admin = await dbGet(dbInstance, 'SELECT id FROM users WHERE username = ?', ['jest_tags_admin']);
  const user = await dbGet(dbInstance, 'SELECT id FROM users WHERE username = ?', ['jest_tags_user']);

  adminToken = jwt.sign(
    { userId: admin.id, username: 'jest_tags_admin', role: 'admin' },
    jwtSecret,
    { expiresIn: '1h' }
  );
  userToken = jwt.sign(
    { userId: user.id, username: 'jest_tags_user', role: 'user' },
    jwtSecret,
    { expiresIn: '1h' }
  );
});

afterAll(() => {
  dbInstance.close();
});

describe('Tags API', () => {
  it('GET /api/tags returns array', async () => {
    const res = await request(app).get('/api/tags');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tags)).toBe(true);
  });

  it('POST /api/tags without token → 401', async () => {
    const res = await request(app).post('/api/tags').send({ name: 'x', color: '#fff' });
    expect(res.status).toBe(401);
  });

  it('POST /api/tags as non-admin → 403', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ name: 'jest-tag-a', color: '#111111' });
    expect(res.status).toBe(403);
  });

  it('POST /api/tags as admin → 201', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'jest-tag-a', color: '#111111' });
    expect(res.status).toBe(201);
    expect(res.body.tag.name).toBe('jest-tag-a');
  });

  it('POST duplicate tag → 409', async () => {
    const res = await request(app)
      .post('/api/tags')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'jest-tag-a', color: '#222222' });
    expect(res.status).toBe(409);
  });

  it('PUT /api/tags/:id as admin', async () => {
    const row = await dbGet(dbInstance, 'SELECT id FROM tags WHERE name = ?', ['jest-tag-a']);
    const res = await request(app)
      .put(`/api/tags/${row.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'jest-tag-rename' });
    expect(res.status).toBe(200);
  });

  it('GET /api/tags/:id/tracks', async () => {
    const row = await dbGet(dbInstance, 'SELECT id FROM tags WHERE name = ?', ['jest-tag-rename']);
    const res = await request(app).get(`/api/tags/${row.id}/tracks`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tracks)).toBe(true);
  });

  it('DELETE /api/tags/:id as admin', async () => {
    const row = await dbGet(dbInstance, 'SELECT id FROM tags WHERE name = ?', ['jest-tag-rename']);
    const res = await request(app)
      .delete(`/api/tags/${row.id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
