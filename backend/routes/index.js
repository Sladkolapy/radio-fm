import { authenticateToken } from '../middleware/auth.js';
import {
  register,
  login,
  getProfile
} from '../controllers/authController.js';
import {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  getAllTracksAdmin,
  getUserPrivateTracks
} from '../controllers/trackController.js';
import { uploadAudio, uploadCover } from '../config/storage.js';

export function setupAuthRoutes(app) {
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.get('/api/auth/profile', authenticateToken, getProfile);
}

export function setupTrackRoutes(app) {
  app.get('/api/tracks', getAllTracks);
  app.get('/api/tracks/private', authenticateToken, getUserPrivateTracks);
  app.get('/api/tracks/:id', getTrackById);
  app.post('/api/tracks', authenticateToken, uploadAudio, uploadCover, createTrack);
  app.put('/api/tracks/:id', authenticateToken, updateTrack);
  app.delete('/api/tracks/:id', authenticateToken, deleteTrack);
}

export function setupAdminRoutes(app) {
  app.get('/api/admin/tracks', authenticateToken, async (req, res) => {
    try {
      if (req.username !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
      }

      const tracks = getAllTracksAdmin(req, res);
      res.status(200).json(tracks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}