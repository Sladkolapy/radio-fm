import { useRef, useEffect, useMemo, useCallback, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { usePlayerStore } from '@features/music/player/store/playerStore';
import { createPlaybackCommands } from '@features/music/player/api/playerCommands';
import { subscribeAudioElement, applyVolumeToAudio } from '@features/music/player/api/audioSubscriptions';
import { toPlayerTrackDisplay } from '@features/music/player/model/trackDisplay';
import type { PlayerViewProps } from '@features/music/player/model/types';
import { getCachedAudioObjectUrl } from '@shared/lib/offlineAudioCache';

function audioErrorMessage(code: number | undefined): string {
  switch (code) {
    case 1:
      return 'Воспроизведение прервано.';
    case 2:
      return 'Ошибка сети при загрузке аудио.';
    case 3:
      return 'Не удалось декодировать файл.';
    case 4:
      return 'Формат не поддерживается или файл недоступен.';
    default:
      return 'Не удалось воспроизвести аудио.';
  }
}

export function usePlayerController(): PlayerViewProps {
  const dispatch = useAppDispatch();
  const commands = useMemo(() => createPlaybackCommands(dispatch), [dispatch]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const blobRevokeRef = useRef<string | null>(null);

  const { currentTrack, isPlaying, cachedTrackIds } = useAppSelector((s) => s.music);

  const [networkOnline, setNetworkOnline] = useState(
    () => typeof navigator !== 'undefined' && navigator.onLine
  );
  const [offlineBlobSrc, setOfflineBlobSrc] = useState<string | null>(null);
  const [offlineBlobLoading, setOfflineBlobLoading] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const volume = usePlayerStore((s) => s.volume);
  const muted = usePlayerStore((s) => s.muted);
  const setCurrentTime = usePlayerStore((s) => s.setCurrentTime);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const setIsDragging = usePlayerStore((s) => s.setIsDragging);
  const setVolume = usePlayerStore((s) => s.setVolume);
  const toggleMuted = usePlayerStore((s) => s.toggleMuted);
  const resetForNewTrack = usePlayerStore((s) => s.resetForNewTrack);

  const revokeBlob = useCallback(() => {
    if (blobRevokeRef.current) {
      URL.revokeObjectURL(blobRevokeRef.current);
      blobRevokeRef.current = null;
    }
  }, []);

  useEffect(() => {
    const onOnline = () => setNetworkOnline(true);
    const onOffline = () => setNetworkOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  useEffect(() => {
    resetForNewTrack();
  }, [currentTrack?.id, resetForNewTrack]);

  useEffect(() => {
    revokeBlob();
    setOfflineBlobSrc(null);
    setPlaybackError(null);

    const saved =
      currentTrack != null && cachedTrackIds.includes(currentTrack.id);

    if (!currentTrack || networkOnline) {
      setOfflineBlobLoading(false);
      return;
    }

    if (!saved) {
      setPlaybackError(
        'Нет сети. Сохраните трек для оффлайна на вкладке «All Tracks» (кнопка с иконкой загрузки).'
      );
      return;
    }

    let cancelled = false;
    setOfflineBlobLoading(true);

    void getCachedAudioObjectUrl(currentTrack.file_path).then((url) => {
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      if (!url) {
        setPlaybackError(
          'Файла нет в кэше браузера. Включите сеть и нажмите «сохранить для оффлайна» ещё раз.'
        );
        setOfflineBlobLoading(false);
        return;
      }
      blobRevokeRef.current = url;
      setOfflineBlobSrc(url);
      setOfflineBlobLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [currentTrack, currentTrack?.id, currentTrack?.file_path, networkOnline, cachedTrackIds, revokeBlob]);

  useEffect(() => {
    return () => {
      revokeBlob();
    };
  }, [revokeBlob]);

  const effectiveAudioSrc = useMemo(() => {
    if (!currentTrack?.file_path) return undefined;
    if (networkOnline) return currentTrack.file_path;
    return offlineBlobSrc ?? undefined;
  }, [currentTrack?.file_path, networkOnline, offlineBlobSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    return subscribeAudioElement(audio, {
      getIsDragging: () => usePlayerStore.getState().isDragging,
      onTimeProgress: (t) => {
        setCurrentTime(t);
        commands.reportProgress(t);
      },
      onLoadedMetadata: ({ duration: dur, currentTime: ct }) => {
        setPlaybackError(null);
        setCurrentTime(ct);
        setDuration(dur);
      },
      onEnded: () => {
        commands.next();
      },
      onError: () => {
        setPlaybackError(audioErrorMessage(audio.error?.code));
      }
    });
  }, [currentTrack?.id, commands, setCurrentTime, setDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;
    if (!effectiveAudioSrc) return;

    if (isPlaying) {
      void audio.play().catch((err) => {
        console.error('Player: Playback failed:', err);
        setPlaybackError('Не удалось начать воспроизведение.');
      });
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack?.id, effectiveAudioSrc, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    applyVolumeToAudio(audio, volume, muted);
  }, [volume, muted, currentTrack?.id, effectiveAudioSrc]);

  const onSeek = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      setCurrentTime(seconds);
      setIsDragging(true);
      commands.reportProgress(seconds);
      audio.currentTime = seconds;
      setTimeout(() => setIsDragging(false), 100);
    },
    [commands, setCurrentTime, setIsDragging]
  );

  const onVolumeChange = useCallback(
    (value: number) => {
      setVolume(value);
    },
    [setVolume]
  );

  const display = toPlayerTrackDisplay(currentTrack);
  if (!display) {
    return { variant: 'empty', message: 'Select a track to start playing' };
  }

  const isSavedForOffline = cachedTrackIds.includes(display.id);

  return {
    variant: 'active',
    track: display,
    timeline: {
      currentTime,
      duration,
      volume,
      muted,
      isPlaying
    },
    volumeIconMuted: muted || volume === 0,
    networkOnline,
    playbackError,
    isOfflineSourceLoading:
      !networkOnline && isSavedForOffline && offlineBlobLoading,
    onPrev: commands.prev,
    onTogglePlay: commands.togglePlayPause,
    onNext: commands.next,
    onMuteToggle: toggleMuted,
    onVolumeChange,
    onSeek,
    audio: {
      ref: audioRef,
      src: effectiveAudioSrc,
      trackId: display.id
    }
  };
}
