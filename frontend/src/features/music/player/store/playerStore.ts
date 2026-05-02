import { create } from 'zustand';

/** Локальный UI/воспроизведение: таймлайн и громкость. Очередь и текущий трек — в Redux (`musicSlice`). */
interface PlayerStore {
  currentTime: number;
  duration: number;
  isDragging: boolean;
  volume: number;
  muted: boolean;
  setCurrentTime: (seconds: number) => void;
  setDuration: (seconds: number) => void;
  setIsDragging: (value: boolean) => void;
  setVolume: (value: number) => void;
  toggleMuted: () => void;
  resetForNewTrack: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentTime: 0,
  duration: 0,
  isDragging: false,
  volume: 1,
  muted: false,
  setCurrentTime: (seconds) => set({ currentTime: seconds }),
  setDuration: (seconds) => set({ duration: seconds }),
  setIsDragging: (value) => set({ isDragging: value }),
  setVolume: (value) => {
    const v = Math.min(1, Math.max(0, value));
    set({ volume: v, muted: false });
  },
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  resetForNewTrack: () =>
    set({
      currentTime: 0,
      duration: 0,
      isDragging: false,
    }),
}));
