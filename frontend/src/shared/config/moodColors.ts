import type { Track } from '@shared/types';

export const moodColors: Record<Track['mood_type'], string> = {
  focus: 'bg-sky-500/20 text-sky-300',
  energy: 'bg-orange-500/20 text-orange-300',
  calm: 'bg-emerald-500/20 text-emerald-300',
  motivation: 'bg-red-500/20 text-red-300',
  relax: 'bg-violet-500/20 text-violet-300'
};

export const moodNames: Record<Track['mood_type'], string> = {
  focus: 'Фокус',
  energy: 'Энергичность',
  calm: 'Спокойствие',
  motivation: 'Мотивация',
  relax: 'Релаксация'
};

export const getMoodInfo = (moodType: Track['mood_type']) => ({
  color: moodColors[moodType] || 'bg-white/10 text-slate-300',
  name: moodNames[moodType] || moodType
});
