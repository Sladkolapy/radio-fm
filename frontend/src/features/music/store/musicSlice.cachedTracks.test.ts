import { describe, it, expect, beforeEach } from 'vitest';
import type { MusicState } from '@shared/types';
import musicReducer, { addCachedTrack, removeCachedTrack } from './musicSlice';

function emptyMusicState(): MusicState {
  return {
    allTracks: [],
    privateTracks: [],
    tags: [],
    currentTrack: null,
    isPlaying: false,
    progress: 0,
    isLoading: false,
    error: null,
    cachedTrackIds: [],
  };
}

describe('musicSlice cachedTrackIds', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('addCachedTrack appends id and persists to localStorage', () => {
    const s1 = musicReducer(emptyMusicState(), addCachedTrack(3));
    expect(s1.cachedTrackIds).toEqual([3]);
    expect(localStorage.getItem('cachedTrackIds')).toBe('[3]');

    const s2 = musicReducer(s1, addCachedTrack(5));
    expect(s2.cachedTrackIds).toEqual([3, 5]);
    expect(localStorage.getItem('cachedTrackIds')).toBe('[3,5]');
  });

  it('addCachedTrack ignores duplicate ids', () => {
    const s1 = musicReducer(emptyMusicState(), addCachedTrack(1));
    const s2 = musicReducer(s1, addCachedTrack(1));
    expect(s2.cachedTrackIds).toEqual([1]);
  });

  it('removeCachedTrack filters id and updates localStorage', () => {
    const s1 = musicReducer(emptyMusicState(), addCachedTrack(2));
    const s2 = musicReducer(s1, addCachedTrack(4));
    const s3 = musicReducer(s2, removeCachedTrack(2));
    expect(s3.cachedTrackIds).toEqual([4]);
    expect(localStorage.getItem('cachedTrackIds')).toBe('[4]');
  });
});
