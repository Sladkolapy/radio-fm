import React, { useState } from 'react';
import { PlayCircle, Trash2, Edit, Download, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { setCurrentTrack, deleteTrack, addCachedTrack, removeCachedTrack } from '@features/music/store/musicSlice';
import type { Track } from '@shared/types';
import { moodColors } from '@shared/config/moodColors';
import {
  cacheAudioForOffline,
  removeAudioFromCache,
  isCacheApiAvailable
} from '@shared/lib/offlineAudioCache';

interface TrackListProps {
  tracks: Track[];
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onCreateTrack?: () => void;
  onDeleteTrack?: (id: number) => void;
  onEditTrack?: (id: number) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  isAuthenticated = false,
  isAdmin = false,
  onCreateTrack,
  onDeleteTrack,
  onEditTrack
}) => {
  const dispatch = useAppDispatch();
  const { currentTrack, cachedTrackIds } = useAppSelector((state) => state.music);
  const [offlineBusyId, setOfflineBusyId] = useState<number | null>(null);

  const handleTrackClick = (track: Track) => {
    dispatch(setCurrentTrack({
      ...track,
      isPlaying: true,
      progress: 0
    }));
  };

  const handleSaveOrRemoveOffline = async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const cached = cachedTrackIds.includes(track.id);

    if (!isCacheApiAvailable()) {
      window.alert('В этом браузере недоступно сохранение для оффлайна (нет Cache API).');
      return;
    }

    setOfflineBusyId(track.id);
    try {
      if (cached) {
        await removeAudioFromCache(track.file_path);
        dispatch(removeCachedTrack(track.id));
      } else {
        await cacheAudioForOffline(track.file_path);
        dispatch(addCachedTrack(track.id));
      }
    } catch (err) {
      console.error('Offline cache:', err);
      window.alert(cached ? 'Не удалось удалить из кэша' : 'Не удалось сохранить трек для оффлайна');
    } finally {
      setOfflineBusyId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this track?')) {
      dispatch(deleteTrack(id));
      if (onDeleteTrack) {
        onDeleteTrack(id);
      }
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && onCreateTrack && (
        <button
          onClick={onCreateTrack}
          className="flex items-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors"
        >
          <span>Add New Track</span>
        </button>
      )}

      {tracks.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No tracks available</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              onClick={() => handleTrackClick(track)}
              className={cn(
                'flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group',
                currentTrack?.id === track.id && 'ring-2 ring-primary-500 bg-primary-50'
              )}
            >
              <div className="relative">
                <img
                  src={track.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100'}
                  alt={track.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                {currentTrack?.id === track.id && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <PlayCircle className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">
                  {track.title}
                </h3>
                <p className="text-sm text-gray-600 truncate">{track.artist}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={cn(
                    'text-xs px-2 py-1 rounded-full',
                    moodColors[track.mood_type] || 'bg-gray-100 text-gray-700'
                  )}>
                    {track.mood_type}
                  </span>
                  {cachedTrackIds.includes(track.id) && (
                    <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
                      Offline
                    </span>
                  )}
                  {track.tags?.map(tag => (
                    <span
                      key={tag.id}
                      className="text-xs px-2 py-1 rounded-full text-white"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <button
                  type="button"
                  onClick={(e) => handleSaveOrRemoveOffline(e, track)}
                  disabled={offlineBusyId === track.id}
                  className={cn(
                    'p-2 rounded-lg transition-colors flex items-center justify-center min-w-[2.25rem]',
                    cachedTrackIds.includes(track.id)
                      ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                      : 'text-gray-600 bg-gray-50 hover:bg-green-50 hover:text-green-700 border border-gray-200',
                    offlineBusyId === track.id && 'opacity-70 cursor-wait'
                  )}
                  title={
                    cachedTrackIds.includes(track.id)
                      ? 'Удалить из оффлайн'
                      : 'Сохранить для прослушивания без сети'
                  }
                  aria-label={
                    cachedTrackIds.includes(track.id)
                      ? 'Удалить из оффлайн'
                      : 'Сохранить для оффлайна'
                  }
                >
                  {offlineBusyId === track.id ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : cachedTrackIds.includes(track.id) ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                </button>

                {(isAdmin || isAuthenticated) && (
                  <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity border-l border-gray-200 pl-1 sm:pl-2 ml-0 sm:ml-1">
                    {isAdmin && onDeleteTrack && (
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, track.id)}
                        className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                        aria-label="Удалить трек"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {isAuthenticated && onEditTrack && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); onEditTrack(track.id); }}
                        className="p-2 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-colors"
                        aria-label="Редактировать"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
