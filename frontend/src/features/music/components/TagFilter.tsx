import React from 'react';
import type { Tag } from '@shared/types';

interface TagFilterProps {
  tags: Tag[];
  selectedTagId: number | null;
  onTagSelect: (tagId: number | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTagId, onTagSelect }) => {
  return (
    <div className="bg-surface rounded-2xl border border-white/10 p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3">Filter by tag</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTagSelect(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTagId === null
              ? 'bg-primary-600 text-app'
              : 'bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10'
          }`}
        >
          All
        </button>
        {tags.map(tag => (
          <button
            key={tag.id}
            onClick={() => onTagSelect(selectedTagId === tag.id ? null : tag.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedTagId === tag.id
                ? 'text-app'
                : 'text-slate-200 hover:opacity-90'
            }`}
            style={{
              backgroundColor: selectedTagId === tag.id ? tag.color : `${tag.color}33`,
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};
