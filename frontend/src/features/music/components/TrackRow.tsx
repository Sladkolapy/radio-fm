import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@shared/hooks';
import { setCurrentTrack } from '@features/music/store/musicSlice';
import { addTrackToLibrary, removeTrackFromLibrary } from '@features/music/store/musicSlice';
import { Track } from '@shared/types';

interface TrackRowProps {
  track: Track;
  index: number;
  onSelectTrack: (track: Track) => void;
  onToggleLibrary?: (trackId: number) => void;
  showLibraryButton?: boolean;
}

export default function TrackRow({ track, index, onSelectTrack, onToggleLibrary, showLibraryButton = false }: TrackRowProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);
  const isAddedToLibrary = auth.user && useAppSelector((state) =>
    state.music.tracks.some((t: Track) => t.id === track.id)
  );

  const handleLibraryToggle = async () => {
    if (auth.user && onToggleLibrary) {
      const existingIndex = dispatch.getState().music.tracks.findIndex((t: Track) => t.id === track.id);
      if (existingIndex !== -1) {
        await dispatch(removeTrackFromLibrary(track.id));
      } else {
        await dispatch(addTrackToLibrary(track.id));
      }
    }
  };

  const handleRowClick = () => {
    if (showLibraryButton) {
      handleLibraryToggle();
    } else {
      onSelectTrack(track);
      navigate('/library');
    }
  };

  const moodColors: Record<string, string> = {
    focus: 'from-blue-500 to-cyan-500',
    energy: 'from-orange-500 to-red-500',
    calm: 'from-green-500 to-teal-500',
    motivation: 'from-yellow-500 to-orange-500',
    relax: 'from-purple-500 to-pink-500'
  };

  const moodBadge = (
    <span className={`px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${moodColors[track.mood_type]} text-white`}>
      {track.mood_type}
    </span>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={handleRowClick}
      className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all cursor-pointer group"
    >
      <span className="text-gray-500 font-mono text-sm w-6">{(index + 1).toString().padStart(2, '0')}</span>

      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden">
        <img
          src={track.cover_url || `https://via.placeholder.com/48x48?text=${track.title.substring(0, 1)}`}
          alt={track.title}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-white font-medium truncate">{track.title}</h4>
        <p className="text-gray-400 text-sm">{track.artist}</p>
      </div>

      {moodBadge}

      {showLibraryButton && auth.user && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleLibraryToggle();
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            isAddedToLibrary
              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/40'
              : 'bg-green-500/20 text-green-300 hover:bg-green-500/40'
          }`}
        >
          {isAddedToLibrary ? 'Remove' : 'Add to Library'}
        </button>
      )}

      {!showLibraryButton && (
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-gray-500">▶</span>
        </div>
      )}
    </motion.div>
  );
}