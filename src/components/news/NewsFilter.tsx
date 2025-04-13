import React from 'react';

interface NewsFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  totalResults: number;
}

const NewsFilter: React.FC<NewsFilterProps> = ({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  totalResults
}) => {
  const categories = [
    'All',
    'Residential',
    'Commercial',
    'Legal',
    'Market Trends',
    'Property Management'
  ];

  return (
    <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-gray-100">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-1">News Dashboard</h2>
          <p className="text-sm text-zinc-500">
            {totalResults > 0 
              ? `Found ${totalResults} articles about tenant-related topics`
              : 'Search for tenant-related news'}
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tenant news..."
            className="pl-10 pr-4 py-2 w-full md:w-64 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-accent-blue-light focus:border-transparent"
          />
        </div>
      </div>

      <div className="mt-5 border-t border-gray-100 pt-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-accent-blue text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewsFilter; 