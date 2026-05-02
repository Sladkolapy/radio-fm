import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { fetchTrackById, updateTrack, deleteTrack, fetchTags } from '@features/music/store/musicSlice';
import { TagSelector } from '@features/music/components/TagSelector';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';

const EditTrackPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading: musicLoading } = useAppSelector((state) => state.music);
  const { tags } = useAppSelector((state) => state.music);

  const [track, setTrack] = useState<any>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [moodType, setMoodType] = useState('focus');
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [error, setError] = useState('');

  const moodTypes = ['focus', 'energy', 'calm', 'motivation', 'relax'];
  const moodNames: Record<string, string> = {
    focus: 'Фокус',
    energy: 'Энергичность',
    calm: 'Спокойствие',
    motivation: 'Мотивация',
    relax: 'Релаксация'
  };

  useEffect(() => {
    if (tags.length === 0) {
      dispatch(fetchTags());
    }
  }, [dispatch, tags.length]);

  useEffect(() => {
    if (id) {
      dispatch(fetchTrackById(Number(id)))
        .unwrap()
        .then((data: any) => {
          const t = data;
          if (t) {
            setTrack(t);
            setTitle(t.title);
            setArtist(t.artist);
            setMoodType(t.mood_type);
            setSelectedTagIds(t.tags?.map((tag: any) => tag.id) || []);
          } else {
            setError('Track not found');
          }
        })
        .catch(() => {
          setError('Failed to load track');
        });
    }
  }, [dispatch, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title || !artist) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await dispatch(updateTrack({
        id: Number(id),
        data: {
          title,
          artist,
          mood_type: moodType,
          tags: selectedTagIds
        }
      }));
      navigate('/music');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update track');
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this track?')) {
      try {
        await dispatch(deleteTrack(Number(id)));
        navigate('/music');
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to delete track');
      }
    }
  };

  if (!track && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="text-lg text-slate-300">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app text-white">
      <div className="max-w-2xl mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Track</h1>
            <p className="text-slate-400">Update track information</p>
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

        {track && (
          <form onSubmit={handleSubmit} className="space-y-6 bg-surface border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-4 p-4 bg-app/80 rounded-lg border border-white/10">
              <img
                src={track.cover_url || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=100'}
                alt={track.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white">{track.title}</h2>
                <p className="text-sm text-slate-400">{track.artist}</p>
              </div>
            </div>

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

            <div className="flex gap-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex-1"
                isLoading={musicLoading}
              >
                Save Changes
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
        )}

        <div className="mt-6">
          <Button
            variant="danger"
            size="lg"
            onClick={handleDelete}
            className="w-full"
          >
            Delete Track
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EditTrackPage;
