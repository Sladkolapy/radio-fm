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
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">PingMusic</h1>
            <p className="text-slate-400">Browse and play your favorite tracks</p>
          </div>

          {isAuthenticated ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-slate-500">
                  {user?.role === 'admin' ? 'Administrator' : 'Music Lover'}
                </p>
              </div>
              {user?.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="px-4 py-2 border border-primary-500/40 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors text-sm font-medium"
                >
                  Admin
                </button>
              )}
              <button
                onClick={() => navigate('/music/new')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-app rounded-lg transition-colors text-sm font-medium"
              >
                Add Track
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-red-500/40 hover:bg-red-950/40 text-red-300 rounded-lg transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-app rounded-lg transition-colors text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-4 py-2 bg-surface border border-white/15 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-6">
          <Player />

          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'all' ? 'bg-primary-600 text-app' : 'bg-surface border border-white/10 text-slate-300 hover:border-white/20'}`}
            >
              All Tracks
            </button>
            <button
              onClick={() => setActiveTab('offline')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'offline' ? 'bg-primary-600 text-app' : 'bg-surface border border-white/10 text-slate-300 hover:border-white/20'}`}
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

          <div className="bg-surface rounded-2xl border border-white/10 p-6 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6">
              {activeTab === 'offline'
                ? 'Offline Tracks'
                : (selectedTagId
                    ? `Tracks: ${tags.find(t => t.id === selectedTagId)?.name || ''}`
                    : 'All Tracks')}
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 text-red-200 rounded-lg">
                {error}
              </div>
            )}

            {activeTab === 'all' && (
              <p className="text-sm text-slate-300 mb-4 p-3 bg-app/80 border border-white/10 rounded-lg">
                <span className="font-medium text-primary-400">Оффлайн:</span> нажмите иконку загрузки у трека, чтобы
                сохранить его в этом браузере и слушать без сети. Повторное нажатие убирает трек из кэша.
              </p>
            )}

            {activeTab === 'offline' && displayTracks.length === 0 && !isLoading ? (
              <p className="text-center text-slate-500 py-10">
                {cachedTrackIds.length === 0
                  ? 'Пока нет сохранённых треков. Откройте вкладку «All Tracks» и нажмите кнопку с иконкой загрузки напротив трека.'
                  : 'Нет оффлайн-треков в текущем фильтре. Сбросьте тег на вкладке «All Tracks» или сохраните другие треки.'}
              </p>
            ) : (
              <TrackList
                tracks={displayTracks}
                isAuthenticated={isAuthenticated}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
