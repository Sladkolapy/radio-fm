import type { Track } from '@shared/types';

export const moodColors: Record<Track['mood_type'], string> = {
  focus: 'bg-blue-100 text-blue-700',
  energy: 'bg-orange-100 text-orange-700',
  calm: 'bg-green-100 text-green-700',
  motivation: 'bg-red-100 text-red-700',
  relax: 'bg-purple-100 text-purple-700'
};

export const moodNames: Record<Track['mood_type'], string> = {
  focus: 'Фокус',
  energy: 'Энергичность',
  calm: 'Спокойствие',
  motivation: 'Мотивация',
  relax: 'Релаксация'
};

export const getMoodInfo = (moodType: Track['mood_type']) => ({
  color: moodColors[moodType] || 'bg-gray-100 text-gray-700',
  name: moodNames[moodType] || moodType
});