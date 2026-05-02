/**
 * Подписки на события нативного <audio> без React.
 * Используется из хука контроллера; размонтаж — вернуть cleanup.
 */
export interface AudioSubscriptionHandlers {
  getIsDragging: () => boolean;
  onTimeProgress: (currentTime: number) => void;
  onLoadedMetadata: (payload: { duration: number; currentTime: number }) => void;
  /** Когда движок уточняет длительность (часто у длинных/VBR MP3 после первого metadata). */
  onDurationChange?: (duration: number) => void;
  onEnded: () => void;
  onError?: (info: { code?: number; message?: string }) => void;
}

export function subscribeAudioElement(
  audio: HTMLAudioElement,
  h: AudioSubscriptionHandlers
): () => void {
  const onTimeUpdate = () => {
    if (!h.getIsDragging()) {
      h.onTimeProgress(audio.currentTime);
    }
  };

  const onLoadedMetadata = () => {
    h.onLoadedMetadata({
      duration: Number.isFinite(audio.duration) ? audio.duration : 0,
      currentTime: audio.currentTime
    });
  };

  const onDurationChange = () => {
    if (h.onDurationChange && Number.isFinite(audio.duration)) {
      h.onDurationChange(audio.duration);
    }
  };

  const onEnded = () => {
    h.onEnded();
  };

  const onError = () => {
    if (audio.error && h.onError) {
      h.onError({ code: audio.error.code, message: audio.error.message });
    }
  };

  audio.addEventListener('timeupdate', onTimeUpdate);
  audio.addEventListener('loadedmetadata', onLoadedMetadata);
  audio.addEventListener('durationchange', onDurationChange);
  audio.addEventListener('ended', onEnded);
  audio.addEventListener('error', onError);

  return () => {
    audio.removeEventListener('timeupdate', onTimeUpdate);
    audio.removeEventListener('loadedmetadata', onLoadedMetadata);
    audio.removeEventListener('durationchange', onDurationChange);
    audio.removeEventListener('ended', onEnded);
    audio.removeEventListener('error', onError);
  };
}

export function applyVolumeToAudio(
  audio: HTMLAudioElement,
  volume: number,
  muted: boolean
): void {
  audio.volume = volume;
  audio.muted = muted;
}
