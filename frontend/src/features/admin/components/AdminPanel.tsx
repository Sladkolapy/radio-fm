import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { logout } from '@features/auth/store/authSlice';
import { fetchAdminTracks, deleteAdminTrack } from '@features/admin/store/adminSlice';
import { fetchTags, createTag, deleteTag } from '@features/music/store/musicSlice';

import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import type { Tag } from '@shared/types';

const AdminPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { tracks, loading } = useAppSelector((state) => state.admin);
  const { tags } = useAppSelector((state) => state.music);
  const [activeTab, setActiveTab] = useState<'tracks' | 'tags'>('tracks');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6366f1');

  useEffect(() => {
    dispatch(fetchAdminTracks());
    dispatch(fetchTags());
  }, [dispatch]);

  const handleDeleteTrack = (id: number) => {
    if (confirm('Are you sure you want to delete this track?')) {
      dispatch(deleteAdminTrack(id));
    }
  };

  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    dispatch(createTag({ name: newTagName.trim(), color: newTagColor }));
    setNewTagName('');
    setNewTagColor('#6366f1');
  };

  const handleDeleteTag = (id: number) => {
    if (confirm('Are you sure you want to delete this tag?')) {
      dispatch(deleteTag(id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage tracks and tags</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.username}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
            <button
              onClick={() => navigate('/music')}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors text-sm font-medium"
            >
              Back to Music
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('tracks')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'tracks'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tracks ({tracks.length})
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === 'tags'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Tags ({tags.length})
          </button>
        </div>

        {activeTab === 'tracks' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Tracks</h2>
              <button
                onClick={() => navigate('/music/new')}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Add New Track
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : tracks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No tracks</div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                  >
                    <img
                      src={track.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100'}
                      alt={track.title}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{track.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-600">
                          {track.mood_type}
                        </span>
                        {track.tags?.map((tag: Tag) => (
                          <span
                            key={tag.id}
                            className="text-xs px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    {track.creator_name && (
                      <span className="text-xs text-gray-400">by {track.creator_name}</span>
                    )}
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors text-gray-400"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tags' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Manage Tags</h2>

            <form onSubmit={handleCreateTag} className="flex items-end gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="text"
                  label="Tag name"
                  placeholder="Enter tag name"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
              </div>
              <Button type="submit" variant="primary" size="md">
                Add Tag
              </Button>
            </form>

            <div className="space-y-2">
              {tags.map(tag => (
                <div key={tag.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <span
                    className="w-6 h-6 rounded-full flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <span className="font-medium text-gray-900 flex-1">{tag.name}</span>
                  <button
                    onClick={() => handleDeleteTag(tag.id)}
                    className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { AdminPanel };
