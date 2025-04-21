import React, { useState, useEffect } from 'react';
import { fetchTenantNews, fetchTopHeadlines, filterNewsByRelevance, NewsArticle } from '../../services/newsApi';
import NewsFilter from './NewsFilter';
import NewsGrid from './NewsGrid';

// Mapping categories to search keywords
const categoryKeywords: Record<string, string> = {
  'All': '',
  'Residential': 'residential OR apartment OR home OR tenant',
  'Commercial': 'commercial OR office OR retail OR business property',
  'Legal': 'legal OR law OR regulation OR eviction OR tenant rights',
  'Market Trends': 'market OR trends OR prices OR real estate market OR housing market',
  'Property Management': 'property management OR landlord OR maintenance OR amenities'
};

const NewsDashboard: React.FC = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [error, setError] = useState<string | null>(null);

  // Fetch news on component mount
  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        // First try to fetch tenant-specific news
        let fetchedArticles = await fetchTenantNews();
        
        // If tenant news API fails or returns no results, fallback to top headlines
        if (fetchedArticles.length === 0) {
          fetchedArticles = await fetchTopHeadlines('tenant OR housing OR property');
        }
        
        // Filter for tenant relevance
        
        setArticles(fetchedArticles);
        setFilteredArticles(fetchedArticles);
      } catch (err) {
        setError('Failed to fetch news. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Tenant News Dashboard</h1>
          <p className="text-zinc-600 max-w-2xl mx-auto">
            Stay informed with the latest news and trends related to tenants, property management, and real estate markets.
          </p>
        </div>

        {error ? (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : (
          <NewsFilter
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            totalResults={filteredArticles.length}
          />
        )}

        <NewsGrid articles={filteredArticles} loading={loading} />
        
        <div className="mt-12 text-center text-sm text-zinc-500">
          <p>Data provided by <a href="https://newsapi.org" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline">NewsAPI</a></p>
        </div>
      </div>
    </div>
  );
};

export default NewsDashboard; 