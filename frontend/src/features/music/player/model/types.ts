import type { RefObject } from 'react';

/** Данные трека для отображения в плеере (без лишних полей доменной модели). */
export interface PlayerTrackDisplay {
  id: number;
  title: string;
  artist: string;
  coverUrl?: string;
  audioSrc?: string;
}

/** Снимок таймлайна и громкости для UI. */
export interface PlayerTimelineSnapshot {
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  isPlaying: boolean;
}

export interface PlayerAudioMount {
  ref: RefObject<HTMLAudioElement>;
  src: string | undefined;
  trackId: number;
}

export type PlayerViewProps =
  | { variant: 'empty'; message?: string }
  | {
      variant: 'active';
      track: PlayerTrackDisplay;
      timeline: PlayerTimelineSnapshot;
      volumeIconMuted: boolean;
      /** Сеть доступна (navigator.onLine). */
      networkOnline: boolean;
      /** Ошибка воспроизведения / оффлайн для UI. */
      playbackError: string | null;
      /** Идёт чтение файла из Cache Storage → blob (оффлайн). */
      isOfflineSourceLoading: boolean;
      onPrev: () => void;
      onTogglePlay: () => void;
      onNext: () => void;
      onMuteToggle: () => void;
      onVolumeChange: (value: number) => void;
      onSeek: (seconds: number) => void;
      audio: PlayerAudioMount;
    };
