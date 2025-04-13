import React from 'react';
import { NewsArticle } from '../../services/newsApi';
import { formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
}

const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const {
    title,
    description,
    url,
    urlToImage,
    publishedAt,
    source,
    author,
  } = article;

  const formattedDate = formatDistanceToNow(new Date(publishedAt), { addSuffix: true });
  
  // Fallback image if urlToImage is null or invalid
  const fallbackImage = 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80';

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer" 
      className="group flex flex-col h-full overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300 bg-white border border-gray-100"
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={urlToImage || fallbackImage}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-70" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="inline-block px-2 py-1 mb-2 text-xs font-medium text-white bg-accent-blue rounded-md">
            {source.name}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <h3 className="mb-2 text-lg font-semibold text-zinc-900 line-clamp-2 group-hover:text-accent-blue-light transition-colors duration-200">
          {title}
        </h3>
        
        <p className="text-sm text-zinc-600 mb-4 line-clamp-3 flex-grow">
          {description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mt-auto text-xs text-zinc-500">
          <span>
            {author ? `${author} • ` : ''}{formattedDate}
          </span>
          <span className="inline-flex items-center font-medium text-accent-blue-light group-hover:underline">
            Read more
            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        </div>
      </div>
    </a>
  );
};

export default NewsCard; 