const db = require('../config/db');
const path = require('path');
const fs = require('fs');

exports.getAllTracks = (req, res) => {
  try {
    db.all(`
      SELECT 
        t.id, t.title, t.artist, t.cover_url, t.mood_type, t.created_at,
        u.username as creator_name
      FROM tracks t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `, (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // Add public access flag
      tracks = tracks.map(track => ({
        ...track,
        is_public: true
      }));

      res.json({ tracks });
    });
  } catch (error) {
    console.error('Get all tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPublicTracks = (req, res) => {
  try {
    db.all(`
      SELECT 
        t.id, t.title, t.artist, t.cover_url, t.mood_type, t.created_at
      FROM tracks t
      ORDER BY t.created_at DESC
    `, (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      tracks = tracks.map(track => ({
        ...track,
        is_public: true
      }));

      res.json({ tracks });
    });
  } catch (error) {
    console.error('Get public tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserPrivateTracks = async (req, res) => {
  try {
    const userId = req.userId;

    db.all(`
      SELECT 
        t.id, t.title, t.artist, t.file_path, t.cover_url, t.mood_type, t.created_at
      FROM tracks t
      JOIN user_tracks ut ON t.id = ut.track_id
      WHERE ut.user_id = ?
      ORDER BY t.created_at DESC
    `, [userId], (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ tracks, user_id: userId });
    });
  } catch (error) {
    console.error('Get user tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTrackById = (req, res) => {
  try {
    const { id } = req.params;

    db.get(
      'SELECT * FROM tracks WHERE id = ?',
      [id],
      (err, track) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!track) {
          return res.status(404).json({ error: 'Track not found' });
        }

        res.json({ track, is_public: true });
      }
    );
  } catch (error) {
    console.error('Get track by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTrack = (req, res) => {
  try {
    const { title, artist, mood_type } = req.body;
    const userId = req.userId;
    const audioFile = req.file;
    const coverFile = req.files?.cover ? req.files.cover[0] : null;

    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file is required' });
    }

    if (!title || !artist || !mood_type) {
      return res.status(400).json({ error: 'Title, artist, and mood type are required' });
    }

    const moodTypes = ['focus', 'energy', 'calm', 'motivation', 'relax'];
    if (!moodTypes.includes(mood_type)) {
      return res.status(400).json({ error: 'Invalid mood type' });
    }

    const audioPath = `/uploads/audio/${audioFile.filename}`;
    const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;

    db.run(
      `INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES (?, ?, ?, ?, ?, ?)`,
      [title, artist, audioPath, coverUrl, mood_type, userId],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
          message: 'Track created successfully',
          track: {
            id: this.lastID,
            title,
            artist,
            file_path: audioPath,
            cover_url: coverUrl,
            mood_type
          }
        });
      }
    );
  } catch (error) {
    console.error('Create track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTrack = (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, mood_type } = req.body;
    const userId = req.userId;

    // Check if track exists and belongs to user
    db.get(
      'SELECT * FROM tracks WHERE id = ?',
      [id],
      (err, track) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!track) {
          return res.status(404).json({ error: 'Track not found' });
        }

        if (track.created_by !== userId) {
          return res.status(403).json({ error: 'Not authorized to update this track' });
        }

        const updateFields = [];
        const values = [];

        if (title !== undefined) {
          updateFields.push('title = ?');
          values.push(title);
        }

        if (artist !== undefined) {
          updateFields.push('artist = ?');
          values.push(artist);
        }

        if (mood_type !== undefined) {
          const moodTypes = ['focus', 'energy', 'calm', 'motivation', 'relax'];
          if (!moodTypes.includes(mood_type)) {
            return res.status(400).json({ error: 'Invalid mood type' });
          }
          updateFields.push('mood_type = ?');
          values.push(mood_type);
        }

        values.push(id);

        const updateQuery = `UPDATE tracks SET ${updateFields.join(', ')} WHERE id = ?`;

        db.run(updateQuery, values, function(err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({ message: 'Track updated successfully' });
        });
      }
    );
  } catch (error) {
    console.error('Update track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTrack = (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    db.get(
      'SELECT * FROM tracks WHERE id = ?',
      [id],
      (err, track) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!track) {
          return res.status(404).json({ error: 'Track not found' });
        }

        if (track.created_by !== userId) {
          return res.status(403).json({ error: 'Not authorized to delete this track' });
        }

        // Delete audio file
        if (track.file_path) {
          const audioPath = path.join(__dirname, '..', track.file_path);
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
          }
        }

        // Delete cover file
        if (track.cover_url) {
          const coverPath = path.join(__dirname, '..', track.cover_url);
          if (fs.existsSync(coverPath)) {
            fs.unlinkSync(coverPath);
          }
        }

        db.run('DELETE FROM tracks WHERE id = ?', [id], (err) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          res.json({ message: 'Track deleted successfully' });
        });
      }
    );
  } catch (error) {
    console.error('Delete track error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllTracksAdmin = (req, res) => {
  try {
    const userId = req.userId;

    db.all(`
      SELECT 
        t.id, t.title, t.artist, t.file_path, t.cover_url, t.mood_type, t.created_at,
        u.username as creator_name
      FROM tracks t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `, (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      res.json({ tracks, admin_id: userId });
    });
  } catch (error) {
    console.error('Get admin tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};