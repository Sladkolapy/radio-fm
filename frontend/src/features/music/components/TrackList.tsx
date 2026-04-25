import React from 'react';
import { PlayCircle, Trash2, Edit, Download, Trash } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { setCurrentTrack, deleteTrack, addCachedTrack, removeCachedTrack } from '@features/music/store/musicSlice';
import type { Track } from '@shared/types';
import { moodColors } from '@shared/config/moodColors';

interface TrackListProps {
  tracks: Track[];
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  isOfflineList?: boolean;
  onCreateTrack?: () => void;
  onDeleteTrack?: (id: number) => void;
  onEditTrack?: (id: number) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  isAuthenticated = false,
  isAdmin = false,
  isOfflineList = false,
  onCreateTrack,
  onDeleteTrack,
  onEditTrack
}) => {
  const dispatch = useAppDispatch();
  const { currentTrack, cachedTrackIds } = useAppSelector((state) => state.music);

  const handleTrackClick = (track: Track) => {
    dispatch(setCurrentTrack({
      ...track,
      isPlaying: true,
      progress: 0
    }));
  };

  const handleDownload = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if ('caches' in window) {
      caches.open('music-player-v1').then((cache) => {
        cache.add(track.file_path || '').then(() => {
          dispatch(addCachedTrack(track.id));
          alert('Track downloaded for offline use');
        }).catch(err => {
          console.error('Download failed:', err);
          alert('Download failed');
        });
      });
    } else {
      alert('Offline downloading is not supported in this browser');
    }
  };

  const handleRemoveOffline = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    if ('caches' in window) {
        caches.open('music-player-v1').then((cache) => {
            cache.delete(track.file_path || '').then(() => {
                dispatch(removeCachedTrack(track.id));
                alert('Track removed from offline cache');
            }).catch(err => {
                console.error('Removal failed:', err);
            });
        });
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

              {(isAdmin || isAuthenticated) && (
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {isOfflineList ? (
                    <button
                      onClick={(e) => handleRemoveOffline(e, track)}
                      className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                      title="Remove from offline"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  ) : isAuthenticated && (
                    <button
                      onClick={(e) => handleDownload(e, track)}
                      className={cn(
                        "p-2 rounded-lg transition-colors",
                        cachedTrackIds.includes(track.id) ? "text-green-600 bg-green-50" : "hover:bg-green-100 hover:text-green-600"
                      )}
                      title="Download for offline"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  {isAdmin && onDeleteTrack && (
                    <button
                      onClick={(e) => handleDelete(e, track.id)}
                      className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  {isAuthenticated && onEditTrack && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onEditTrack(track.id); }}
                      className="p-2 hover:bg-blue-100 hover:bg-blue-600 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
