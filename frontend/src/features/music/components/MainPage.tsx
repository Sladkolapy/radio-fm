import { useState } from 'react';
import { useDispatch, useAppSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchTracks, setCurrentTrack } from '@features/music/store/musicSlice';
import { addTrackToLibrary, removeTrackFromLibrary } from '@features/music/store/musicSlice';
import TrackList from './TrackList';
import Player from './Player';
import { User } from '@shared/types';

interface MainPageProps {
  isPrivate?: boolean;
}

export default function MainPage({ isPrivate = false }: MainPageProps) {
  const dispatch = useAppSelector((state) => state.music);
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [currentMoodFilter, setCurrentMoodFilter] = useState<string>('all');

  const moodTypes = [
    { value: 'all', label: 'All' },
    { value: 'focus', label: 'Focus' },
    { value: 'energy', label: 'Energy' },
    { value: 'calm', label: 'Calm' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'relax', label: 'Relax' }
  ];

  const handleLoadTracks = () => {
    if (isPrivate && auth.user) {
      dispatch(fetchTracks(auth.user.id));
    } else {
      dispatch(fetchTracks());
    }
  };

  const handleTrackClick = (track: Track) => {
    dispatch(setCurrentTrack(track));
  };

  const handleLibraryToggle = async (trackId: number) => {
    if (!auth.user) return;

    const existingIndex = dispatch.getState().music.tracks.findIndex(t => t.id === trackId);
    if (existingIndex !== -1) {
      await dispatch(removeTrackFromLibrary(trackId));
    } else {
      await dispatch(addTrackToLibrary(trackId));
    }
  };

  const filteredTracks = currentMoodFilter === 'all'
    ? dispatch.getState().music.tracks
    : dispatch.getState().music.tracks.filter(t => t.mood_type === currentMoodFilter);

  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isPrivate ? 'My Library' : 'Music Library'}
          </h2>
          {auth.user && (
            <button
              onClick={handleLoadTracks}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              Refresh
            </button>
          )}
        </div>

        {moodTypes.map((mood) => (
          <button
            key={mood.value}
            onClick={() => setCurrentMoodFilter(mood.value)}
            className={`px-4 py-2 rounded-lg mr-2 mb-2 transition-colors ${
              currentMoodFilter === mood.value
                ? 'bg-primary-600 text-white'
                : 'bg-white/10 text-gray-300 hover:bg-white/20'
            }`}
          >
            {mood.label}
          </button>
        ))}

        <TrackList
          tracks={filteredTracks}
          onSelectTrack={handleTrackClick}
          onToggleLibrary={handleLibraryToggle}
          showLibraryButton={isPrivate}
        />
      </div>

      <div className="mt-auto">
        <Player />
      </div>
    </div>
  );
}