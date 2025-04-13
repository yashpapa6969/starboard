import React from 'react';
import { NewsArticle } from '../../services/newsApi';
import NewsCard from './NewsCard';

interface NewsGridProps {
  articles: NewsArticle[];
  loading: boolean;
}

const NewsGrid: React.FC<NewsGridProps> = ({ articles, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white shadow-md rounded-lg overflow-hidden h-[400px] animate-pulse">
            <div className="h-48 bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-3/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded" />
                <div className="h-3 bg-gray-200 rounded w-5/6" />
                <div className="h-3 bg-gray-200 rounded w-4/6" />
              </div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg p-10 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
        <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
      </div>
    );
  }

  // Featured article (first article)
  const featuredArticle = articles[0];
  // Rest of the articles
  const remainingArticles = articles.slice(1);

  return (
    <div className="space-y-6">
      {/* Featured Article */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/2">
            <img 
              className="h-64 w-full object-cover md:h-full" 
              src={featuredArticle.urlToImage || 'https://images.unsplash.com/photo-1554435493-93422e8d5ede?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80'} 
              alt={featuredArticle.title}
            />
          </div>
          <div className="p-6 md:p-8 md:w-1/2 flex flex-col">
            <div className="uppercase tracking-wide text-sm text-accent-blue font-semibold mb-1">
              Featured Story
            </div>
            <a 
              href={featuredArticle.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="block mt-1 text-xl font-semibold text-zinc-900 hover:text-accent-blue-light transition-colors duration-200"
            >
              {featuredArticle.title}
            </a>
            <p className="mt-3 text-zinc-600 text-sm leading-relaxed flex-grow">
              {featuredArticle.description || 'No description available'}
            </p>
            <div className="mt-6 flex items-center">
              <div className="flex-shrink-0">
                <span className="inline-block h-10 w-10 rounded-full bg-accent-blue-light text-white text-center leading-10">
                  {featuredArticle.source.name.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-zinc-900">
                  {featuredArticle.source.name}
                </p>
                <p className="text-xs text-zinc-500">
                  {new Date(featuredArticle.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Regular Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remainingArticles.map((article, index) => (
          <NewsCard key={`${article.title}-${index}`} article={article} />
        ))}
      </div>
    </div>
  );
};

export default NewsGrid; 