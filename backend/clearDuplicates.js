const db = require('./config/db');
const fs = require('fs');

async function clearDuplicates() {
  console.log('Starting to clear duplicate tracks...');

  try {
    // Get all tracks
    db.all('SELECT id, title, artist, mood_type, created_at FROM tracks', (err, tracks) => {
      if (err) {
        console.error('Error fetching tracks:', err);
        return;
      }

      console.log(`Found ${tracks.length} total tracks`);

      // Create a map to track unique combinations
      const seen = new Map();

      tracks.forEach(track => {
        const key = `${track.title}-${track.artist}-${track.mood_type}`;

        if (seen.has(key)) {
          console.log(`Duplicate found: ${track.title} by ${track.artist} (${track.mood_type})`);
          seen.get(key).push(track.id);
        } else {
          seen.set(key, [track.id]);
        }
      });

      // Delete duplicates, keep the first one
      seen.forEach((ids, key) => {
        if (ids.length > 1) {
          const idsToDelete = ids.slice(1);
          console.log(`Deleting duplicates: ${idsToDelete.join(', ')}`);

          idsToDelete.forEach(id => {
            db.run('DELETE FROM tracks WHERE id = ?', [id], (err) => {
              if (err) {
                console.error(`Error deleting track ${id}:`, err);
              } else {
                console.log(`Deleted track ${id}`);
              }
            });
          });
        }
      });

      console.log('Duplicate cleanup completed!');
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

clearDuplicates();