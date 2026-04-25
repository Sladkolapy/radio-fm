import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { fetchAllTracks, fetchTags } from '@features/music/store/musicSlice';
import { logout } from '@features/auth/store/authSlice';
import { TrackList } from '@features/music/components/TrackList';
import { Player } from '@features/music/components/Player';
import { TagFilter } from '@features/music/components/TagFilter';

const MainPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token } = useAppSelector((state) => state.auth);
  const { allTracks, tags, isLoading, error, cachedTrackIds } = useAppSelector((state) => state.music);
  const [selectedTagId, setSelectedTagId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'offline'>('all');

  const isAuthenticated = !!(token && user);

  useEffect(() => {
    if (allTracks.length === 0 && !isLoading) {
      dispatch(fetchAllTracks());
    }
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
  }, [dispatch, allTracks.length, isLoading, tags.length]);

  const handleLogout = () => {
    dispatch(logout());
  };

  const filteredTracks = selectedTagId
    ? allTracks.filter((t: any) => t.tags?.some((tag: any) => tag.id === selectedTagId))
    : allTracks;

  const displayTracks = activeTab === 'offline'
    ? filteredTracks.filter(t => cachedTrackIds.includes(t.id))
    : filteredTracks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Music Library</h1>
            <p className="text-gray-600">Browse and play your favorite tracks</p>
          </div>

          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Music Lover'}
                </p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors text-sm font-medium"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => navigate('/music/new')}
                className="px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 rounded-lg transition-colors text-sm font-medium"
              >
                Add Track
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <Player tracks={displayTracks} />

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              All Tracks
            </button>
            <button
              onClick={() => setActiveTab('offline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'offline' ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}
            >
              Offline ({cachedTrackIds.length})
            </button>
          </div>

          {activeTab === 'all' && tags.length > 0 && (
            <TagFilter
              tags={tags}
              selectedTagId={selectedTagId}
              onTagSelect={setSelectedTagId}
            />
          )}

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {activeTab === 'offline'
                ? 'Offline Tracks'
                : (selectedTagId
                    ? `Tracks: ${tags.find(t => t.id === selectedTagId)?.name || ''}`
                    : 'All Tracks')}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            <TrackList
              tracks={displayTracks}
              isAuthenticated={isAuthenticated}
              isOfflineList={activeTab === 'offline'}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
