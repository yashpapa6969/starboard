interface NewsSource {
  id: string | null;
  name: string;
}

export interface NewsArticle {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsArticle[];
}

const API_KEY = import.meta.env.VITE_NEWS_API_KEY || 'c1da4ff1f86743d0ad5b35dfac95cef4';
const BASE_URL = 'https://newsapi.org/v2';

const sanitizeArticles = (articles: NewsArticle[]): NewsArticle[] => {
  return articles.map(article => ({
    ...article,
    title: article.title?.replace(/"/g, '\\"') || '',
    description: article.description?.replace(/"/g, '\\"') || '',
    content: article.content?.replace(/"/g, '\\"') || ''
  }));
};

export const fetchTopHeadlines = async (query: string = '', country: string = 'us'): Promise<NewsArticle[]> => {
  try {
    // Build the URL with parameters
    const url = new URL(`${BASE_URL}/top-headlines`);
    url.searchParams.append('country', country);
    url.searchParams.append('apiKey', API_KEY);
    
    if (query) {
      url.searchParams.append('q', query);
    }

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    const data: NewsResponse = await response.json();
    return sanitizeArticles(data.articles);
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};

export const fetchTenantNews = async (): Promise<NewsArticle[]> => {
  // Keywords related to tenants
  const tenantKeywords = 'tenant OR rental OR housing OR apartment OR lease OR landlord OR renter';
  
  try {
    // Use the everything endpoint to search with more flexibility
    const url = new URL(`${BASE_URL}/everything`);
    url.searchParams.append('q', tenantKeywords);
    url.searchParams.append('language', 'en');
    url.searchParams.append('sortBy', 'publishedAt');
    url.searchParams.append('pageSize', '25');
    url.searchParams.append('apiKey', API_KEY);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Failed to fetch tenant news: ${response.statusText}`);
    }

    const data: NewsResponse = await response.json();
    console.log(data.articles);
 
    
    try {
    } catch (parseError) {
      console.error('Error parsing JSON response:', parseError);
      // Fallback to an empty response
    }
    
    return sanitizeArticles(data.articles || []);
  } catch (error) {
    console.error('Error fetching tenant news:', error);
    return [];
  }
};

export const filterNewsByRelevance = (articles: NewsArticle[], threshold: number = 0.6): NewsArticle[] => {
  // Keywords to match tenant-related content
  const keywords = [
    'tenant', 'rental', 'housing', 'apartment', 'lease', 'landlord', 'renter',
    'eviction', 'property', 'real estate', 'rent', 'mortgage', 'residential',
    'housing market', 'home', 'building', 'occupant', 'residence', 'apartment complex'
  ];
  
  return articles.filter(article => {
    // Count how many keywords appear in the title and description
    const titleAndDesc = `${article.title} ${article.description || ''}`.toLowerCase();
    const matchCount = keywords.reduce((count, keyword) => {
      return titleAndDesc.includes(keyword.toLowerCase()) ? count + 1 : count;
    }, 0);
    
    // Calculate relevance score
    const relevanceScore = matchCount / keywords.length;
    return relevanceScore >= threshold;
  });
}; 