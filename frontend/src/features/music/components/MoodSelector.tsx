import React from 'react';
import { cn } from '@shared/utils/cn';

interface MoodOption {
  value: string;
  label: string;
  icon: string;
}

interface MoodSelectorProps {
  selectedMood: string;
  onMoodChange: (mood: string) => void;
  isCreating?: boolean;
}

const moodOptions: MoodOption[] = [
  { value: 'focus', label: 'Фокус', icon: '🎯' },
  { value: 'energy', label: 'Энергичность', icon: '⚡' },
  { value: 'calm', label: 'Спокойствие', icon: '🧘' },
  { value: 'motivation', label: 'Мотивация', icon: '🔥' },
  { value: 'relax', label: 'Релаксация', icon: '🌙' }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onMoodChange,
  isCreating = false
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {moodOptions.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onMoodChange(mood.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all duration-200',
            selectedMood === mood.value
              ? 'border-primary-500 bg-primary-50 text-primary-700'
              : 'border-gray-200 hover:border-primary-300 bg-white'
          )}
        >
          <span className="text-2xl">{mood.icon}</span>
          <span className="font-medium">{mood.label}</span>
        </button>
      ))}
    </div>
  );
};