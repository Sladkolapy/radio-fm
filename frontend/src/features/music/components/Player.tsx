import React, { useRef, useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import {
  togglePlayPause,
  nextTrack,
  prevTrack,
  updateProgress
} from '@features/music/store/musicSlice';
import type { Track } from '@shared/types';

interface PlayerProps {
  tracks: Track[];
}

export const Player: React.FC<PlayerProps> = ({ tracks: _tracks }) => {
  const dispatch = useAppDispatch();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const { currentTrack, isPlaying } = useAppSelector((state) => state.music);

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log('Player: Audio element initialized. Current track:', currentTrack);
    if (currentTrack) {
        console.log('Player: Audio source path:', currentTrack.file_path);
    }

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
        dispatch(updateProgress(audio.currentTime));
      }
    };

    const handleLoadedMetadata = () => {
      console.log('Player: loadedmetadata, duration:', audio.duration);
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      dispatch(nextTrack());
    };
    
    const handleError = (e: any) => {
      console.error('Player: Audio error:', e);
      console.error('Player: Audio error code:', audio.error?.code);
      console.error('Player: Audio error message:', audio.error?.message);
    };

    const handlePlay = () => console.log('Player: Play event triggered');
    const handlePause = () => console.log('Player: Pause event triggered');

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [dispatch, isDragging, currentTrack]); // Added currentTrack to dependencies

  React.useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    console.log('Player: Effect triggered. isPlaying:', isPlaying);
    audio.load();
    if (isPlaying) {
      console.log('Player: Attempting to play...');
      audio.play().catch((err) => {
        console.error('Player: Playback failed:', err);
      });
    } else {
      console.log('Player: Pausing...');
      audio.pause();
    }
  }, [isPlaying, currentTrack?.id]);

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    setIsDragging(true);
    dispatch(updateProgress(newTime));

    audio.currentTime = newTime;
    setTimeout(() => setIsDragging(false), 100);
  };

  if (!currentTrack) {
    return (
      <div className="w-full p-6 bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl shadow-xl">
        <div className="text-center text-white">
          <p className="text-lg font-medium">Select a track to start playing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-gradient-to-r from-primary-600 to-purple-700 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 mr-4">
          <h3 className="text-lg font-bold text-white truncate">
            {currentTrack.title}
          </h3>
          <p className="text-primary-200 truncate">
            {currentTrack.artist}
          </p>
        </div>

        {currentTrack.cover_url && (
          <img
            src={currentTrack.cover_url}
            alt={currentTrack.title}
            className="w-20 h-20 rounded-lg object-cover shadow-lg flex-shrink-0"
          />
        )}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={() => dispatch(prevTrack())}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        <button
          onClick={() => dispatch(togglePlayPause())}
          className="p-3 rounded-full bg-white text-primary-600 hover:bg-white/90 transition-colors shadow-lg"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
        </button>

        <button
          onClick={() => dispatch(nextTrack())}
          className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        <button className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors ml-2">
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="mb-4">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={handleProgressChange}
          className="w-full h-2 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-lg"
        />
      </div>

      <div className="text-white/80 text-sm flex justify-between">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      <audio
        key={currentTrack.id}
        ref={audioRef}
        src={currentTrack.file_path}
        preload="metadata"
      />
    </div>
  );
};

function formatTime(seconds: number): string {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
