import { useState } from 'react';
import { useAppSelector, useAppDispatch } from '@shared/hooks';
import { fetchTracks } from '@features/music/store/musicSlice';
import { addTrackToLibrary, removeTrackFromLibrary } from '@features/music/store/musicSlice';
import TrackList from '@features/music/components/TrackList';
import { User } from '@shared/types';

interface LibraryPageProps {
  error?: string;
}

export default function LibraryPage({ error }: LibraryPageProps) {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppSelector((state) => state.music);

  const [loading, setLoading] = useState(false);

  const handleLoadLibrary = async () => {
    if (auth.user) {
      setLoading(true);
      await dispatch(fetchTracks(auth.user.id));
      setLoading(false);
    }
  };

  const handleLibraryToggle = async (trackId: number) => {
    const existingIndex = dispatch.getState().music.tracks.findIndex(t => t.id === trackId);
    if (existingIndex !== -1) {
      await dispatch(removeTrackFromLibrary(trackId));
    } else {
      await dispatch(addTrackToLibrary(trackId));
    }
  };

  const tracks = dispatch.getState().music.tracks;

  return (
    <div className="h-full p-6">
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm mb-6">
            {error}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">My Library</h2>
          <button
            onClick={handleLoadLibrary}
            disabled={loading}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <TrackList
          tracks={tracks}
          onSelectTrack={() => {}}
          onToggleLibrary={handleLibraryToggle}
          showLibraryButton={true}
        />
      </div>
    </div>
  );
}