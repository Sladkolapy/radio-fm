import React from 'react';
import { Play, Plus, Upload, Trash2, Edit, PlayCircle } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import { useAppSelector, useAppDispatch } from '@shared/hooks';
import { setCurrentTrack } from '@features/music/store/musicSlice';
import { deleteTrack } from '@features/music/store/musicSlice';
import type { Track } from '@shared/types';
import { moodColors } from '@shared/config/moodColors';

interface TrackListProps {
  tracks: Track[];
  isAdmin?: boolean;
  onCreateTrack?: () => void;
  onDeleteTrack?: (id: number) => void;
  onEditTrack?: (id: number) => void;
}

export const TrackList: React.FC<TrackListProps> = ({
  tracks,
  isAdmin = false,
  onCreateTrack,
  onDeleteTrack,
  onEditTrack
}) => {
  const dispatch = useAppDispatch();
  const { currentTrack } = useAppSelector((state) => state.music);

  const handleTrackClick = (track: Track) => {
    dispatch(setCurrentTrack({
      ...track,
      isPlaying: true,
      progress: 0
    }));
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
          <Upload className="w-5 h-5" />
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
                <span className={cn(
                  'text-xs px-2 py-1 rounded-full mt-1',
                  moodColors[track.mood_type] || 'bg-gray-100 text-gray-700'
                )}>
                  {track.mood_type}
                </span>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {isAdmin && onDeleteTrack && (
                  <button
                    onClick={(e) => handleDelete(e, track.id)}
                    className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                {isAdmin && onEditTrack && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEditTrack(track.id); }}
                    className="p-2 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};