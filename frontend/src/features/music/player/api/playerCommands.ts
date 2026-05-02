import type { AppDispatch } from '@store/index';
import {
  togglePlayPause,
  nextTrack,
  prevTrack,
  updateProgress
} from '@features/music/store/musicSlice';

/** Команды воспроизведения поверх Redux (очередь, play/pause, прогресс в сторе приложения). */
export function createPlaybackCommands(dispatch: AppDispatch) {
  return {
    togglePlayPause: () => {
      dispatch(togglePlayPause());
    },
    next: () => {
      dispatch(nextTrack());
    },
    prev: () => {
      dispatch(prevTrack());
    },
    reportProgress: (seconds: number) => {
      dispatch(updateProgress(seconds));
    }
  };
}

export type PlaybackCommands = ReturnType<typeof createPlaybackCommands>;
