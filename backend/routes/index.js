const { authenticateToken, adminMiddleware } = require('../middleware/auth');
const {
  register,
  login,
  getProfile
} = require('../controllers/authController');
const {
  getAllTracks,
  getTrackById,
  createTrack,
  updateTrack,
  deleteTrack,
  getAllTracksAdmin,
  getUserPrivateTracks
} = require('../controllers/trackController');
const {
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getTracksByTag
} = require('../controllers/tagController');
const upload = require('../config/storage');

exports.setupAuthRoutes = (app) => {
  app.post('/api/auth/register', register);
  app.post('/api/auth/login', login);
  app.get('/api/auth/profile', authenticateToken, getProfile);
};

exports.setupTrackRoutes = (app) => {
  app.get('/api/tracks', getAllTracks);
  app.get('/api/tracks/private', authenticateToken, getUserPrivateTracks);
  app.get('/api/tracks/:id', getTrackById);
  app.post('/api/tracks', authenticateToken, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), createTrack);
  app.put('/api/tracks/:id', authenticateToken, updateTrack);
  app.delete('/api/tracks/:id', authenticateToken, deleteTrack);
};

exports.setupTagRoutes = (app) => {
  app.get('/api/tags', getAllTags);
  app.get('/api/tags/:id/tracks', getTracksByTag);
  app.post('/api/tags', authenticateToken, adminMiddleware, createTag);
  app.put('/api/tags/:id', authenticateToken, adminMiddleware, updateTag);
  app.delete('/api/tags/:id', authenticateToken, adminMiddleware, deleteTag);
};

exports.setupAdminRoutes = (app) => {
  app.get('/api/admin/tracks', authenticateToken, adminMiddleware, getAllTracksAdmin);
  app.post('/api/admin/tracks', authenticateToken, adminMiddleware, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), createTrack);
  app.delete('/api/admin/tracks/:id', authenticateToken, adminMiddleware, deleteTrack);
};
