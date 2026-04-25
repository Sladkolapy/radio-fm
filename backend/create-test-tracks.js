#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🎵 Creating test tracks for Music Player...');

const testTrackNames = [
  { title: 'Morning Focus', artist: 'Morning Vibes', mood: 'focus' },
  { title: 'Workout Energy', artist: 'Power Gym', mood: 'energy' },
  { title: 'Deep Peace', artist: 'Calm Waters', mood: 'calm' },
  { title: 'Success Motivation', artist: 'Mindset Pro', mood: 'motivation' },
  { title: 'Evening Relax', artist: 'Sunset Sounds', mood: 'relax' }
];

const tracksDir = path.join(__dirname, '../frontend/public/tracks');
const coversDir = path.join(__dirname, '../frontend/public/covers');

// Create directories
[tracksDir, coversDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

console.log('✅ Created directories for test tracks');
console.log('\n📝 Note: These are placeholder instructions for creating test tracks.');
console.log('To use these test tracks with the backend:');
console.log('1. Create actual MP3 files in the frontend/public/tracks directory');
console.log('2. Create image files in the frontend/public/covers directory');
console.log('3. Use the curl command in backend/test-api.js or import these in your database');

// Create a JSON file with track metadata
const tracksMetadata = testTrackNames.map((track, index) => ({
  id: index + 1,
  title: track.title,
  artist: track.artist,
  mood_type: track.mood,
  file_path: track.mood === 'focus' ? '/tracks/morning-focus.mp3' :
              track.mood === 'energy' ? '/tracks/workout-energy.mp3' :
              track.mood === 'calm' ? '/tracks/deep-peace.mp3' :
              track.mood === 'motivation' ? '/tracks/success-motivation.mp3' :
              '/tracks/evening-relax.mp3',
  cover_url: `https://images.unsplash.com/photo-${[
    '1506157786151-b8491531f063',
    '1534438327276-14e5300c3a48',
    '1448375240586-882707db888b',
    '1507003211169-0a1dd7228f2d',
    '1516280440614-37939bbacd81'
  ][index]}?w=300`
}));

fs.writeFileSync(
  path.join(__dirname, '../frontend/public/tracks-metadata.json'),
  JSON.stringify(tracksMetadata, null, 2)
);

console.log('✅ Created tracks-metadata.json with placeholder track data');
console.log('📍 File location: frontend/public/tracks-metadata.json');

console.log('\n📊 Test track structure:');
console.log(JSON.stringify(tracksMetadata, null, 2));