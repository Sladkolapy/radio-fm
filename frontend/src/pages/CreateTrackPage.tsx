import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { createTrack } from '@features/music/store/musicSlice';
import { logout } from '@features/auth/store/authSlice';
import { Upload, X } from 'lucide-react';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';

const CreateTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const { isLoading: musicLoading } = useAppSelector((state) => state.music);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [moodType, setMoodType] = useState('focus');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const moodTypes = ['focus', 'energy', 'calm', 'motivation', 'relax'];
  const moodNames = {
    focus: 'Фокус',
    energy: 'Энергичность',
    calm: 'Спокойствие',
    motivation: 'Мотивация',
    relax: 'Релаксация'
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (name === 'audio') {
      setAudioFile(files?.[0] || null);
    } else if (name === 'cover') {
      setCoverFile(files?.[0] || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    if (!title || !artist) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('artist', artist);
      formData.append('mood_type', moodType);
      formData.append('audio', audioFile);
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      await dispatch(createTrack(formData));
      navigate('/music');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create track');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
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
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Track</h1>
            <p className="text-gray-600">Add a new track to your music library</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-2xl shadow-lg p-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              type="text"
              placeholder="Enter track title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artist *
            </label>
            <Input
              type="text"
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mood Type
            </label>
            <select
              value={moodType}
              onChange={(e) => setMoodType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              {moodTypes.map((type) => (
                <option key={type} value={type}>
                  {moodNames[type]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <input
              type="file"
              name="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                hover:file:bg-primary-100
              "
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Image (optional)
            </label>
            <input
              type="file"
              name="cover"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
              "
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              isLoading={musicLoading}
            >
              Create Track
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => navigate('/music')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrackPage;