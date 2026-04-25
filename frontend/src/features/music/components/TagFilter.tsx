import React from 'react';
import type { Tag } from '@shared/types';

interface TagFilterProps {
  tags: Tag[];
  selectedTagId: number | null;
  onTagSelect: (tagId: number | null) => void;
}

export const TagFilter: React.FC<TagFilterProps> = ({ tags, selectedTagId, onTagSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by tag</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTagSelect(null)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTagId === null
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                ? 'text-white'
                : 'text-gray-700 hover:opacity-80'
            }`}
            style={{
              backgroundColor: selectedTagId === tag.id ? tag.color : `${tag.color}20`,
            }}
          >
            {tag.name}
          </button>
        ))}
      </div>
    </div>
  );
};
