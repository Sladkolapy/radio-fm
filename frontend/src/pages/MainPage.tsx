import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { fetchAllTracks } from '@features/music/store/musicSlice';
import { TrackList } from '@features/music/components/TrackList';
import { Player } from '@features/music/components/Player';
import { logout } from '@features/auth/store/authSlice';
import { Button } from '@shared/ui/Button';

const MainPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { token, user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { allTracks, isLoading: musicLoading, error } = useAppSelector((state) => state.music);

  useEffect(() => {
    console.log('MainPage: token:', token);
    console.log('MainPage: authLoading:', authLoading);
    console.log('MainPage: musicLoading:', musicLoading);
    console.log('MainPage: error:', error);

    if (!token) {
      console.log('MainPage: No token, redirecting to /login');
      navigate('/login');
      return;
    }

    if (allTracks.length === 0 && !musicLoading) {
      console.log('MainPage: Fetching tracks...');
      dispatch(fetchAllTracks());
    }
  }, [dispatch, token, navigate, allTracks, musicLoading]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleCreateTrack = () => {
    navigate('/music/new');
  };

  const handleEditTrack = (id: number) => {
    navigate(`/music/${id}/edit`);
  };

  const handleDeleteTrack = (id: number) => {
    dispatch({
      type: 'music/deleteTrack',
      payload: id
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Music Library</h1>
            <p className="text-gray-600">Browse and play your favorite tracks</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">Music Lover</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid gap-6">
          <Player tracks={allTracks} />

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Available Tracks</h2>
              <Button
                onClick={handleCreateTrack}
                variant="primary"
                size="md"
              >
                Add Track
              </Button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <TrackList
              tracks={allTracks}
              onCreateTrack={handleCreateTrack}
              onDeleteTrack={handleDeleteTrack}
              onEditTrack={handleEditTrack}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;