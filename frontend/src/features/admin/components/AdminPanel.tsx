import React from 'react';
import { useAppSelector, useAppDispatch } from '@shared/hooks';
import { logout } from '@features/auth/store/authSlice';
import type { Track } from '@shared/types';
import { TrackList } from '@features/music/components/TrackList';
import { Button } from '@shared/ui/Button';
import { MusicLayout } from '@features/music/ui/MusicLayout';
import { CreateTrackForm } from '@features/music/ui/CreateTrackForm';
import { useNavigate } from 'react-router-dom';

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { allTracks } = useAppSelector((state) => state.music);

  const handleDeleteTrack = (id: number) => {
    console.log('Delete track:', id);
  };

  const handleEditTrack = (id: number) => {
    navigate(`/admin/tracks/${id}`);
  };

  const handleCreateTrack = () => {
    navigate('/admin/tracks/new');
  };

  return (
    <MusicLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600">Manage all tracks in the library</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.username}</p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <Button
            onClick={() => dispatch(logout())}
            variant="secondary"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>

      <TrackList
        tracks={allTracks}
        isAdmin={true}
        onCreateTrack={handleCreateTrack}
        onDeleteTrack={handleDeleteTrack}
        onEditTrack={handleEditTrack}
      />
    </MusicLayout>
  );
};