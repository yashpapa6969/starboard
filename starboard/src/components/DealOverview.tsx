import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { fetchTenantNews, NewsArticle } from "../services/newsApi";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { pdfService, OcrResult } from "../services/pdfService";
import { toast } from 'react-hot-toast';

interface MetricCardProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
  className?: string;
  isRisk?: boolean;
}

const EnhancedMetricCard: React.FC<MetricCardProps> = ({ icon, label, value, className = "", isRisk = false }) => (
  <div className={`h-auto w-full bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl p-4 flex items-center gap-4 border ${isRisk ? 'border-red-200 shadow-red-100' : 'border-blue-100'} shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${className} break-inside-avoid`}>
    <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white rounded-lg shadow-sm">
      <div className="size-7 relative overflow-hidden">
        {icon}
      </div>
    </div>
    <div className="flex flex-col min-w-0">
      <div className="text-zinc-500 text-xs font-medium uppercase tracking-wider truncate">{label}</div>
      <div className={`text-zinc-900 text-lg sm:text-xl font-bold truncate ${isRisk ? 'text-red-600' : ''}`}>{value}</div>
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
  <div className="flex gap-6 p-5 rounded-xl hover:bg-blue-50 transition-all duration-300 hover:shadow-lg border border-transparent hover:border-blue-200 max-sm:flex-col group break-inside-avoid">
    <div className="relative overflow-hidden rounded-xl flex-shrink-0">
      <img
        src={image}
        alt={address}
        className="h-[140px] w-[161px] object-cover max-sm:w-full max-sm:h-auto transform transition-all duration-500 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
    </div>
    <div className="flex flex-col gap-2 min-w-0">
      <div className="font-semibold text-black truncate">
        {address}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(details).map(([key, value]) => (
          <React.Fragment key={key}>
            <span className="font-medium text-zinc-950 truncate">
              {key}:
            </span>
            <span className="text-zinc-500 truncate">
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
      className="flex flex-col h-full overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 bg-white group"
    >
      <div className="relative h-52 overflow-hidden">
        <img 
          src={urlToImage || fallbackImage} 
          alt={title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = fallbackImage;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-50" />
        <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full">
          {source.name}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow p-5">
        <h3 className="mb-2 text-base font-bold text-zinc-900 line-clamp-2">
          {title}
        </h3>
        
        <p className="text-sm text-zinc-600 mb-4 line-clamp-2">
          {description || 'No description available'}
        </p>
        
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
          <span className="text-xs text-zinc-500">{formattedDate}</span>
          <span className="inline-flex items-center text-sm font-medium text-blue-600">
            Read more
            <svg className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (articles.length > 3) {
        nextSlide();
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [articles.length, currentSlide]);

  if (loading) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl overflow-hidden shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg mr-3 animate-pulse"></div>
            <h3 className="text-xl font-bold text-zinc-900">Latest Market News</h3>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 rounded-full bg-gray-200 animate-pulse">&nbsp;&nbsp;&nbsp;</button>
            <button className="p-2 rounded-full bg-gray-200 animate-pulse">&nbsp;&nbsp;&nbsp;</button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl overflow-hidden shadow-sm">
              <div className="bg-gray-200 h-48 rounded-t-lg"></div>
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mt-4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl overflow-hidden shadow-md p-8 text-center">
        <p className="text-gray-500">No news articles found. Try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl overflow-hidden shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 20H5V4H19V20Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 8H8V12H16V8Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 14H8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 17H8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-zinc-900">Latest Market News</h3>
        </div>
        {articles.length > 3 && (
          <div className="flex space-x-3">
            <button 
              onClick={prevSlide}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"
              aria-label="Previous slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={nextSlide}
              className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition-colors border border-gray-100"
              aria-label="Next slide"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="#4B5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.slice(currentSlide, currentSlide + 3).map((article, index) => (
          <NewsCard key={index} article={article} />
        ))}
      </div>
      
      {articles.length > 3 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(articles.length / 3) }).map((_, idx) => (
            <button
              key={idx}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${Math.floor(currentSlide / 3) === idx ? 'bg-blue-500 w-5' : 'bg-gray-300 hover:bg-gray-400'}`}
              onClick={() => setCurrentSlide(idx * 3)}
              aria-label={`Go to slide group ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const STATIC_NEWS_DATA: NewsArticle[] = [
  {
    source: {
      id: null,
      name: "Wnd.com"
    },
    author: "Laura Hollis",
    title: "Hands Off protesters dont know what theyre protesting",
    description: "I wont honk for democracy. We are a constitutional republic; Ill honk for that",
    url: "https://www.wnd.com/2025/04/hands-off-protesters-dont-know-what-theyre-protesting/",
    urlToImage: "https://www.wnd.com/wp-content/uploads/2025/04/elon-musk-donald-trump-protesters-kakistocracy-sign-hands-off-jpg.jpg",
    publishedAt: "2025-04-12T21:48:02Z",
    content: "In cities big and small all over the country last week, people opposed to the policies of the Trump administration decided to participate in nationally coordinated, so-called Hands Off protests..."
  },
  {
    source: {
      id: "abc-news-au",
      name: "ABC News (AU)"
    },
    author: "Thomas Kelsall",
    title: "A sore point: Adelaides long wait for a purpose-built concert hall",
    description: "Adelaides culture of music has garnered global recognition, but some arts leaders say theres a missing piece of the puzzle.",
    url: "https://www.abc.net.au/news/2025-04-13/adelaide-concert-hall-proposals/105158400",
    urlToImage: "https://live-production.wcms.abc-cdn.net.au/c9f450919857f9057e65a7a68a976197",
    publishedAt: "2025-04-12T21:39:11Z",
    content: "Its a little bit heartbreaking when you have an international artist that comes to Australia and just announces three concert dates and none of them are Adelaide..."
  },
  {
    source: {
      id: null,
      name: "Biztoc.com"
    },
    author: "zerohedge.com",
    title: "US Homeowners Must Earn $50,000 More Than Renters To Cover Shelter Payments: Report",
    description: "American homeowners need to earn about $50,000 more than the typical renter to be able to afford monthly mortgage payments...",
    url: "https://biztoc.com/x/bff40e81cbedb00b",
    urlToImage: "https://biztoc.com/cdn/bff40e81cbedb00b_s.webp",
    publishedAt: "2025-04-12T21:34:20Z",
    content: "US Homeowners Must Earn $50,000 More Than Renters To Cover Shelter Payments: Report..."
  },
  {
    source: {
      id: "financial-post",
      name: "Financial Post"
    },
    author: "Bloomberg News",
    title: "Central Banks Prepare First G-7 Responses to US Chaos",
    description: "The first Group of Seven monetary policy decisions since President Donald Trumps trade war unleashed global market turmoil may prompt diverging responses...",
    url: "https://financialpost.com/pmn/business-pmn/central-banks-prepare-first-g-7-responses-to-us-chaos",
    urlToImage: "https://smartcdn.gprod.postmedia.digital/financialpost/wp-content/uploads/2025/04/peru-growth.jpg",
    publishedAt: "2025-04-12T20:28:04Z",
    content: "Fed Chair Jerome Powell will offer his assessment of the economy in a speech on Wednesday..."
  },
  {
    source: {
      id: null,
      name: "TheJournal.ie"
    },
    author: "Daragh Brophy",
    title: "Family spent eleven years living in converted workshed in Dublin back garden",
    description: "The family moved into a new home recently but still feel cabinised after more than a decade living in the tiny space.",
    url: "https://www.thejournal.ie/family-eleven-years-cabin-dublin-garden-6657078-Apr2025/",
    urlToImage: "https://img2.thejournal.ie/article/6657078/river/?height=400&version=6657111",
    publishedAt: "2025-04-12T20:00:10Z",
    content: "NEARLY A YEAR after moving into their council home, Keith and Sinead still feel, as they describe it, cabinised..."
  }
];

interface OcrData {
  documentInfo: {
    dateUploaded: string;
    documentType: string;
    sourceFileName: string;
  };
  leaseInfo: {
    leasePercentage: number;
    tenantName: string;
    capRatePercent: number | null;
    leaseExpirationDate: string;
    leaseTermRemainingYears: number;
    rentEscalations: string;
  };
  offeringDetails: {
    brokerageFirm: string;
    guidancePriceUSD: number;
    guidancePricePSF: number | null;
    offeringType: string;
    sellerName: string | null;
  };
  propertyInfo: {
    address: {
      city: string;
      state: string;
      street: string;
      submarket: string;
      zipCode: string | null;
    };
    propertyName: string;
    propertySizeSF: number;
    propertyType: string;
    constructionStatus: string;
    landAreaAcres: number;
    yearBuilt: number;
  };
  brokerContacts: Array<{
    email: string;
    name: string;
    phone: string;
    title: string;
  }>;
  financingInfo: {
    isFinancingAssumable: boolean;
    assumableInterestRatePercent: number;
    assumableLoanAmountUSD: number;
    loanMaturityDate: string;
  };
  summaryPoints: {
    investmentHighlights: string[];
    riskFactors: string[];
  };
}

function DealOverview() {
  const [activeTab, setActiveTab] = useState("overview");
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResponse, setUploadResponse] = useState<any>(null);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [ocrData, setOcrData] = useState<OcrData | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pdfContentRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Remove the useEffect and fetching logic
  const newsArticles = STATIC_NEWS_DATA;
  const loading = false;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingPdf(true);
    setUploadProgress(0);
    setUploadResponse(null);
    setOcrData(null);

    try {
      // Get the upload URL
      setUploadProgress(10);
      const urlResponse = await pdfService.getUploadUrl();
      if (!urlResponse.success) {
        throw new Error(urlResponse.error || 'Failed to get upload URL');
      }
      setUploadProgress(20);

      // Upload the file
      const { uploadUrl, fileName } = urlResponse.data;
      const uploadResponse = await pdfService.uploadPdfToUrl(uploadUrl, file);
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error || 'Failed to upload file');
      }
      setUploadProgress(60);

      // Only proceed with OCR if upload was successful
      if (uploadResponse.success) {
        const ocrResponse = await pdfService.processOcr(fileName);
        setUploadProgress(100);
        
        // Store the raw response data
        setUploadResponse({
          upload: uploadResponse.rawResponse,
          ocr: ocrResponse.rawResponse
        });

        // Set the parsed OCR data
        if (ocrResponse.success && ocrResponse.rawResponse?.data) {
          setOcrData(ocrResponse.rawResponse.data);
        }

        if (!ocrResponse.success) {
          toast.error('OCR processing failed, but file was uploaded');
        } else {
          toast.success('File uploaded and processed successfully');
        }
      }
    } catch (error: any) {
      console.error('Error in file upload process:', error);
      toast.error(error.message || 'Failed to process file');
    } finally {
      setUploadingPdf(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Add PDF generation function
  const generatePDF = async () => {
    if (!pdfContentRef.current) return;
    
    setGeneratingPdf(true);
    
    try {
      const content = pdfContentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        windowWidth: 1200, // Increased width for better text rendering
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('280-Richards-Brooklyn-Deal-Overview.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Render the property details section using OCR data
  const renderPropertyDetails = () => {
    if (!ocrData) return null;

    const { propertyInfo, leaseInfo, financingInfo } = ocrData;

    // Add null checks and default values
    const propertySizeSF = propertyInfo?.propertySizeSF || 0;
    const yearBuilt = propertyInfo?.yearBuilt || 'N/A';
    const landAreaAcres = propertyInfo?.landAreaAcres || 0;
    const leaseTermRemainingYears = leaseInfo?.leaseTermRemainingYears || 0;
    const tenantName = leaseInfo?.tenantName || 'N/A';
    const leasePercentage = leaseInfo?.leasePercentage || 0;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-6">
        <EnhancedMetricCard
          label="Property Size"
          value={`${propertySizeSF.toLocaleString()} SF`}
          icon={<i className="ti ti-ruler-2" />}
        />
        <EnhancedMetricCard
          label="Year Built"
          value={yearBuilt.toString()}
          icon={<i className="ti ti-building" />}
        />
        <EnhancedMetricCard
          label="Land Area"
          value={`${landAreaAcres} acres`}
          icon={<i className="ti ti-map" />}
        />
        <EnhancedMetricCard
          label="Lease Term"
          value={`${leaseTermRemainingYears} years`}
          icon={<i className="ti ti-calendar" />}
        />
        <EnhancedMetricCard
          label="Tenant"
          value={tenantName}
          icon={<i className="ti ti-user" />}
        />
        <EnhancedMetricCard
          label="Occupancy"
          value={`${leasePercentage}%`}
          icon={<i className="ti ti-chart-pie" />}
        />
        {financingInfo?.isFinancingAssumable && (
          <>
            <EnhancedMetricCard
              label="Assumable Loan"
              value={`$${((financingInfo?.assumableLoanAmountUSD || 0) / 1000000).toFixed(1)}M`}
              icon={<i className="ti ti-cash" />}
            />
            <EnhancedMetricCard
              label="Interest Rate"
              value={`${financingInfo?.assumableInterestRatePercent || 0}%`}
              icon={<i className="ti ti-percentage" />}
            />
          </>
        )}
      </div>
    );
  };

  // Render investment highlights
  const renderInvestmentHighlights = () => {
    if (!ocrData?.summaryPoints.investmentHighlights) return null;

    return (
      <div className="px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">Investment Highlights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ocrData.summaryPoints.investmentHighlights.map((highlight, index) => (
            <div key={index} className="flex items-start gap-2">
              <i className="ti ti-check text-green-500 mt-1" />
              <span>{highlight}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render broker contacts
  const renderBrokerContacts = () => {
    if (!ocrData?.brokerContacts) return null;

    return (
      <div className="px-4 py-6">
        <h3 className="text-xl font-semibold mb-4">Broker Contacts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ocrData.brokerContacts.map((broker, index) => (
            <div key={index} className="p-4 bg-white rounded-lg shadow">
              <h4 className="font-semibold">{broker.name}</h4>
              <p className="text-sm text-gray-600">{broker.title}</p>
              <div className="mt-2">
                <a href={`mailto:${broker.email}`} className="text-blue-600 hover:underline text-sm block">
                  {broker.email}
                </a>
                <a href={`tel:${broker.phone}`} className="text-blue-600 hover:underline text-sm block">
                  {broker.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Add placeholder component for empty state
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7 16.5L12 21L17 16.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 12V21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M20.5 17.5V19C20.5 20.1046 19.6046 21 18.5 21H5.5C4.39543 21 3.5 20.1046 3.5 19V17.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M16 8L12 4L8 8" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Deal Data Available</h3>
      <p className="text-gray-500 mb-8 max-w-md">Upload a PDF document to analyze the deal details and view comprehensive insights.</p>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 7V17M7 12L12 7L17 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Upload Deal Document
      </button>
    </div>
  );

  // Add upload progress component
  const UploadProgress = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 mb-6 relative">
            <svg className="animate-spin w-16 h-16 text-blue-600" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-blue-600 font-semibold">{uploadProgress}%</span>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Document</h3>
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
          <p className="text-gray-500 text-center">
            {uploadProgress < 30 && "Analyzing document..."}
            {uploadProgress >= 30 && uploadProgress < 60 && "Extracting data..."}
            {uploadProgress >= 60 && uploadProgress < 90 && "Processing insights..."}
            {uploadProgress >= 90 && "Almost done..."}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <link
        rel="stylesheet"
        href="https://unpkg.com/@tabler/icons-webfont@2.47.0/tabler-icons.min.css"
        crossOrigin="anonymous"
      />
      <main className="max-w-[1400px] mx-auto">
        <div ref={contentRef} className="flex flex-col px-10 pt-6 pb-10 m-5 rounded-2xl shadow-xl bg-white border border-gray-100 backdrop-blur-sm backdrop-filter max-sm:px-4 max-sm:pt-4 max-sm:pb-6 max-sm:m-2.5 transition-all duration-300 hover:shadow-2xl">
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
              {/* PDF Upload Button */}
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadingPdf}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPdf}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white
                             ${uploadingPdf ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                             transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0`}
                >
                  {uploadingPdf ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 14.9861C11 15.5384 11.4477 15.9861 12 15.9861C12.5523 15.9861 13 15.5384 13 14.9861V7.82831L16.2428 11.0711C16.6333 11.4616 17.2665 11.4616 17.657 11.0711C18.0475 10.6806 18.0475 10.0474 17.657 9.65691L12.7071 4.70701C12.3166 4.31648 11.6834 4.31648 11.2929 4.70701L6.34315 9.65691C5.95263 10.0474 5.95263 10.6806 6.34315 11.0711C6.73368 11.4616 7.36684 11.4616 7.75737 11.0711L11 7.82831V14.9861Z" fill="currentColor"/>
                        <path d="M4 14H6V18H18V14H20V18C20 19.1046 19.1046 20 18 20H6C4.89543 20 4 19.1046 4 18V14Z" fill="currentColor"/>
                      </svg>
                      Upload PDF
                    </>
                  )}
                </button>
              </div>
            </div>
          </nav>

          {/* Header */}
          <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4 py-4 h-auto rounded-xl bg-gradient-to-r from-slate-50 to-blue-50 mb-4 border border-blue-100/50 shadow-sm">
            <h1 className="text-2xl font-bold tracking-tight leading-8 text-zinc-950">
              Deal Overview
            </h1>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <div className="text-lg text-zinc-950">Underwriting Model</div>
                <button className="flex gap-1 items-center px-4 py-2 text-sm rounded-md bg-white border border-blue-100 hover:border-blue-300 shadow-sm transition-colors duration-200 text-slate-900 w-full md:w-auto justify-center">
                  <span>Industrial.Template.v2.4.xlsx</span>
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        "<svg width='13' height='12' viewBox='0 0 13 12' fill='none'><path d='M3.5 4.5L6.5 7.5L9.5 4.5' stroke='black' stroke-linecap='round' stroke-linejoin='round'></path></svg>",
                    }}
                  />
                </button>
              </div>
              
              {/* PDF Generation Button */}
              <button
                onClick={generatePDF}
                disabled={generatingPdf}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-white w-full md:w-auto justify-center
                           ${generatingPdf ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} 
                           transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0`}
              >
                {generatingPdf ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 18H17V16H7V18Z" fill="currentColor"/>
                      <path d="M17 14H7V12H17V14Z" fill="currentColor"/>
                      <path d="M7 10H11V8H7V10Z" fill="currentColor"/>
                      <path fillRule="evenodd" clipRule="evenodd" d="M6 2C4.34315 2 3 3.34315 3 5V19C3 20.6569 4.34315 22 6 22H18C19.6569 22 21 20.6569 21 19V9C21 5.13401 17.866 2 14 2H6ZM6 4H13V9H19V19C19 19.5523 18.5523 20 18 20H6C5.44772 20 5 19.5523 5 19V5C5 4.44772 5.44772 4 6 4ZM15 4.10002C16.6113 4.4271 17.9413 5.52906 18.584 7H15V4.10002Z" fill="currentColor"/>
                    </svg>
                    Generate PDF
                  </>
                )}
              </button>
            </div>
          </header>

          <div className="mx-0 my-2.5 h-px bg-zinc-200" />

          {/* Show loading state during upload */}
          {uploadingPdf && <UploadProgress />}

          {/* Show empty state when no data */}
          {!ocrData && !uploadingPdf && <EmptyState />}

          {/* Only show content when data is available */}
          {ocrData && (
            <>
              {/* News Carousel */}
              <div className="px-4 py-4">
                <NewsCarousel articles={newsArticles} loading={loading} />
              </div>

              {/* OCR Data Display */}
              <div className="space-y-6">
                {renderPropertyDetails()}
                {renderInvestmentHighlights()}
                {renderBrokerContacts()}
              </div>

              {/* Raw Response Toggle */}
              {uploadResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <button
                    onClick={() => setShowRawResponse(!showRawResponse)}
                    className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
                  >
                    <i className={`ti ti-chevron-${showRawResponse ? 'up' : 'down'}`} />
                    {showRawResponse ? 'Hide' : 'Show'} Raw Response
                  </button>
                  
                  {showRawResponse && (
                    <pre className="mt-4 whitespace-pre-wrap overflow-x-auto bg-white p-4 rounded border">
                      {JSON.stringify(uploadResponse, null, 2)}
                    </pre>
                  )}
                </div>
              )}

              {/* Content for PDF */}
              <div ref={pdfContentRef} className="flex flex-col px-10 pt-6 pb-10 m-5 rounded-2xl shadow-xl bg-white border border-gray-100 backdrop-blur-sm backdrop-filter max-sm:px-4 max-sm:pt-4 max-sm:pb-6 max-sm:m-2.5 transition-all duration-300 hover:shadow-2xl break-inside-avoid">
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

                  {/* Deal Summary with Risk Factors - Enhanced UI */}
                  <div className="self-stretch h-auto relative px-6 pt-2">
                    <div className="flex flex-col lg:flex-row gap-8">
                      {/* Deal Summary */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 pb-4">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 3L20 7.5V16.5L12 21L4 16.5V7.5L12 3Z" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 12L20 7.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 12V21" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M12 12L4 7.5" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="text-zinc-900 text-xl font-bold">Deal Summary</div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl p-6 border border-blue-100 shadow-sm space-y-6">
                          <div className="prose prose-blue max-w-none">
                            <p className="text-zinc-700 leading-relaxed">
                              280 Richards, fully leased to Amazon, aligns with HUSPP's
                              strategy of acquiring prime logistics assets in Brooklyn's
                              high-demand Red Hook submarket. With 13 years remaining on the
                              lease and 3% annual rent escalations, it offers stable,
                              long-term cash flow.
                            </p>
                          </div>

                          <div className="bg-red-50 border border-red-200 rounded-xl p-6 space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <h4 className="text-red-800 text-lg font-semibold">Risk Factors</h4>
                            </div>
                            <ul className="space-y-3">
                              {[
                                "Single-tenant exposure to Amazon",
                                "Lease roll within 12 months",
                                "Potential impact of congestion pricing on logistics operations"
                              ].map((risk, index) => (
                                <li key={index} className="flex items-center gap-3 text-red-700">
                                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm font-medium">{risk}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="prose prose-blue max-w-none">
                            <p className="text-zinc-700 leading-relaxed">
                              While single-tenant exposure is a risk,
                              Amazon's investment-grade rating and renewal options enhance
                              its resilience, making it a strong addition to HUSPP's
                              portfolio.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Personalized Insights - Enhanced UI */}
                      <div className="lg:w-[400px]">
                        <div className="flex items-center gap-3 pb-4">
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M16 17L21 12L16 7" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M21 12H9" stroke="#9333EA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="text-zinc-900 text-xl font-bold">Personalized Insights</div>
                        </div>
                        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl p-6 border border-purple-100 shadow-sm space-y-6">
                          <div className="space-y-4">
                            {[
                              {
                                date: "2019",
                                title: "Previous Deal Review",
                                content: "Jake Klein viewed this deal, but decided not to proceed due to lack of potential upside",
                                link: "#",
                                linkText: "View Previous Analysis"
                              },
                              {
                                date: "Oct 19, 2021",
                                title: "Similar Deal",
                                content: "Your firm bid on 55 Bay St, Brooklyn, NY 11231, a larger site also occupied by Amazon 0.5 miles away. Brookfield won the deal for $45M",
                                link: "#",
                                linkText: "View Comparable"
                              },
                              {
                                date: "Jan 19, 2025",
                                title: "Market Research",
                                content: "Tom, VP of Research, noted that congestion pricing has driven renewed demand for infill industrial in Brooklyn",
                                link: "#",
                                linkText: "Read Full Report"
                              }
                            ].map((insight, index) => (
                              <div key={index} className="group">
                                <div className="bg-white rounded-lg p-4 border border-purple-100 hover:border-purple-200 transition-all duration-300 shadow-sm hover:shadow-md">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                      {insight.date}
                                    </span>
                                    <h4 className="text-sm font-semibold text-zinc-900">{insight.title}</h4>
                                  </div>
                                  <p className="text-sm text-zinc-600 mb-3">{insight.content}</p>
                                  <a 
                                    href={insight.link}
                                    className="inline-flex items-center gap-1 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                                  >
                                    {insight.linkText}
                                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-purple-100">
                            <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
                              View All Insights
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                              </svg>
                            </button>
                            <button className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1">
                              Add Insight
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mx-0 my-2.5 h-px bg-zinc-200" />

                  {/* Market and Financial Metrics with Risk Indicators */}
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

                      {/* Key Assumptions with Risk Indicators */}
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
                            isRisk={true}
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
                      <h3 className="text-black text-xl font-bold mb-4 flex items-center">
                        <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#F59E0B" strokeWidth="2"/>
                            <path d="M12 7V12L15 15" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        Supply Pipeline
                      </h3>
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
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-amber-100 overflow-hidden group"
                          >
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 relative overflow-hidden">
                                <img
                                  src={property.image}
                                  alt={property.address}
                                  className="w-full h-40 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                              </div>
                              <div className="sm:w-2/3 p-4">
                                <h4 className="text-lg font-bold mb-3 text-amber-900">{property.address}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {Object.entries(property.details).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                      <span className="text-amber-800 text-xs font-bold uppercase tracking-wider">{key}</span>
                                      <span className="text-zinc-700 text-sm font-medium">{value}</span>
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
                      <h3 className="text-black text-xl font-bold mb-4 flex items-center">
                        <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 12H4M8 12H6M10 12H12M16 12H14M18 12H20M22 12H20" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 2V4M12 8V6M12 10V12M12 16V14M12 18V20M12 22V20" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M15 3L13.5 5M10.5 9L9 7M7.5 10.5L4.5 12M7.5 13.5L4.5 12M10.5 15L9 17M15 21L13.5 19M18 17L16.5 15M19.5 13.5L16.5 12M19.5 10.5L16.5 12M18 7L16.5 9" stroke="#059669" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </span>
                        Sale Comparables
                      </h3>
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          {
                            image: "https://images.pexels.com/photos/186077/pexels-photo-186077.jpeg?cs=srgb&dl=pexels-binyaminmellish-186077.jpg&fm=jpg",
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
                            image: "https://www.investopedia.com/thmb/bfHtdFUQrl7jJ_z-utfh8w1TMNA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/houses_and_land-5bfc3326c9e77c0051812eb3.jpg",
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
                        ].map((property, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-emerald-100 overflow-hidden group"
                          >
                            <div className="flex flex-col sm:flex-row">
                              <div className="sm:w-1/3 relative overflow-hidden">
                                <img
                                  src={property.image}
                                  alt={property.address}
                                  className="w-full h-40 sm:h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                              </div>
                              <div className="sm:w-2/3 p-4">
                                <h4 className="text-lg font-bold mb-3 text-emerald-900">{property.address}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {Object.entries(property.details).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                      <span className="text-emerald-800 text-xs font-bold uppercase tracking-wider">{key}</span>
                                      <span className="text-zinc-700 text-sm font-medium">{value}</span>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default DealOverview; 