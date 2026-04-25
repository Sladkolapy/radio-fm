import React from 'react';
import { cn } from '@shared/utils/cn';
import { MoodSelector } from '@features/music/components/MoodSelector';
import { Button } from '@shared/ui/Button';

interface MusicLayoutProps {
  children: React.ReactNode;
  className?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

export const MusicLayout: React.FC<MusicLayoutProps> = ({
  children,
  className,
  showBackButton = false,
  onBack
}) => {
  return (
    <div className={cn('min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 p-4 md:p-8', className)}>
      <div className="max-w-6xl mx-auto">
        {showBackButton && onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Library
          </button>
        )}

        {children}
      </div>
    </div>
  );
};