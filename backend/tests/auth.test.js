const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('../../config/db');
const { authMiddleware } = require('../../middleware/auth');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const authController = require('../../controllers/authController');
const trackController = require('../../controllers/trackController');

app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);
app.get('/api/auth/profile', authMiddleware, authController.getProfile);

let dbPath = path.join(__dirname, '../../database/music.db');
const dbInstance = new sqlite3.Database(dbPath);
let testUser = null;
let adminToken = null;
let regularUserToken = null;
let regularUserId = null;

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
  });
});

afterEach(async () => {
  await dbInstance.run('DELETE FROM users');
  await dbInstance.run('DELETE FROM tracks');
  await dbInstance.run('DELETE FROM user_tracks');
});

afterAll(() => {
  dbInstance.close();
});

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'newuser', password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('newuser');
      expect(response.body.user.id).toBeDefined();
    });

    it('should reject duplicate username', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'admin', password: 'admin123' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'admin', password: 'differentpassword' });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('already exists');
    });

    it('should reject missing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should reject password shorter than 6 characters', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('at least 6');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'admin123' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('admin');
    });

    it('should reject invalid username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'password123' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid credentials');
    });

    it('should reject missing username', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'password123' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });

    it('should reject missing password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ username: 'admin' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should get profile for authorized user', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.username).toBe('admin');
      expect(response.body.user.id).toBeDefined();
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('Invalid or expired token');
    });

    it('should return user not found if user does not exist', async () => {
      const token = jwt.sign({ userId: 99999, username: 'nonexistent' }, process.env.JWT_SECRET || 'your-secret-key');
      
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toContain('User not found');
    });
  });
});

describe('Integration: Authentication Flow', () => {
  it('should register and login user', async () => {
    const registerResponse = await request(app)
      .post('/api/auth/register')
      .send({ username: 'integrationuser', password: 'password123' });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'integrationuser', password: 'password123' });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.token).toBeDefined();
  });

  it('should get profile after login', async () => {
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'admin123' });

    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${loginResponse.body.token}`);

    expect(profileResponse.status).toBe(200);
    expect(profileResponse.body.user.username).toBe('admin');
  });
});