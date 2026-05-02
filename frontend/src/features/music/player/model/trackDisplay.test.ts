import { describe, it, expect } from 'vitest';
import type { Track } from '@shared/types';
import { toPlayerTrackDisplay } from './trackDisplay';

describe('toPlayerTrackDisplay', () => {
  it('maps API track fields to player display', () => {
    const track: Track = {
      id: 7,
      title: 'T',
      artist: 'A',
      file_path: '/uploads/a.mp3',
      cover_url: 'https://ex/c.jpg',
      mood_type: 'focus',
    };
    expect(toPlayerTrackDisplay(track)).toEqual({
      id: 7,
      title: 'T',
      artist: 'A',
      coverUrl: 'https://ex/c.jpg',
      audioSrc: '/uploads/a.mp3',
    });
  });

  it('returns null for empty input', () => {
    expect(toPlayerTrackDisplay(null)).toBeNull();
    expect(toPlayerTrackDisplay(undefined)).toBeNull();
  });
});
