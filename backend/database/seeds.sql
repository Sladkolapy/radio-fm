-- Seed data
INSERT INTO users (username, password_hash) VALUES
('admin', '$2b$10$3nsN9ZE9OvQrSqD3FE2twul6uiLYQfUQHkfiRr.yWp8tloGd/e1Oq'),
('user1', '$2b$10$9nO7rJf9q1g6N5n3S2a6ne3XxZxXxXxXxXxXxXxXxXxXxXxXxXxX');

INSERT INTO tracks (title, artist, file_path, cover_url, mood_type, created_by) VALUES
('Morning Focus', 'Deep Chill', '/uploads/audio/morning_focus.mp3', '/uploads/covers/morning_focus.jpg', 'focus', 2),
('Energize Workout', 'Power Beats', '/uploads/audio/energize.mp3', '/uploads/covers/energize.jpg', 'energy', 2),
('Peaceful Mind', 'Quiet Vibes', '/uploads/audio/peaceful.mp3', '/uploads/covers/peaceful.jpg', 'calm', 2),
('High Performance', 'Motivation Mix', '/uploads/audio/high_performance.mp3', '/uploads/covers/high_performance.jpg', 'motivation', 2),
('Calm Nights', 'Relaxation', '/uploads/audio/calm_nights.mp3', '/uploads/covers/calm_nights.jpg', 'relax', 2),
('Study Session', 'Focus Beats', '/uploads/audio/study.mp3', '/uploads/covers/study.jpg', 'focus', 2),
('Energy Boost', 'Active', '/uploads/audio/energy_boost.mp3', '/uploads/covers/energy_boost.jpg', 'energy', 2),
('Zen State', 'Relax', '/uploads/audio/zen_state.mp3', '/uploads/covers/zen_state.jpg', 'relax', 2);