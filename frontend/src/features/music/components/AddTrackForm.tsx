import { useState } from 'react';
import { createTrack } from '@features/music/store/musicSlice';
import { User } from '@shared/types';

interface AddTrackFormProps {
  onClose: () => void;
}

export default function AddTrackForm({ onClose }: AddTrackFormProps) {
  const dispatch = useAppSelector((state) => state.music);
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [moodType, setMoodType] = useState<'focus' | 'energy' | 'calm' | 'motivation' | 'relax'>('focus');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!audioFile) {
      setError('Please select an audio file');
      return;
    }

    const trackData = {
      title,
      artist,
      audio: audioFile,
      cover: coverFile,
      mood_type: moodType
    };

    await dispatch(createTrack(trackData));
    onClose();
  };

  const moodOptions = [
    { value: 'focus', label: 'Focus' },
    { value: 'energy', label: 'Energy' },
    { value: 'calm', label: 'Calm' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'relax', label: 'Relax' }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-white/20 rounded-2xl p-8 max-w-md w-full shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Add New Track</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Track title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Artist</label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Artist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mood Type</label>
            <select
              value={moodType}
              onChange={(e) => setMoodType(e.target.value as any)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {moodOptions.map((mood) => (
                <option key={mood.value} value={mood.value} className="bg-slate-800">
                  {mood.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Audio File (MP3/WAV)</label>
            <input
              type="file"
              accept=".mp3,.wav,.ogg"
              onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Cover Image (JPG/PNG)</label>
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full">
            Upload Track
          </Button>
        </form>
      </div>
    </div>
  );
}