import React from 'react';
import { cn } from '@shared/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className,
  id,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-4 py-2 border rounded-lg bg-surface text-white placeholder:text-slate-500 transition-colors',
          'focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
          error
            ? 'border-red-500/80 focus:ring-red-500 focus:border-red-500'
            : 'border-white/10',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
    </div>
  );
};
