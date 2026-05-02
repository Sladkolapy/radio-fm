import React, { type CSSProperties } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import type { PlayerViewProps } from '@features/music/player/model/types';
import { formatPlayerTime } from '@features/music/player/model/formatTime';

export function PlayerView(props: PlayerViewProps) {
  if (props.variant === 'empty') {
    return (
      <div className="w-full p-6 bg-surface rounded-2xl border border-white/10 shadow-xl">
        <div className="text-center text-slate-300">
          <p className="text-lg font-medium">{props.message ?? 'Select a track to start playing'}</p>
        </div>
      </div>
    );
  }

  const {
    track,
    timeline,
    volumeIconMuted,
    networkOnline,
    playbackError,
    isOfflineSourceLoading,
    onPrev,
    onTogglePlay,
    onNext,
    onMuteToggle,
    onVolumeChange,
    onSeek,
    audio
  } = props;

  const { currentTime, duration, volume, isPlaying } = timeline;

  const seekPct =
    duration > 0 ? `${Math.min(100, Math.max(0, (currentTime / duration) * 100))}%` : '0%';
  const volPct = `${Math.round(volume * 100)}%`;
  const remaining = Math.max(0, duration - currentTime);

  const handleVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const handleSeekInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div className="w-full p-6 bg-surface rounded-2xl border border-white/10 shadow-xl">
      {!networkOnline && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-950/40 border border-amber-500/35 text-amber-100 text-sm">
          Нет подключения к сети. Воспроизведение возможно только для треков, сохранённых для оффлайна.
        </div>
      )}
      {isOfflineSourceLoading && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-200 text-sm">
          Загрузка аудио из кэша браузера…
        </div>
      )}
      {playbackError && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-950/50 border border-red-500/40 text-red-200 text-sm">
          {playbackError}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-6">
        {track.coverUrl ? (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full sm:w-40 sm:h-40 sm:shrink-0 aspect-square max-w-[200px] mx-auto sm:mx-0 rounded-2xl object-cover shadow-lg"
          />
        ) : (
          <div
            className="w-full sm:w-40 sm:shrink-0 aspect-square max-w-[200px] mx-auto sm:mx-0 rounded-2xl shadow-lg bg-gradient-to-b from-[#1A2A6C] via-[#7C3AED] to-[#EC4899]"
            aria-hidden
          />
        )}

        <div className="flex-1 min-w-0 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white truncate">{track.title}</h3>
          <p className="text-slate-400 truncate mt-0.5">{track.artist}</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeekInput}
          className="player-seek w-full cursor-pointer"
          style={{ '--seek-pct': seekPct } as CSSProperties}
        />
      </div>

      <div className="text-sm flex justify-between text-white mb-6">
        <span>{formatPlayerTime(currentTime)}</span>
        <span>{formatPlayerTime(remaining)}</span>
      </div>

      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          type="button"
          onClick={onPrev}
          className="p-2 rounded-full text-white hover:text-primary-400 transition-colors"
          aria-label="Previous track"
        >
          <SkipBack className="w-7 h-7" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className="p-4 rounded-full bg-white text-app hover:bg-white/95 transition-colors shadow-lg"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 pl-0.5" />}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="p-2 rounded-full text-white hover:text-primary-400 transition-colors"
          aria-label="Next track"
        >
          <SkipForward className="w-7 h-7" />
        </button>
      </div>

      <div className="flex items-center gap-3 justify-center sm:justify-start">
        <button
          type="button"
          onClick={onMuteToggle}
          className="p-2 rounded-full text-primary-400 hover:text-primary-300 shrink-0 transition-colors"
          title={timeline.muted ? 'Включить звук' : 'Без звука'}
          aria-label={timeline.muted ? 'Unmute' : 'Mute'}
        >
          {volumeIconMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={handleVolumeInput}
          className="player-volume flex-1 h-1 min-w-[72px] max-w-xs cursor-pointer"
          style={{ '--vol-pct': volPct } as CSSProperties}
          aria-label="Громкость"
        />
      </div>

      <audio
        key={`${audio.trackId}-${audio.src ?? 'pending'}`}
        ref={audio.ref}
        {...(audio.src ? { src: audio.src } : {})}
        preload="metadata"
      />
    </div>
  );
}
