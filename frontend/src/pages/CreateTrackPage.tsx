import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { createTrack, fetchTags } from '@features/music/store/musicSlice';
import { TagSelector } from '@features/music/components/TagSelector';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';

const CreateTrackPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading: musicLoading } = useAppSelector((state) => state.music);
  const { tags } = useAppSelector((state) => state.music);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [moodType, setMoodType] = useState('focus');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
  }, [dispatch, tags.length]);

  const moodTypes = ['focus', 'energy', 'calm', 'motivation', 'relax'];
  const moodNames: Record<string, string> = {
    focus: 'Фокус',
    energy: 'Энергичность',
    calm: 'Спокойствие',
    motivation: 'Мотивация',
    relax: 'Релаксация'
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
      formData.append('tags', JSON.stringify(selectedTagIds));
      if (coverFile) {
        formData.append('cover', coverFile);
      }

      await dispatch(createTrack(formData));
      navigate('/music');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create track');
    }
  };

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Track</h1>
            <p className="text-slate-400">Add a new track to your music library</p>
          </div>
          <button
            onClick={() => navigate('/music')}
            className="px-4 py-2 bg-surface border border-white/15 hover:bg-white/5 text-white rounded-lg transition-colors text-sm font-medium"
          >
            Back
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 text-red-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-white/10 rounded-2xl p-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Title *</label>
            <Input
              type="text"
              placeholder="Enter track title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Artist *</label>
            <Input
              type="text"
              placeholder="Enter artist name"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mood Type</label>
            <select
              value={moodType}
              onChange={(e) => setMoodType(e.target.value)}
              className="select-field"
            >
              {moodTypes.map((type) => (
                <option key={type} value={type}>
                  {moodNames[type]}
                </option>
              ))}
            </select>
          </div>

          {tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Tags</label>
              <TagSelector
                tags={tags}
                selectedTagIds={selectedTagIds}
                onChange={setSelectedTagIds}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Audio File *</label>
            <input
              type="file"
              name="audio"
              accept="audio/*"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-600 file:text-app hover:file:bg-primary-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Cover Image (optional)</label>
            <input
              type="file"
              name="cover"
              accept="image/*"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-600/80 file:text-white hover:file:bg-violet-600"
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
