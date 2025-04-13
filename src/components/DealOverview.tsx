"use client";
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { fetchTenantNews, NewsArticle } from "../services/newsApi";

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}

const EnhancedMetricCard: React.FC<MetricCardProps> = ({ icon, label, value, className = "" }) => (
  <div
    className={`h-auto w-full bg-white rounded-md p-4 flex items-center gap-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow ${className}`}
  >
    <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-50 rounded-md">
      <div className="size-6 relative overflow-hidden">
        {icon}
      </div>
    </div>
    <div className="flex flex-col">
      <div className="text-zinc-500 text-xs font-medium">{label}</div>
      <div className="text-black text-lg sm:text-xl font-semibold truncate">{value}</div>
    </div>
  </div>
);

interface NavigationLinkProps {
  children: React.ReactNode;
}

const NavigationLink: React.FC<NavigationLinkProps> = ({ children }) => (
  <button className="text-sm leading-5 cursor-pointer text-zinc-500 hover:text-zinc-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-500 rounded">
    {children}
  </button>
);

interface PropertyCardProps {
  image: string;
  address: string;
  details: Record<string, string>;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ image, address, details }) => (
  <div className="flex gap-6 p-5 rounded-xl hover:bg-gray-50 transition-all duration-200 hover:shadow-md border border-transparent hover:border-gray-100 max-sm:flex-col">
    <div className="relative overflow-hidden rounded-xl group">
      <img
        src={image}
        alt={address}
        className="h-[140px] w-[161px] object-cover max-sm:w-full max-sm:h-auto"
      />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
    </div>
    <div className="flex flex-col gap-2">
      <div className="font-medium text-black">
        {address}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(details).map(([key, value]) => (
          <React.Fragment key={key}>
            <span className="font-medium text-zinc-950">
              {key}:
            </span>
            <span className="text-zinc-500">
              {value}
            </span>
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

const NewsCard: React.FC<{ article: NewsArticle }> = ({ article }) => {
  const { title, description, url, urlToImage, publishedAt, source } = article;
  
  const formattedDate = new Date(publishedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  const fallbackImage = 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80';

  return (
    <a 
      href={url}
      target="_blank" 
      rel="noopener noreferrer"
      className="flex flex-col h-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white border border-gray-100"
    >
      <div className="relative h-40 overflow-hidden">
        <img 
          src={urlToImage || fallbackImage} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="flex flex-col flex-grow p-4">
        <h3 className="mb-2 text-sm font-semibold text-zinc-900 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-xs text-zinc-600 mb-3 line-clamp-2">
          {description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mt-auto text-xs text-zinc-500">
          <span>{source.name}</span>
          <span>{formattedDate}</span>
        </div>
      </div>
    </a>
  );
};

const NewsCarousel: React.FC<{ articles: NewsArticle[], loading: boolean }> = ({ articles, loading }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = articles.length;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-md p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-zinc-900">Latest Tenant News</h3>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full bg-gray-200 animate-pulse">&nbsp;&nbsp;&nbsp;</button>
            <button className="p-2 rounded-full bg-gray-200 animate-pulse">&nbsp;&nbsp;&nbsp;</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl overflow-hidden shadow-md p-8 text-center">
        <p className="text-gray-500">No news articles found. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-xl overflow-hidden shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-zinc-900">Latest Tenant News</h3>
        {articles.length > 3 && (
          <div className="flex space-x-2">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Previous slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Next slide"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {articles.slice(currentSlide, currentSlide + 3).map((article, index) => (
          <a 
            key={index} 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col h-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-all duration-300 bg-white border border-gray-100"
          >
            <div className="relative h-40 overflow-hidden">
              <img 
                src={article.urlToImage || 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80'} 
                alt={article.title} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80';
                }}
              />
            </div>
            
            <div className="flex flex-col flex-grow p-4">
              <h3 className="mb-2 text-sm font-semibold text-zinc-900 line-clamp-2">
                {article.title}
              </h3>
              
              <p className="text-xs text-zinc-600 mb-3 line-clamp-2">
                {article.description || 'No description available'}
              </p>
              
              <div className="flex items-center justify-between mt-auto text-xs text-zinc-500">
                <span>{article.source.name}</span>
                <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
      
      {articles.length > 3 && (
        <div className="flex justify-center mt-4 gap-1">
          {Array.from({ length: Math.ceil(articles.length / 3) }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2 h-2 rounded-full ${Math.floor(currentSlide / 3) === idx ? 'bg-zinc-800' : 'bg-zinc-300'}`}
              onClick={() => setCurrentSlide(idx * 3)}
              aria-label={`Go to slide group ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const moreProperties = [
  {
    image: "https://images.unsplash.com/photo-1554435493-93422e8d5ede?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
    address: "123 Main Street, New York, NY",
    details: {
      Type: "Commercial",
      Size: "245,000 sqft",
      Price: "$125M",
      Cap: "4.8%"
    }
  },
  {
    image: "https://images.unsplash.com/photo-1577979749063-251d449edc81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
    address: "456 Market Ave, Boston, MA",
    details: {
      Type: "Industrial",
      Size: "185,000 sqft",
      Price: "$87M",
      Cap: "5.2%"
    }
  },
  {
    image: "https://images.unsplash.com/photo-1565610222535-a985fb96130a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
    address: "789 Tech Park, Austin, TX",
    details: {
      Type: "Office",
      Size: "118,000 sqft",
      Price: "$65M",
      Cap: "5.7%"
    }
  }
];

function DealOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getNews = async () => {
      try {
        const articles = await fetchTenantNews();
        setNewsArticles(articles.slice(0, 5)); // Get first 5 articles
      } catch (error) {
        console.error("Error fetching news:", error);
      } finally {
        setLoading(false);
      }
    };

    getNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <link
        rel="stylesheet"
        href="https://unpkg.com/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        crossOrigin="anonymous"
      />
      <main className="max-w-[1400px] mx-auto">
        <div className="flex flex-col px-10 pt-6 pb-10 m-5 rounded-2xl shadow-xl bg-white border border-gray-100 backdrop-blur-sm backdrop-filter max-sm:px-4 max-sm:pt-4 max-sm:pb-6 max-sm:m-2.5 transition-all duration-300 hover:shadow-2xl">
          {/* Back Button */}
          <div className="px-2.5 py-0 mb-2.5">
            <button
              className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="Go back"
            >
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    "<svg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M19 12H5M12 19L5 12L12 5' stroke='black' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'></path></svg>",
                }}
              />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex justify-between items-center px-4 py-3 h-auto md:h-16 border-b border-gray-100 flex-wrap gap-4">
            <div
              className="flex gap-6 max-md:w-full max-md:overflow-x-auto max-md:pb-2 md:pb-0"
              role="tablist"
            >
              {["Deal Overview", "Workshop", "Pipeline", "Settings"].map(
                (item) => (
                  <NavigationLink key={item}>{item}</NavigationLink>
                ),
              )}
            </div>
            <div className="flex gap-4 items-center max-sm:flex-1">
              <div className="flex gap-4 items-center">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/a523836975127c6a1b39ceef84484c0254945b6a?placeholderIfAbsent=true"
                  alt="Avatar"
                  className="w-8 h-8 rounded-full"
                />
                <div className="px-3 py-1 w-80 text-sm bg-white border border-solid border-zinc-200 rounded-[12px_12px_12px_0] text-zinc-500 hover:border-zinc-300 transition-colors duration-200">
                  Ask me anything!
                </div>
              </div>
              <img
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/a523836975127c6a1b39ceef84484c0254945b6a?placeholderIfAbsent=true"
                alt="Logo"
                className="h-[46px] w-[74px]"
              />
            </div>
          </nav>

          {/* Header */}
          <header className="flex justify-between items-center px-4 py-0 h-[68px]">
            <h1 className="text-2xl font-bold tracking-tight leading-8 text-zinc-950">
              Deal Overview
            </h1>
            <div className="flex flex-col gap-1 items-center">
              <div className="text-lg text-zinc-950">Underwriting Model</div>
              <button className="flex gap-1 items-center px-4 py-2 text-sm rounded-md bg-zinc-100 hover:bg-zinc-200 transition-colors duration-200 text-slate-900">
                <span>Industrial.Template.v2.4.xlsx</span>
                <div
                  dangerouslySetInnerHTML={{
                    __html:
                      "<svg width='13' height='12' viewBox='0 0 13 12' fill='none'><path d='M3.5 4.5L6.5 7.5L9.5 4.5' stroke='black' stroke-linecap='round' stroke-linejoin='round'></path></svg>",
                  }}
                />
              </button>
            </div>
          </header>

          <div className="mx-0 my-2.5 h-px bg-zinc-200" />

          {/* News Carousel */}
          <div className="px-4 py-4">
            <NewsCarousel articles={newsArticles} loading={loading} />
          </div>

          <div className="mx-0 my-2.5 h-px bg-zinc-200" />

          {/* Main Content */}
          <div className="flex flex-col gap-4">
            {/* Property Overview */}
            <section className="flex gap-5 px-2.5 py-2 max-md:flex-col">
              <div className="relative group">
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/6025ad1229fd1938a28f6027e6a677ae6db97017?placeholderIfAbsent=true"
                  alt="Property"
                  className="rounded-2xl h-[187px] w-[333px] object-cover max-sm:w-full max-sm:h-auto"
                />
                <div className="absolute left-2/4 text-xs text-black bg-white/80 px-3 py-1 rounded-full -translate-x-2/4 bottom-[5px] group-hover:bg-white transition-colors duration-200">
                  Click for Google Street View
                </div>
              </div>

              <div className="flex-1">
                <div className="flex justify-between px-8 py-4 max-sm:flex-col max-sm:gap-5">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-xl font-semibold text-black">
                      280 Richards, Brooklyn, NY
                    </h2>
                    <div className="text-sm text-zinc-500">
                      Date Uploaded: 11/06/2024
                    </div>
                    <div className="text-sm text-zinc-500">Warehouse</div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <button className="px-8 py-2.5 text-sm font-medium rounded-lg cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-neutral-50 transition-all duration-200 hover:shadow-lg active:transform active:scale-95">
                      Export to Excel
                    </button>
                    <button className="px-8 py-2 text-sm rounded-md cursor-pointer bg-zinc-900 hover:bg-zinc-800 text-neutral-50 transition-colors duration-200">
                      Generate PowerPoint
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4 md:px-8 py-4">
                  {[
                    { label: "Seller", value: "Thor Equities" },
                    { label: "Guidance Price", value: "$143,000,000" },
                    { label: "Guidance Price PSF", value: "$23.92" },
                    { label: "Cap Rate", value: "5.0%" },
                    { label: "Property Size", value: "312,000 sqft" },
                    { label: "Land Area", value: "16 acres" },
                  ].map((metric, index) => (
                    <div key={index} className="flex flex-col gap-1 items-end">
                      <div className="text-sm text-zinc-500">
                        {metric.label}
                      </div>
                      <div className="text-sm font-medium text-black">
                        {metric.value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <div className="mx-0 my-2.5 h-px bg-zinc-200" />

            {/* Enhanced Deal Summary and Insights */}
            <div className="self-stretch h-auto relative px-6 pt-2">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Deal Summary */}
                <div className="flex-1">
                  <div className="w-36 pr-5 pb-4 inline-flex justify-start items-center">
                    <div className="text-zinc-500 text-base font-medium font-['Inter'] leading-normal">Deal Summary</div>
                  </div>
                  <div className="text-black text-sm font-normal font-['Inter'] leading-normal">
                    280 Richards, fully leased to Amazon, aligns with HUSPP's
                    strategy of acquiring prime logistics assets in Brooklyn's
                    high-demand Red Hook submarket. With 13 years remaining on the
                    lease and 3% annual rent escalations, it offers stable,
                    long-term cash flow. While single-tenant exposure is a risk,
                    Amazon's investment-grade rating and renewal options enhance
                    its resilience, making it a strong addition to HUSPP's
                    portfolio.
                  </div>
                </div>

                {/* Asset-Level Data (Right Column) */}
                <div className="lg:w-[550px]">
                  <div className="pb-4 inline-flex justify-start items-center">
                    <div className="text-zinc-500 text-base font-medium font-['Inter'] leading-normal">Asset-Level Data</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-1">
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="4" y="2" width="16" height="20" rx="2" stroke="black" stroke-width="2"/>
                                <line x1="9" y1="6" x2="15" y2="6" stroke="black" stroke-width="2"/>
                                <line x1="9" y1="10" x2="15" y2="10" stroke="black" stroke-width="2"/>
                                <line x1="9" y1="14" x2="15" y2="14" stroke="black" stroke-width="2"/>
                                <line x1="9" y1="18" x2="12" y2="18" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Clear Heights"
                      value="36'"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="5" width="20" height="3" stroke="black" stroke-width="2"/>
                                <rect x="2" y="11" width="20" height="3" stroke="black" stroke-width="2"/>
                                <rect x="2" y="17" width="20" height="3" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Tenant"
                      value="Amazon"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="20" height="2" rx="1" stroke="black" stroke-width="2"/>
                                <rect x="2" y="12" width="20" height="2" rx="1" stroke="black" stroke-width="2"/>
                                <rect x="2" y="7" width="20" height="2" rx="1" stroke="black" stroke-width="2"/>
                                <rect x="2" y="17" width="20" height="2" rx="1" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Column Spacing"
                      value="63' X 54'"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M21 3H3C1.89543 3 1 3.89543 1 5V19C1 20.1046 1.89543 21 3 21H21C22.1046 21 23 20.1046 23 19V5C23 3.89543 22.1046 3 21 3Z" stroke="black" stroke-width="2"/>
                                <path d="M1 9H23" stroke="black" stroke-width="2"/>
                                <path d="M1 15H23" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Seaward Area"
                      value="357,151 sqft"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="7" width="20" height="2" rx="1" stroke="black" stroke-width="2"/>
                                <circle cx="4" cy="14" r="2" stroke="black" stroke-width="2"/>
                                <circle cx="14" cy="14" r="2" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Parking Spaces"
                      value="393"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="12" cy="6" r="4" stroke="black" stroke-width="2"/>
                                <path d="M19 12L12 22L5 12" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Year Built"
                      value="2021"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="5" width="3" height="3" rx="1.5" stroke="black" stroke-width="2"/>
                                <rect x="3" y="15" width="5" height="5" rx="2.5" stroke="black" stroke-width="2"/>
                                <rect x="14" y="9" width="2" height="8" rx="1" stroke="black" stroke-width="2"/>
                                <path d="M14 17V17.01" stroke="black" stroke-width="2" stroke-linecap="round"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="# of Dock Doors"
                      value="28"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="2" width="18" height="20" rx="2" stroke="black" stroke-width="2"/>
                                <path d="M9 12L12 15L15 12" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Occupancy Rate"
                      value="100%"
                    />
                  </div>
                </div>
              </div>
              
              {/* Personalized Insights */}
              <div className="mt-8">
                <div className="w-44 pr-5 pb-4 inline-flex justify-start items-center">
                  <div className="text-zinc-500 text-base font-medium font-['Inter'] leading-normal">Personalized Insights</div>
                </div>
                <div className="text-black text-sm font-normal font-['Inter'] leading-normal space-y-2">
                  <p>
                    Jake Klein viewed this deal in 2019, but decided not to proceed due to 
                    <a href="#" className="text-blue-700 underline mx-1 hover:text-blue-800">
                      lack of potential upside
                    </a>.
                  </p>
                  <p>
                    On 10/19/2021, your firm bid on 
                    <a href="#" className="text-blue-700 underline mx-1 hover:text-blue-800">
                      55 Bay St, Brooklyn, NY 11231
                    </a>, 
                    a larger site also occupied by Amazon 0.5 miles away. 
                    <a href="#" className="text-blue-700 underline mx-1 hover:text-blue-800">
                      Brookfield won the deal for $45M
                    </a>, 
                    cap rates in the area have compressed 45bps since then.
                  </p>
                  <p>
                    On 01/19/2025, Tom, VP of Research, noted in the Investment Committee meeting that congestion pricing has driven 
                    <a href="#" className="text-blue-700 underline mx-1 hover:text-blue-800">
                      renewed demand for infill industrial in Brooklyn
                    </a>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mx-0 my-2.5 h-px bg-zinc-200" />

            {/* Market and Financial Metrics - More responsive design */}
            <div className="w-full px-4 sm:px-6 mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
                {/* Projected Financial Metrics */}
                <div className="w-full">
                  <h3 className="text-zinc-500 text-base font-medium mb-4">Projected Financial Metrics</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="6" width="20" height="3" rx="1" stroke="black" stroke-width="2"/>
                                <circle cx="10" cy="10" r="1" stroke="black" stroke-width="2"/>
                                <path d="M6 12L10 12" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="IRR"
                      value="13.9%"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="16" height="4" stroke="black" stroke-width="2"/>
                                <line x1="7" y1="16" x2="7" y2="11" stroke="black" stroke-width="2"/>
                                <line x1="7" y1="16" x2="7" y2="6" stroke="black" stroke-width="2"/>
                                <line x1="7" y1="16" x2="15" y2="16" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Equity Multiple"
                      value="2.3x"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="3" width="20" height="5" rx="1" stroke="black" stroke-width="2"/>
                                <rect x="12" y="2" width="5" height="2" rx="1" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Return on Equity"
                      value="18.5%"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="6" width="20" height="3" rx="1" stroke="black" stroke-width="2"/>
                                <circle cx="10" cy="10" r="1" stroke="black" stroke-width="2"/>
                                <path d="M6 12L10 12" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Return on Cost"
                      value="19.2%"
                    />
                  </div>
                </div>

                {/* Key Assumptions */}
                <div className="w-full">
                  <h3 className="text-zinc-500 text-base font-medium mb-4">Key Assumptions</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="5" width="3.5" height="3.5" rx="1" stroke="black" stroke-width="2"/>
                                <path d="M15 15L8 9" stroke="black" stroke-width="2"/>
                                <rect x="15" y="5" width="2" height="3.5" rx="1" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Exit Price"
                      value="$195,000,000"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="5" y="5" width="3.5" height="3.5" rx="1" stroke="black" stroke-width="2"/>
                                <rect x="4" y="4" width="5" height="5" rx="1" stroke="black" stroke-width="2"/>
                                <rect x="15" y="15" width="5" height="5" rx="1" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Exit Cap Rate"
                      value="5.0%"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="16" height="4" stroke="black" stroke-width="2"/>
                                <line x1="7" y1="9" x2="15" y2="9" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Rental Growth"
                      value="3.5%"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="20" height="20" rx="2" stroke="black" stroke-width="2"/>
                                <line x1="7.5" y1="6" x2="7.5" y2="8" stroke="black" stroke-width="1.5"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Hold Period"
                      value="16 Years"
                    />
                  </div>
                </div>

                {/* Market Analysis */}
                <div className="w-full">
                  <h3 className="text-zinc-500 text-base font-medium mb-4">Market Analysis</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H6V18H3V6Z" stroke="black" stroke-width="2"/>
                                <path d="M10 6H13V14H10V6Z" stroke="black" stroke-width="2"/>
                                <path d="M17 2H20V18H17V2Z" stroke="black" stroke-width="2"/>
                                <line x1="10" y1="6" x2="10" y2="10" stroke="black" stroke-width="2"/>
                                <line x1="10" y1="10" x2="10" y2="14" stroke="black" stroke-width="2"/>
                                <line x1="10" y1="14" x2="10" y2="18" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Nearest Urban Center"
                      value="Brooklyn, NY"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="16" height="4" stroke="black" stroke-width="2"/>
                                <line x1="7" y1="9" x2="15" y2="9" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Population Growth Rate"
                      value="1.2%"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="5" y="5" width="16" height="3.5" rx="1" stroke="black" stroke-width="2"/>
                                <circle cx="2" cy="9" r="1.5" stroke="black" stroke-width="1.5"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Median Household Income"
                      value="$76,912"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="9" cy="2" r="1.5" stroke="black" stroke-width="1.5"/>
                                <circle cx="16" cy="16" r="1.5" stroke="black" stroke-width="1.5"/>
                                <circle cx="2" cy="16" r="1.5" stroke="black" stroke-width="1.5"/>
                                <line x1="5" y1="12" x2="15" y2="12" stroke="black" stroke-width="1"/>
                                <line x1="12" y1="8" x2="12" y2="8" stroke="black" stroke-width="1"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Unemployment Rate"
                      value="7.4%"
                    />
                  </div>
                </div>

                {/* Lease Analysis */}
                <div className="w-full">
                  <h3 className="text-zinc-500 text-base font-medium mb-4">Lease Analysis</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="6" width="20" height="3" rx="1" stroke="black" stroke-width="2"/>
                                <circle cx="10" cy="10" r="1" stroke="black" stroke-width="2"/>
                                <path d="M6 12L10 12" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Rent PSF"
                      value="$24.40"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="2" y="2" width="20" height="20" rx="2" stroke="black" stroke-width="2"/>
                                <line x1="12" y1="6" x2="12" y2="8" stroke="black" stroke-width="1"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="WALT"
                      value="13 Yrs (Sep 37)"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="12" y1="5" x2="12" y2="15" stroke="black" stroke-width="2"/>
                                <line x1="5" y1="5" x2="12" y2="5" stroke="black" stroke-width="1.5"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Rent Escalations"
                      value="3%"
                    />
                    <EnhancedMetricCard
                      icon={
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect x="3" y="3" width="16" height="4" stroke="black" stroke-width="2"/>
                                <line x1="7" y1="9" x2="15" y2="9" stroke="black" stroke-width="2"/>
                              </svg>`,
                          }}
                        />
                      }
                      label="Mark-to-Market Opportunity"
                      value="30%+"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mx-0 my-8 h-px bg-zinc-200" />

            {/* Comparables Section - Fix layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Supply Pipeline */}
              <div className="w-full">
                <h3 className="text-black text-xl font-semibold mb-4">Supply Pipeline</h3>
                <div className="space-y-6">
                  {[
                    {
                      image:
                        "https://cdn.builder.io/api/v1/image/assets/TEMP/16cbe66abcc8d2ba92fadcc955a51ce43bbfcd3b?placeholderIfAbsent=true",
                      address: "640 Columbia",
                      details: {
                        Submarket: "Brooklyn",
                        "Delivery Date": "Jun-25",
                        Owner: "CBREI",
                        SF: "336,350",
                      },
                    },
                    {
                      image:
                        "https://cdn.builder.io/api/v1/image/assets/TEMP/12f4bc33609dbf419ad397db6178b547b0f57711?placeholderIfAbsent=true",
                      address: "WB Mason",
                      details: {
                        Submarket: "Bronx",
                        "Delivery Date": "May-25",
                        Owner: "Link Logistics",
                        SF: "150,000",
                      },
                    },
                  ].map((property, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3">
                          <img
                            src={property.image}
                            alt={property.address}
                            className="w-full h-40 sm:h-full object-cover"
                          />
                        </div>
                        <div className="sm:w-2/3 p-4">
                          <h4 className="text-lg font-semibold mb-3">{property.address}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(property.details).map(([key, value]) => (
                              <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="text-zinc-900 text-sm font-bold">{key}:</span>
                                <span className="text-zinc-700 text-sm">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sale Comparables */}
              <div className="w-full">
                <h3 className="text-black text-xl font-semibold mb-4">Sale Comparables</h3>
                <div className="grid grid-cols-1 gap-6">
                  {[
                    {
                      image: "https://cdn.builder.io/api/v1/image/assets/TEMP/abb4dec575f359e5b709e5716039eeca779fedeb?placeholderIfAbsent=true",
                      address: "1 Debaun Road",
                      details: {
                        Submarket: "Millstone, NJ",
                        SF: "132,930",
                        Owner: "Cabot",
                        Date: "Jun-24",
                        PP: "$41,903,580",
                        Tenant: "Berry Plastics"
                      },
                    },
                    {
                      image: "https://images.unsplash.com/photo-1565610222535-a985fb96130a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
                      address: "39 Edgeboro Road",
                      details: {
                        Submarket: "Millstone, NJ",
                        SF: "513,240",
                        Owner: "Blackstone",
                        Date: "Oct-23",
                        PP: "$165,776,520",
                        Tenant: "FedEx"
                      },
                    },
                    {
                      image: "https://images.unsplash.com/photo-1577979749063-251d449edc81?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
                      address: "Baylis 495 Business Park",
                      details: {
                        Submarket: "Melville, NY",
                        SF: "103,500",
                        Owner: "Betnal Green",
                        Date: "May-24",
                        PP: "$44,000,000",
                        Tenant: "Dr. Pepper"
                      },
                    },
                    {
                      image: "https://images.unsplash.com/photo-1554435493-93422e8d5ede?ixlib=rb-1.2.1&auto=format&fit=crop&w=1170&q=80",
                      address: "Terminal Logistics Center",
                      details: {
                        Submarket: "Queens, NY",
                        SF: "336,000",
                        Owner: "Goldman",
                        Date: "Mar-23",
                        PP: "$136,000,000",
                        Tenant: "Do & Co"
                      },
                    },
                  ].map((property, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3">
                          <img
                            src={property.image}
                            alt={property.address}
                            className="w-full h-40 sm:h-full object-cover"
                          />
                        </div>
                        <div className="sm:w-2/3 p-4">
                          <h4 className="text-lg font-semibold mb-3">{property.address}</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {Object.entries(property.details).map(([key, value]) => (
                              <div key={key} className="flex flex-col sm:flex-row sm:items-center gap-1">
                                <span className="text-zinc-900 text-sm font-bold">{key}:</span>
                                <span className="text-zinc-700 text-sm">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DealOverview; 