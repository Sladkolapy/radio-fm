const express = require('express');
const router = express.Router();
const trackController = require('../controllers/trackController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/tracks', trackController.getPublicTracks);
router.get('/tracks/:id', trackController.getTrackById);
router.get('/private', authenticateToken, trackController.getUserPrivateTracks);
router.post('/tracks', authenticateToken, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), trackController.createTrack);
router.put('/tracks/:id', authenticateToken, upload.fields([
  { name: 'audio', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]), trackController.updateTrack);
router.delete('/tracks/:id', authenticateToken, trackController.deleteTrack);
router.get('/admin/tracks', authenticateToken, trackController.getAllTracksAdmin);

module.exports = router;