import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '@shared/hooks';
import { createTrack } from '@features/music/store/musicSlice';
import { upload } from '@shared/api/axiosClient';
import { Button } from '@shared/ui/Button';
import { Input } from '@shared/ui/Input';
import { MoodSelector } from '@features/music/components/MoodSelector';
import { MusicLayout } from '@features/music/ui/MusicLayout';

export const CreateTrackForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.music);

  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [mood, setMood] = useState('focus');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleCoverPreview = (file: File) => {
    setCoverFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioFile) {
      alert('Please select an audio file');
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioFile);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('mood_type', mood);

    if (coverFile) {
      formData.append('cover', coverFile);
    }

    await dispatch(createTrack(formData));
    
    // Reset form
    setTitle('');
    setArtist('');
    setMood('focus');
    setAudioFile(null);
    setCoverFile(null);
    setPreviewUrl(null);
  };

  return (
    <MusicLayout>
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add New Track</h1>
          <p className="text-gray-600">Share your music with the community</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Track Title
              </label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artist Name
              </label>
              <Input
                type="text"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="Enter artist name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mood Type
              </label>
              <MoodSelector
                selectedMood={mood}
                onMoodChange={setMood}
                isCreating={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audio File (MP3, WAV)
              </label>
              <input
                type="file"
                accept="audio/mpeg,audio/wav,audio/mp3"
                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Image (Optional)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handleCoverPreview(e.target.files[0]);
                  }
                }}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />

              {previewUrl && (
                <div className="mt-4">
                  <img
                    src={previewUrl}
                    alt="Cover preview"
                    className="w-32 h-32 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
            >
              Create Track
            </Button>
          </div>
        </form>
      </div>
    </MusicLayout>
  );
};