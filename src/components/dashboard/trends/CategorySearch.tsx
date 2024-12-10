import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '../../ui/Button';

interface CategorySearchProps {
  onSearch: (category: string) => void;
  isLoading: boolean;
}

const POPULAR_CATEGORIES = [
  'Gaming',
  'Music',
  'Technology',
  'Education',
  'Entertainment',
  'Sports',
  'Fashion',
  'Cooking',
];

export function CategorySearch({ onSearch, isLoading }: CategorySearchProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSearch(searchQuery.trim());
    }
  };

  return (
    <div className="bg-gray-950/80 backdrop-blur-sm rounded-xl p-4 sm:p-6 mx-auto border border-white/10">
      <h2 className="text-lg sm:text-xl font-semibold mb-4">Search Categories</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a category or topic..."
            className="w-full px-4 py-2.5 bg-white/5 border border-gray-800 rounded-lg focus:ring-2 focus:ring-orange-500 pl-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        </div>

        <Button
          type="submit"
          disabled={!searchQuery.trim() || isLoading}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-400"
        >
          {isLoading ? 'Searching...' : 'Search Trends'}
        </Button>
      </form>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-400 mb-3">Popular Categories</h3>
        <div className="flex flex-wrap gap-2">
          {POPULAR_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => onSearch(category)}
              disabled={isLoading}
              className="px-3 py-1.5 text-sm bg-white/5 hover:bg-white/10 rounded-full transition-colors"
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
