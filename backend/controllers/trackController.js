const db = require('../config/db');
const path = require('path');
const fs = require('fs');

function attachTagsToTracks(tracks, callback) {
  if (tracks.length === 0) {
    return callback(tracks);
  }

  const trackIds = tracks.map(t => t.id);
  const placeholders = trackIds.map(() => '?').join(',');

  db.all(`
    SELECT tt.track_id, tg.id as tag_id, tg.name as tag_name, tg.color as tag_color
    FROM track_tags tt
    JOIN tags tg ON tt.tag_id = tg.id
    WHERE tt.track_id IN (${placeholders})
  `, trackIds, (err, tagRows) => {
    if (err) {
      console.error('Error fetching tags for tracks:', err.message);
      return callback(tracks);
    }

    const tagMap = {};
    tagRows.forEach(row => {
      if (!tagMap[row.track_id]) tagMap[row.track_id] = [];
      tagMap[row.track_id].push({ id: row.tag_id, name: row.tag_name, color: row.tag_color });
    });

    const result = tracks.map(track => ({
      ...track,
      tags: tagMap[track.id] || []
    }));

    callback(result);
  });
}

exports.getAllTracks = (req, res) => {
  try {
    const { tag_id, mood_type } = req.query;
    let query = `
      SELECT t.id, t.title, t.artist, t.file_path, t.cover_url, t.mood_type, t.created_at,
             u.username as creator_name
      FROM tracks t
      LEFT JOIN users u ON t.created_by = u.id
    `;
    const conditions = [];
    const params = [];

    if (tag_id) {
      query += ' JOIN track_tags tt ON t.id = tt.track_id';
      conditions.push('tt.tag_id = ?');
      params.push(tag_id);
    }

    if (mood_type) {
      conditions.push('t.mood_type = ?');
      params.push(mood_type);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY t.id ORDER BY t.created_at DESC';

    db.all(query, params, (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      console.log('Tracks fetched from DB:', tracks);

      attachTagsToTracks(tracks, (tracksWithTags) => {
        res.json({ tracks: tracksWithTags });
      });
    });
  } catch (error) {
    console.error('Get all tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTrackById = (req, res) => {
  try {
    const { id } = req.params;

    db.get(
      'SELECT t.*, u.username as creator_name FROM tracks t LEFT JOIN users u ON t.created_by = u.id WHERE t.id = ?',
      [id],
      (err, track) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (!track) {
          return res.status(404).json({ error: 'Track not found' });
        }

        db.all(
          'SELECT tg.id, tg.name, tg.color FROM track_tags tt JOIN tags tg ON tt.tag_id = tg.id WHERE tt.track_id = ?',
          [id],
          (err, tags) => {
            if (err) {
              return res.status(500).json({ error: 'Database error' });
            }
            res.json({ track: { ...track, tags: tags || [] } });
          }
        );
      }
    );
  } catch (error) {
    console.error('Get track by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getUserPrivateTracks = async (req, res) => {
  try {
    const userId = req.userId;

    db.all(`
      SELECT t.id, t.title, t.artist, t.file_path, t.cover_url, t.mood_type, t.created_at
      FROM tracks t
      JOIN user_tracks ut ON t.id = ut.track_id
      WHERE ut.user_id = ?
      ORDER BY t.created_at DESC
    `, [userId], (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      attachTagsToTracks(tracks, (tracksWithTags) => {
        res.json({ tracks: tracksWithTags, user_id: userId });
      });
    });
  } catch (error) {
    console.error('Get user tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

function syncTrackTags(trackId, tags, callback) {
  db.run('DELETE FROM track_tags WHERE track_id = ?', [trackId], (err) => {
    if (err) return callback(err);

    if (!tags || tags.length === 0) return callback(null);

    const stmt = db.prepare('INSERT INTO track_tags (track_id, tag_id) VALUES (?, ?)');
    tags.forEach(tagId => stmt.run(trackId, tagId));
    stmt.finalize(callback);
  });
}

exports.createTrack = (req, res) => {
  try {
    const { title, artist, mood_type, tags } = req.body;
    const userId = req.userId;
    const audioFile = req.files?.audio ? req.files.audio[0] : null;
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

        const trackId = this.lastID;
        const tagIds = tags ? (typeof tags === 'string' ? JSON.parse(tags) : tags) : [];

        syncTrackTags(trackId, tagIds, (tagErr) => {
          if (tagErr) {
            console.error('Error syncing tags:', tagErr.message);
          }

          res.status(201).json({
            message: 'Track created successfully',
            track: {
              id: trackId,
              title,
              artist,
              file_path: audioPath,
              cover_url: coverUrl,
              mood_type,
              tags: tagIds
            }
          });
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
    const { title, artist, mood_type, tags } = req.body;
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

        if (track.created_by !== userId && req.userRole !== 'admin') {
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

        const doUpdate = () => {
          if (updateFields.length > 0) {
            values.push(id);
            db.run(`UPDATE tracks SET ${updateFields.join(', ')} WHERE id = ?`, values, function(err) {
              if (err) {
                return res.status(500).json({ error: 'Database error' });
              }
              res.json({ message: 'Track updated successfully' });
            });
          } else {
            res.json({ message: 'Track updated successfully' });
          }
        };

        if (tags !== undefined) {
          const tagIds = typeof tags === 'string' ? JSON.parse(tags) : tags;
          syncTrackTags(Number(id), tagIds, (tagErr) => {
            if (tagErr) {
              console.error('Error syncing tags:', tagErr.message);
            }
            doUpdate();
          });
        } else {
          doUpdate();
        }
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

        if (track.created_by !== userId && req.userRole !== 'admin') {
          return res.status(403).json({ error: 'Not authorized to delete this track' });
        }

        if (track.file_path) {
          const audioPath = path.join(__dirname, '..', track.file_path);
          if (fs.existsSync(audioPath)) {
            fs.unlinkSync(audioPath);
          }
        }

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
    db.all(`
      SELECT t.id, t.title, t.artist, t.file_path, t.cover_url, t.mood_type, t.created_at,
             u.username as creator_name
      FROM tracks t
      LEFT JOIN users u ON t.created_by = u.id
      ORDER BY t.created_at DESC
    `, (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      attachTagsToTracks(tracks, (tracksWithTags) => {
        res.json({ tracks: tracksWithTags });
      });
    });
  } catch (error) {
    console.error('Get admin tracks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
