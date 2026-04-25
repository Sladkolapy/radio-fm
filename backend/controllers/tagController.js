const db = require('../config/db');

exports.getAllTags = (req, res) => {
  try {
    db.all('SELECT * FROM tags ORDER BY name', (err, tags) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ tags });
    });
  } catch (error) {
    console.error('Get all tags error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createTag = (req, res) => {
  try {
    const { name, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Tag name is required' });
    }

    db.run(
      'INSERT INTO tags (name, color) VALUES (?, ?)',
      [name, color || '#6366f1'],
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Tag already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        res.status(201).json({
          message: 'Tag created successfully',
          tag: {
            id: this.lastID,
            name,
            color: color || '#6366f1'
          }
        });
      }
    );
  } catch (error) {
    console.error('Create tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateTag = (req, res) => {
  try {
    const { id } = req.params;
    const { name, color } = req.body;

    const updateFields = [];
    const values = [];

    if (name !== undefined) {
      updateFields.push('name = ?');
      values.push(name);
    }

    if (color !== undefined) {
      updateFields.push('color = ?');
      values.push(color);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);

    db.run(
      `UPDATE tags SET ${updateFields.join(', ')} WHERE id = ?`,
      values,
      function(err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Tag name already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }

        if (this.changes === 0) {
          return res.status(404).json({ error: 'Tag not found' });
        }

        res.json({ message: 'Tag updated successfully' });
      }
    );
  } catch (error) {
    console.error('Update tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteTag = (req, res) => {
  try {
    const { id } = req.params;

    db.run('DELETE FROM tags WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Tag not found' });
      }

      res.json({ message: 'Tag deleted successfully' });
    });
  } catch (error) {
    console.error('Delete tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getTracksByTag = (req, res) => {
  try {
    const { id } = req.params;

    db.all(`
      SELECT t.id, t.title, t.artist, t.cover_url, t.mood_type, t.created_at
      FROM tracks t
      JOIN track_tags tt ON t.id = tt.track_id
      WHERE tt.tag_id = ?
      ORDER BY t.created_at DESC
    `, [id], (err, tracks) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ tracks });
    });
  } catch (error) {
    console.error('Get tracks by tag error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
