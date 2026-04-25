const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { authMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/tracks', trackController.getPublicTracks);
router.get('/tracks/:id', trackController.getTrackById);

// Protected routes
router.get('/private', authMiddleware, trackController.getUserPrivateTracks);
router.post('/tracks', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), trackController.createTrack);
router.put('/tracks/:id', authMiddleware, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), trackController.updateTrack);
router.delete('/tracks/:id', authMiddleware, trackController.deleteTrack);

// Admin routes
router.get('/admin/tracks', authMiddleware, trackController.getAllTracksAdmin);

module.exports = router;