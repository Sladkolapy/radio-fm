import { useState } from 'react';
import { useAppSelector } from '@shared/hooks';
import MainPage from '@features/music/components/MainPage';
import AddTrackForm from '@features/music/components/AddTrackForm';
import { User } from '@shared/types';

export default function MusicPage() {
  const dispatch = useAppSelector((state) => state.music);
  const user = useAppSelector((state) => state.auth.user);
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="h-full">
      <div className="flex justify-between items-center p-6">
        <h2 className="text-2xl font-bold text-white">Music Library</h2>
        {user && (
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white rounded-lg transition-all shadow-lg"
          >
            + Add Track
          </button>
        )}
      </div>

      {showAddForm && <AddTrackForm onClose={() => setShowAddForm(false)} />}

      <MainPage isPrivate={false} />
    </div>
  );
}