import type { Track } from '@shared/types';
import type { PlayerTrackDisplay } from './types';

export function toPlayerTrackDisplay(track: Track | null | undefined): PlayerTrackDisplay | null {
  if (!track) return null;
  return {
    id: track.id,
    title: track.title,
    artist: track.artist,
    coverUrl: track.cover_url,
    audioSrc: track.file_path
  };
}
