import React from 'react';
import type { Tag } from '@shared/types';

interface TagSelectorProps {
  tags: Tag[];
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
}

export const TagSelector: React.FC<TagSelectorProps> = ({ tags, selectedTagIds, onChange }) => {
  const handleToggle = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onChange(selectedTagIds.filter(id => id !== tagId));
    } else {
      onChange([...selectedTagIds, tagId]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map(tag => (
        <button
          key={tag.id}
          type="button"
          onClick={() => handleToggle(tag.id)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selectedTagIds.includes(tag.id)
              ? 'text-app'
              : 'text-slate-200 hover:opacity-90'
          }`}
          style={{
            backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : `${tag.color}33`,
          }}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
};
