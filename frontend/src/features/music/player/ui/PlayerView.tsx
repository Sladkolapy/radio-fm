import React from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import type { PlayerViewProps } from '@features/music/player/model/types';
import { formatPlayerTime } from '@features/music/player/model/formatTime';

export function PlayerView(props: PlayerViewProps) {
  if (props.variant === 'empty') {
    return (
      <div className="w-full p-6 bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl shadow-xl">
        <div className="text-center text-white">
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

  const handleVolumeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onVolumeChange(parseFloat(e.target.value));
  };

  const handleSeekInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSeek(parseFloat(e.target.value));
  };

  return (
    <div className="w-full p-6 bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl shadow-xl">
      {!networkOnline && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-amber-500/25 border border-amber-300/40 text-amber-50 text-sm">
          Нет подключения к сети. Воспроизведение возможно только для треков, сохранённых для оффлайна.
        </div>
      )}
      {isOfflineSourceLoading && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-white/10 text-white/90 text-sm">
          Загрузка аудио из кэша браузера…
        </div>
      )}
      {playbackError && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-900/50 border border-red-400/40 text-red-100 text-sm">
          {playbackError}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-bold text-white truncate">{track.title}</h3>
          <p className="text-primary-200 truncate">{track.artist}</p>
        </div>

        {track.coverUrl && (
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-20 h-20 rounded-lg object-cover shadow-lg flex-shrink-0"
          />
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          type="button"
          onClick={onPrev}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          type="button"
          onClick={onTogglePlay}
          className="p-3 rounded-full bg-white text-primary-600 hover:bg-white/90 transition-colors shadow-lg"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          type="button"
          onClick={onNext}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 ml-2 w-[min(100%,10rem)] sm:w-44 shrink-0">
          <button
            type="button"
            onClick={onMuteToggle}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors shrink-0"
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
            className="flex-1 h-1.5 min-w-[72px] max-w-full bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            aria-label="Громкость"
          />
        </div>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleSeekInput}
          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>

      <div className="text-white/80 text-sm flex justify-between">
        <span>{formatPlayerTime(currentTime)}</span>
        <span>{formatPlayerTime(duration)}</span>
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
