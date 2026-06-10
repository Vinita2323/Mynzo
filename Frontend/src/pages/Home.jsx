import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Gamepad2, Gem, Heart, LayoutGrid, Compass, HelpCircle, Layers, MapPin, Trophy, ShieldAlert, Truck, RotateCcw, ShieldCheck, Tag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, BANNERS, VALUE_PROPS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ui/ProductCard';

import CrazyDeals2 from '../assets/CrazyDeals/CrazyDeals2.jpg';
import CrazyDeals3 from '../assets/CrazyDeals/CrazyDeals3.jpg';
import CrazyDeals4 from '../assets/CrazyDeals/CrazyDeals4.jpg';
import CrazyDeals5 from '../assets/CrazyDeals/CrazyDeals5.jpg';

import beauty1 from '../assets/BeautyProducts/Beauty1.png';
import beauty2 from '../assets/BeautyProducts/Beauty2.jpg';
import beauty3 from '../assets/BeautyProducts/Beauty3.jpg';
import beauty4 from '../assets/BeautyProducts/Beauty4.jpg';
import beauty5 from '../assets/BeautyProducts/Beauty5.jpg';

export default function Home() {
  const navigate = useNavigate();
  const { searchQuery, toggleWishlist, isInWishlist, user } = useApp();
  const [activeBanner, setActiveBanner] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('for-you');
  const [activeFlashTab, setActiveFlashTab] = useState('All');
  const [budgetFilter, setBudgetFilter] = useState(null);

  const [categories, setCategories] = useState(CATEGORIES);
  const [dynamicBanners, setDynamicBanners] = useState([]);

  // Dynamic Products from API
  const [rawAllProducts, setRawAllProducts] = useState([]);
  const [crazyDealsProducts, setCrazyDealsProducts] = useState([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [topSelectionProducts, setTopSelectionProducts] = useState([]);
  const [subCategoryChips, setSubCategoryChips] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [productsLoading, setProductsLoading] = useState(true);
  const [topBuys, setTopBuys] = useState([]);
  const [trendingBrands, setTrendingBrands] = useState([]);

  useEffect(() => {
    const fetchCategoryChips = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/chips`);
        const data = await res.json();
        if (res.ok && data.success && data.chips && data.chips.length > 0) {
          const activeChips = data.chips.filter(c => c.active && c.id !== 'for-you');
          const forYouChip = CATEGORIES.find(c => c.id === 'for-you');
          console.log('Fetched chips:', activeChips);
          console.log('For You chip:', forYouChip);
          setCategories([forYouChip, ...activeChips]);
        }
      } catch (err) {
        console.error('Error fetching category chips:', err);
      }
    };
    
    const fetchBanners = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/banners`);
        const data = await res.json();
        if (res.ok && data.success && data.banners) {
          setDynamicBanners(data.banners.filter(b => b.active));
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
      }
    };

    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        
        const [resProducts, resTopBuys, resTrending] = await Promise.all([
          fetch(`${apiBase}/admin/catalog/products?status=Approved`),
          fetch(`${apiBase}/admin/catalog/products/top-buys`),
          fetch(`${apiBase}/admin/catalog/products/trending-brands`)
        ]);

        const dataProducts = await resProducts.json();
        if (resProducts.ok && dataProducts.success && dataProducts.products) {
          const allProducts = dataProducts.products;
          setRawAllProducts(allProducts);
          setCrazyDealsProducts(allProducts.filter(p => p.flags?.crazyDeals));
          setFlashSaleProducts(allProducts.filter(p => p.flags?.flashSale));
          setTopSelectionProducts(allProducts.filter(p => p.flags?.topSection));
        }

        if (resTopBuys.ok) {
          const dataTopBuys = await resTopBuys.json();
          if (dataTopBuys.success && dataTopBuys.products) {
            setTopBuys(dataTopBuys.products.map(normaliseProduct));
          }
        }

        if (resTrending.ok) {
          const dataTrending = await resTrending.json();
          if (dataTrending.success && dataTrending.brands) {
            setTrendingBrands(dataTrending.brands.map((b, idx) => ({
              id: idx + 1,
              brand: b.brand,
              discount: "Trending Choice",
              badgeColor: "text-indigo-600",
              image: getImageUrl(b.image) || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200"
            })));
          }
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setProductsLoading(false);
      }
    };

    const fetchSubCategoryChips = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/subchips`);
        const data = await res.json();
        if (res.ok && data.success && data.subchips) {
          setSubCategoryChips(data.subchips.filter(sc => sc.active));
        }
      } catch (err) {
        console.error('Error fetching subcategory chips:', err);
      }
    };

    fetchCategoryChips();
    fetchBanners();
    fetchProducts();
    fetchSubCategoryChips();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (
      imagePath.startsWith('http://') || 
      imagePath.startsWith('https://') || 
      imagePath.startsWith('data:') ||
      imagePath.startsWith('/src/') ||
      imagePath.startsWith('/assets/') ||
      imagePath.includes('categoryForU') ||
      imagePath.includes('Category')
    ) {
      return imagePath;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // Reset subcategory selection when the main category selection changes
  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedCategory]);

  const getFilteredCategoryProducts = () => {
    if (selectedCategory === 'for-you') {
      return [];
    }
    let filtered = rawAllProducts.filter(
      p => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
    if (selectedSubCategory !== 'all') {
      filtered = filtered.filter(
        p => p.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase()
      );
    }
    return filtered.map(normaliseProduct);
  };

  const getActiveBanners = () => {
    if (dynamicBanners.length > 0) {
      return dynamicBanners;
    }
    return BANNERS;
  };

  const activeBannersList = getActiveBanners();

  // Reset active banner index when active banners change
  useEffect(() => {
    setActiveBanner(0);
  }, [activeBannersList.length]);

  // Auto-slide Banners
  useEffect(() => {
    if (activeBannersList.length === 0) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % activeBannersList.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [activeBannersList.length]);

  // 1. Live Countdown Timer State for Crazy Deals (ticking down from 2h 45m 30s)
  const [timeLeft, setTimeLeft] = useState(9930); // 9930 seconds = 02 hours, 45 minutes, 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 9930));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return {
      hrs: hrs < 10 ? `0${hrs}` : hrs,
      mins: mins < 10 ? `0${mins}` : mins,
      secs: secs < 10 ? `0${secs}` : secs,
    };
  };

  const { hrs, mins, secs } = formatTime(timeLeft);

  // Custom Category Inline SVG Renderer to match reference drawings
  const renderCategoryIcon = (id, isActive) => {
    const strokeColor = isActive ? "#FFFFFF" : "#02006c";

    switch (id) {
      case 'for-you':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case 'beauty':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 9 A 2 2 0 0 1 9 7 H 15 A 2 2 0 0 1 17 9 V 20 A 2 2 0 0 1 15 22 H 9 A 2 2 0 0 1 7 20 Z" />
            <path d="M10 7 V 3 H 14 V 7" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="10" y1="17" x2="14" y2="17" />
          </svg>
        );
      case 'gifting':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 12 20 22 4 22 4 12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        );
      case 'electronics':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        );
      case 'jewellery':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12l4 6-10 12L2 9z" />
            <path d="M11 3 8 9l4 12 4-12-3-6" />
            <path d="M2 9h20" />
          </svg>
        );
      case 'toys':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="13" rx="3" />
            <rect x="7" y="10" width="10" height="4" rx="1" />
            <path d="M 6 17 H 10 M 8 15 V 19" />
            <circle cx="15.5" cy="17.5" r="1.2" fill={strokeColor} />
            <circle cx="18" cy="16" r="1.2" fill={strokeColor} />
            <line x1="12" y1="8" x2="12" y2="3" />
            <circle cx="12" cy="3" r="1.5" />
          </svg>
        );
      case 'stationery':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2 L20 20 H4 Z" />
            <line x1="2" y1="16" x2="22" y2="16" />
            <rect x="10" y="8" width="4" height="4" rx="0.5" />
          </svg>
        );
      case 'fashion':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.38 3.46L16 6a2 2 0 0 1-2-2V2H10v2a2 2 0 0 1-2 2L3.62 3.46a2 2 0 0 0-2.38.88l-1 1.5a2 2 0 0 0 .38 2.56L4 10v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10l3.38-2.6a2 2 0 0 0 .38-2.56l-1-1.5a2 2 0 0 0-2.38-.88z" />
          </svg>
        );
      case 'electrical':
        return (
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        );
      default:
        return null;
    }
  };

  // Normalise API product to match the shape the UI expects
  const normaliseProduct = (p) => ({
    id: p._id || p.id,
    name: p.name,
    desc: p.description || '',
    price: p.sellingPrice,
    originalPrice: p.mrp || p.sellingPrice,
    discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
    rating: p.rating || 4.5,
    type: (p.category || '').toLowerCase(),
    image: (p.images && p.images[0]) ? p.images[0] : '',
    brandName: p.brandName || 'Mynzo Originals',
    flags: p.flags || {},
    stock: p.stock || 0,
    sales: p.sales || 0,
  });

  // Dynamic trending brands aggregated from all products, sorted by total sales of the brand's products
  const getTrendingBrands = () => {
    if (trendingBrands && trendingBrands.length > 0) {
      return trendingBrands;
    }
    const brandSales = {};
    rawAllProducts.forEach(p => {
      const brand = p.brandName || 'Generic';
      const sales = p.sales || 0;
      const image = p.images?.[0] || '';
      if (!brandSales[brand]) {
        brandSales[brand] = { brand, sales: 0, image, maxProductSales: 0 };
      }
      brandSales[brand].sales += sales;
      if (sales >= brandSales[brand].maxProductSales) {
        brandSales[brand].maxProductSales = sales;
        brandSales[brand].image = image;
      }
    });

    return Object.values(brandSales)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 6)
      .map((b, idx) => ({
        id: idx + 1,
        brand: b.brand,
        discount: "Trending Choice",
        badgeColor: "text-indigo-600",
        image: getImageUrl(b.image) || "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=200"
      }));
  };

  // Filter deals in-place on the Home page based on search bar query AND active category tab
  const getHomeFilteredDeals = () => {
    let items = crazyDealsProducts.map(normaliseProduct);

    // 1. Search Query filter
    if (searchQuery) {
      items = items.filter((deal) =>
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (deal.desc && deal.desc.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return items;
  };

  const filteredDeals = getHomeFilteredDeals();

  const getFlashFilteredDeals = () => {
    let items = flashSaleProducts.map(normaliseProduct);
    switch (activeFlashTab) {
      case 'All':
        return items;
      case 'Newest':
        return items.slice().reverse();
      case 'Popular':
        return items.filter(d => d.rating >= 4.8);
      default:
        return items.filter(d =>
          activeFlashTab === 'All' ||
          (d.type || '').toLowerCase().includes(activeFlashTab.toLowerCase()) ||
          (d.name || '').toLowerCase().includes(activeFlashTab.toLowerCase())
        );
    }
  };

  const flashDeals = getFlashFilteredDeals();
  const topSelectionNormalised = topSelectionProducts.map(normaliseProduct);

  // Helper custom inline vector display for horizontal scrolling slider
  const renderDealGraphic = (type) => {
    switch (type) {
      case 'teddy':
        return (
          <svg viewBox="0 0 100 100" className="w-18 h-18 drop-shadow-sm">
            {/* Ears */}
            <circle cx="28" cy="30" r="10" fill="#FDA4AF" />
            <circle cx="28" cy="30" r="6" fill="#F43F5E" />
            <circle cx="72" cy="30" r="10" fill="#FDA4AF" />
            <circle cx="72" cy="30" r="6" fill="#F43F5E" />
            {/* Body */}
            <circle cx="50" cy="72" r="24" fill="#FECDD3" />
            <circle cx="50" cy="72" r="16" fill="#FFE4E6" />
            {/* Head */}
            <circle cx="50" cy="46" r="20" fill="#FDA4AF" />
            {/* Snout */}
            <ellipse cx="50" cy="50" r="8" rx="7" ry="5" fill="#FFE4E6" />
            <ellipse cx="50" cy="48" r="3" rx="3" ry="2" fill="#475569" />
            {/* Eyes */}
            <circle cx="43" cy="42" r="2.5" fill="#0F172A" />
            <circle cx="43.5" cy="41.5" r="0.8" fill="white" />
            <circle cx="57" cy="42" r="2.5" fill="#0F172A" />
            <circle cx="56.5" cy="41.5" r="0.8" fill="white" />
            {/* Blush */}
            <circle cx="36" cy="47" r="3" fill="#FB7185" opacity="0.6" />
            <circle cx="64" cy="47" r="3" fill="#FB7185" opacity="0.6" />
            {/* Paw Pads */}
            <circle cx="34" cy="80" r="5" fill="#FB7185" />
            <circle cx="66" cy="80" r="5" fill="#FB7185" />
          </svg>
        );
      case 'car':
        return (
          <svg viewBox="0 0 100 100" className="w-18 h-18 drop-shadow-sm">
            {/* Ground shadow */}
            <ellipse cx="50" cy="82" rx="34" ry="6" fill="#E2E8F0" />
            {/* Antenna */}
            <line x1="68" y1="52" x2="76" y2="30" stroke="#475569" strokeWidth="2" />
            <circle cx="76" cy="30" r="2" fill="#EF4444" />
            {/* Wheels */}
            <circle cx="28" cy="74" r="12" fill="#1E293B" />
            <circle cx="28" cy="74" r="6" fill="#F97316" />
            <circle cx="72" cy="74" r="12" fill="#1E293B" />
            <circle cx="72" cy="74" r="6" fill="#F97316" />
            {/* Car body */}
            <rect x="22" y="52" width="56" height="18" rx="6" fill="#ee4923" />
            <path d="M32 52L40 38H60L68 52H32Z" fill="#0F172A" />
            {/* Windshield highlights */}
            <polygon points="42 40, 58 40, 62 50, 38 50" fill="#38BDF8" opacity="0.5" />
            {/* Spoiler */}
            <rect x="16" y="44" width="10" height="4" fill="#0F172A" transform="rotate(-15 16 44)" />
          </svg>
        );
      case 'pendant':
        return (
          <svg viewBox="0 0 100 100" className="w-18 h-18 drop-shadow-sm">
            {/* Chain */}
            <path d="M25 20C35 40 45 50 50 54C55 50 65 40 75 20" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeDasharray="3,3" />
            {/* Pendant loop */}
            <circle cx="50" cy="53" r="4" fill="none" stroke="#94A3B8" strokeWidth="2" />
            {/* Heart */}
            <path d="M50 58 C46 52 32 52 32 68 C32 80 50 90 50 90 C50 90 68 80 68 68 C68 52 54 52 50 58 Z" fill="url(#silverGradDeal)" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Inlaid Diamond */}
            <path d="M50 66 L54 72 L50 78 L46 72 Z" fill="#38BDF8" opacity="0.8" />
            {/* Sparkles */}
            <polygon points="34 56, 36 52, 38 56, 36 60" fill="#F59E0B" />
            <polygon points="64 74, 66 70, 68 74, 66 78" fill="#F59E0B" />
            
            <defs>
              <linearGradient id="silverGradDeal" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F1F5F9" />
                <stop offset="50%" stopColor="#94A3B8" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
          </svg>
        );
      case 'hamper':
        return (
          <svg viewBox="0 0 100 100" className="w-18 h-18 drop-shadow-sm">
            {/* Basket base */}
            <path d="M22 60 L28 85 A 4 4 0 0 0 32 88 L68 88 A 4 4 0 0 0 72 85 L78 60 Z" fill="#A16207" />
            {/* Basket weave lines */}
            <path d="M28 66 H72 M30 74 H70 M32 82 H68 M40 60 V88 M50 60 V88 M60 60 V88" stroke="#78350F" strokeWidth="1" opacity="0.4" />
            {/* Basket items fillers */}
            <circle cx="36" cy="50" r="10" fill="#F43F5E" /> {/* Teddy head in hamper */}
            <rect x="44" y="42" width="14" height="20" rx="2" fill="#3B82F6" /> {/* Choco box */}
            <ellipse cx="62" cy="52" rx="10" ry="12" fill="#EAB308" /> {/* Fruit */}
            
            {/* Wrapping cellophane bow */}
            <path d="M20 60 C30 50 42 42 50 42 C58 42 70 50 80 60" fill="none" stroke="#E2E8F0" strokeWidth="1.5" />
            
            {/* Ribbon Bow */}
            <path d="M50 42 C44 32 38 42 50 42 C62 42 56 32 50 42 Z" fill="#EF4444" />
            <circle cx="50" cy="42" r="3.5" fill="#DC2626" />
          </svg>
        );
      default:
        return null;
    }
  };

  const BEAUTY_SUB_CATEGORIES = [
    { id: 'skin', name: 'Skincare', icon: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=100&q=80' },
    { id: 'hair', name: 'Hair care', icon: 'https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=100&q=80' },
    { id: 'makeup', name: 'Makeup', icon: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&q=80' },
    { id: 'fragrance', name: 'Fragrances', icon: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=100&q=80' },
    { id: 'personal', name: 'Personal care', icon: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80' },
    { id: 'derma', name: 'Derma', icon: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=100&q=80' },
    { id: 'grooming', name: 'Grooming', icon: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=100&q=80' }
  ];

  const TOP_10_BUYS = [
    { id: 1, name: "MAC Lipstick", discount: "Min. 30% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 1, image: beauty2 },
    { id: 2, name: "L'Oreal Serum", discount: "Min. 50% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 2, image: beauty3 },
    { id: 3, name: "Maybelline foundation", discount: "Min. 45% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 3, image: beauty4 },
    { id: 4, name: "Pond's moisturiser", discount: "Flat 59% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 4, image: beauty5 },
    { id: 5, name: "Bellavita perfume", discount: "Min. 75% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 5, image: beauty1 },
    { id: 6, name: "Garnier", discount: "Min. 40% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 6, image: beauty3 },
    { id: 7, name: "Nykaa Cosmetics", discount: "Up to 60% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 7, image: beauty2 },
    { id: 8, name: "Plum Green Tea", discount: "Min. 25% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 8, image: beauty4 },
    { id: 9, name: "Minimalist Serum", discount: "Flat 10% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 9, image: beauty3 },
    { id: 10, name: "Dot & Key", discount: "Min. 35% Off", bg: "bg-gradient-to-b from-[#FFA781] to-[#F3557A]", rank: 10, image: beauty5 },
  ];

  const TRENDING_BRANDS = [
    { id: 1, brand: "sotrue", discount: "Up to 35% Off", badgeColor: "text-blue-600", image: beauty1 },
    { id: 2, brand: "derma co", discount: "Up to 50% Off", badgeColor: "text-slate-800", image: beauty2 },
    { id: 3, brand: "medicube", discount: "Up to 60% Off", badgeColor: "text-blue-800", image: beauty3 },
    { id: 4, brand: "SWISS BEAUTY", discount: "Up to 50% Off", badgeColor: "text-slate-800", image: beauty4 },
    { id: 5, brand: "PERSONAL TOUCH", discount: "Up to 70% Off", badgeColor: "text-slate-800", image: beauty5 }
  ];



  if (productsLoading) {
    return (
      <div className="flex-grow space-y-5 pb-10 animate-fade-in bg-slate-50">
        {/* 1. Category Strip Skeleton */}
        <div className="flex items-center gap-4 overflow-x-auto px-4 py-3.5 bg-white border-b border-slate-100 scrollbar-none">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 w-[60px] animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-slate-200" />
              <div className="w-10 h-2.5 bg-slate-200 rounded" />
            </div>
          ))}
        </div>

        {/* 2. Banner Skeleton */}
        <div className="px-3 animate-pulse">
          <div className="w-full aspect-[21/9] rounded-2xl bg-slate-200 shadow-sm" />
        </div>

        {/* 3. Flash Sale / Crazy Deals Header Skeleton */}
        <div className="px-4 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="w-28 h-5 bg-slate-200 rounded" />
            <div className="w-20 h-4 bg-slate-200 rounded-full" />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none pb-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-32 aspect-[3/4.2] bg-slate-200 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* 4. Top 10 Buys Skeleton */}
        <div className="px-4 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="w-24 h-5 bg-slate-200 rounded" />
            <div className="w-16 h-4 bg-slate-200 rounded-full" />
          </div>
          <div className="flex gap-3 overflow-x-auto scrollbar-none">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-32 h-44 bg-slate-200 rounded-2xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* 5. Trending Brands Skeleton */}
        <div className="px-4 space-y-3 animate-pulse">
          <div className="flex justify-between items-center">
            <div className="w-32 h-5 bg-slate-200 rounded" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-full aspect-[4/3] bg-slate-200 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-grow space-y-3.5 pb-6 animate-fade-in">
      
      {/* 1. Ultra-Compact Category strip with minimized gaps and in-place active states */}
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 bg-white border-b border-slate-50 scrollbar-none scroll-smooth mt-2">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          const labelText = cat.categoryName || cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
              }}
              className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer transition-all duration-300 w-[72px]"
            >
              {/* Image Box */}
              <div className={`w-14 h-14 flex items-center justify-center rounded-2xl border transition-all duration-300 overflow-hidden ${
                isActive
                  ? 'bg-[#ee4923] border-[#ee4923] text-white shadow-sm'
                  : 'bg-[#FFF0ED] border-[#FFF0ED] text-[#02006c] hover:border-[#ee4923]/40'
              }`}>
                {cat.image ? (
                  <img src={getImageUrl(cat.image)} alt={labelText} className="w-full h-full object-contain p-1" />
                ) : (
                  renderCategoryIcon(cat.id, isActive)
                )}
              </div>

              {/* Label */}
              <div className="w-full text-center px-1">
                <span className={`text-[10px] block truncate rounded-full transition-colors py-0.5 ${
                  isActive 
                    ? 'font-bold text-[#ee4923] border border-[#ee4923] px-1' 
                    : 'font-semibold text-[#02006c] border border-transparent'
                }`} title={labelText}>
                  {labelText}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* 2. Banner Slider (Hero Banner Section) */}
      <div className="px-2 relative">
        <div className="overflow-hidden rounded-xl shadow-sm relative aspect-[21/9] w-full">
          <div 
            className="flex w-full h-full transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${activeBanner * 100}%)` }}
          >
            {activeBannersList.map((banner) => (
              <div
                key={banner.id || banner._id}
                className="w-full h-full flex-shrink-0 cursor-pointer"
                onClick={() => navigate(banner.link || '/categories')}
              >
                <img src={getImageUrl(banner.image)} alt="Banner" className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Indicators */}
        {activeBannersList.length > 1 && (
          <div className="flex justify-center items-center gap-1.5 mt-1">
            {activeBannersList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveBanner(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === activeBanner ? 'w-4 bg-[#ee4923]' : 'w-1.5 bg-slate-200'
                }`}
              ></button>
            ))}
          </div>
        )}
      </div>

      {/* CONDITIONAL RENDER: "For You" vs Other Categories */}
      {selectedCategory === 'for-you' ? (
        <>


      {/* 4. Crazy Deals Horizontal Scroll List (Custom Compact & Soft Orange Canvas Layout) */}
      <div className="px-4 space-y-2.5">
        
        {/* Title Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span 
              className="text-[22px] font-extrabold text-[#02006c] flex items-center gap-1.5 font-sans"
            >
              Crazy Deals
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">
              (Like, really crazy!)
            </span>
          </div>
          <button 
            onClick={() => navigate('/crazy-deals')}
            className="text-xs font-black text-[#ee4923] hover:underline"
          >
            See All
          </button>
        </div>

        {/* Ticking Countdown Timer */}
        <div className="flex items-center gap-1 text-[13px] font-black text-[#ee4923] tracking-wide -mt-1.5 font-sans">
          <span>{hrs}</span>
          <span className="animate-pulse">:</span>
          <span>{mins}</span>
          <span className="animate-pulse">:</span>
          <span>{secs}</span>
        </div>

        {/* Horizontal Scrolling Items Slider */}
        {filteredDeals.length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2.5 scrollbar-none scroll-smooth -mt-1">
            {filteredDeals.map((deal) => (
              <div 
                key={deal.id}
                onClick={() => navigate('/crazy-deals')}
                className="flex-shrink-0 w-24 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Compact Light Orange image display box */}
                  <div className="w-24 h-24 bg-orange-50/80 border border-orange-100/50 rounded-2xl flex items-center justify-center relative overflow-hidden group-hover:scale-[1.02] transition-all duration-300 animate-fade-in">
                    {/* Discount Pill */}
                    <span className="absolute top-0 left-0 bg-[#ee4923] text-white text-[9px] font-black px-2.5 py-1 rounded-br-lg shadow-3xs z-10">
                      {deal.discount}
                    </span>

                    {/* Real Image loaded from assets/CrazyDeals */}
                    <img 
                      src={deal.image} 
                      alt={deal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title */}
                  <h4 className="text-[10.5px] font-bold text-[#02006c] truncate mt-1.5 px-0.5 tracking-tight">
                    {deal.name}
                  </h4>
                </div>

                {/* Pricing row (No cart button, no description) */}
                <div className="flex items-center gap-1.5 mt-0.5 px-0.5 leading-none">
                  <span className="text-[10.5px] font-extrabold text-[#ee4923]">₹{deal.price}</span>
                  <span className="text-[8.5px] text-slate-400 font-bold line-through">₹{deal.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback empty state */
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-[#ee4923] mx-auto opacity-75" />
            <h4 className="text-xs font-bold text-[#0F172A]">No Matching Deals</h4>
            <p className="text-[10px] text-slate-400 leading-tight">
              Try searching for something else like "teddy" or "car"
            </p>
          </div>
        )}
      </div>



      {/* 5.5 Top Selection Section (Transparent with Brand Orange Card Borders) */}
      <div className="px-4 py-1">
        <div className="space-y-4">
          
          {/* Header Row */}
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[19px] font-bold tracking-wide text-[#02006c] font-sans">
              TOP SELECTION
            </h3>
            <button 
              onClick={() => navigate('/top-selection')}
              className="bg-slate-50 border border-slate-200 text-[#02006c] w-7 h-7 rounded-xl flex items-center justify-center shadow-2xs cursor-pointer hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          {/* 2x2 Premium Grid */}
          <div className="grid grid-cols-2 gap-3">
            {topSelectionNormalised.length > 0 ? (
              topSelectionNormalised.slice(0, 4).map((deal) => (
                <div 
                  key={deal.id}
                  onClick={() => navigate(`/product/${deal.id}`)}
                  className="bg-white border border-[#ee4923] rounded-lg p-2.5 pb-3.5 flex flex-col justify-between shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-95 transition-all duration-300 group"
                >
                  <div>
                    <div className="bg-[#F8F9FD] rounded-md w-full aspect-square flex items-center justify-center mb-2 relative overflow-hidden">
                      <img 
                        src={getImageUrl(deal.image)} 
                        alt={deal.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                    </div>
                    <span className="text-[9.5px] font-medium text-slate-400 tracking-tight leading-normal px-1 block truncate">
                      {deal.brandName}
                    </span>
                  </div>
                  <h4 className="text-[12.5px] font-bold text-slate-800 leading-tight mt-0.5 px-1 truncate">
                    {deal.name}
                  </h4>
                </div>
              ))
            ) : (
              <div className="col-span-2 py-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
                No top selections found
              </div>
            )}
          </div>

        </div>
      </div>

      {/* 6. Flash Sale Section */}
      <div className="px-4 py-2 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[19px] font-bold text-[#02006c] font-sans">Flash Sale</h3>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium mr-1">Closing in :</span>
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-[#ee4923] font-sans">
              <span className="bg-orange-50 px-1 py-0.5 rounded-sm">{hrs}</span>
              <span className="text-slate-300 px-0.5">:</span>
              <span className="bg-orange-50 px-1 py-0.5 rounded-sm">{mins}</span>
              <span className="text-slate-300 px-0.5">:</span>
              <span className="bg-orange-50 px-1 py-0.5 rounded-sm">{secs}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4">
          {['All', 'Newest', 'Popular', 'Clothes', 'Beauty', 'Gifts', 'Electronics', 'Toys'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveFlashTab(tab)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeFlashTab === tab 
                  ? 'bg-[#ee4923] text-white shadow-sm' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Products Grid (2 columns) */}
        <div className="grid grid-cols-2 gap-3">
          {flashDeals.length > 0 ? (
            flashDeals.slice(0, 4).map((deal) => (
              <div key={deal.id} onClick={() => navigate(`/product/${deal.id}`)} className="bg-[#F8F9FD] rounded-xl p-2 relative cursor-pointer hover:bg-slate-100 transition-colors group">
                {/* Heart Icon */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    toggleWishlist(deal);
                  }}
                  className={`absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm z-10 transition-colors ${
                    isInWishlist(deal.id) ? 'text-[#ee4923]' : 'text-slate-300 hover:text-[#ee4923]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist(deal.id) ? 'fill-current' : ''}`} />
                </button>
                
                <div className="aspect-square bg-transparent rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <img src={getImageUrl(deal.image)} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-1">
                  <h4 className="text-[11px] font-bold text-[#02006c] truncate">{deal.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[12px] font-extrabold text-[#ee4923]">₹{deal.price}</span>
                    <span className="text-[9px] text-slate-400 line-through">₹{deal.originalPrice}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-6 text-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-xl">
              No deals found in this category
            </div>
          )}
        </div>
      </div>

      {/* 6.5 Top 10 Buys Section (Sorted by Sales) */}
      <div className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[19px] font-bold text-[#02006c] font-sans">
            TOP 10 BUYS
          </h3>
          <span className="text-[10px] bg-orange-50 text-[#ee4923] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Most Popular
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
          {(topBuys.length > 0 ? topBuys : rawAllProducts
            .map(normaliseProduct)
            .filter((p, index, self) => self.findIndex(t => t.id === p.id) === index)
            .sort((a, b) => (b.sales || 0) - (a.sales || 0))
            .slice(0, 10))
            .map((buy, idx) => {
              const gradients = [
                'bg-gradient-to-b from-[#FFA781] to-[#F3557A]',
                'bg-gradient-to-b from-[#81F5FF] to-[#0A5FA6]',
                'bg-gradient-to-b from-[#E2F5FF] to-[#3B82F6]',
                'bg-gradient-to-b from-[#FFF5C6] to-[#D97706]',
                'bg-gradient-to-b from-[#D1FAE5] to-[#059669]',
                'bg-gradient-to-b from-[#F3E8FF] to-[#7C3AED]',
                'bg-gradient-to-b from-[#FFF1F2] to-[#E11D48]',
                'bg-gradient-to-b from-[#F0FDF4] to-[#16A34A]',
                'bg-gradient-to-b from-[#ECFDF5] to-[#047857]',
                'bg-gradient-to-b from-[#FFFBEB] to-[#D97706]'
              ];
              const bgGradient = gradients[idx % gradients.length];
              return (
                <div 
                  key={`top-buy-${buy.id}`} 
                  onClick={() => navigate(`/product/${buy.id}`)}
                  className={`flex-shrink-0 w-32 h-44 rounded-xl p-2.5 flex flex-col justify-between ${bgGradient} text-white relative shadow-sm cursor-pointer hover:-translate-y-1 transition-transform`}
                >
                  <div className="absolute top-1 left-2.5 text-[42px] font-black opacity-90 leading-none" style={{ fontFamily: 'sans-serif' }}>
                    {idx + 1}.
                  </div>
                  
                  <div className="mt-8 flex-grow flex items-center justify-center relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner overflow-hidden">
                      {buy.image ? (
                        <img src={getImageUrl(buy.image)} alt={buy.name} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-white/80" />
                      )}
                    </div>
                  </div>

                  <div className="z-10 mt-2">
                    <h4 className="text-[10px] font-medium leading-tight truncate">{buy.name}</h4>
                    <p className="text-[11px] font-black">{buy.discount} OFF</p>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* 6.7 Trending Brands Section */}
      <div className="px-4 py-2 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[19px] font-bold text-[#02006c] font-sans">
            TRENDING BRANDS
          </h3>
          <span className="text-[10px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
            Featured
          </span>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {getTrendingBrands().map(brand => (
            <div key={`home-brand-${brand.id}`} className="flex flex-col cursor-pointer group" onClick={() => navigate('/categories')}>
              <div className="w-full aspect-[4/3] rounded-xl bg-slate-100 relative shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center overflow-hidden border border-slate-100">
                {/* Brand Badge */}
                <div className="absolute top-0 left-2 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-b-lg shadow-sm z-10">
                  <span className={`text-[10px] font-black ${brand.badgeColor}`}>{brand.brand.toUpperCase()}</span>
                </div>

                {/* Real Product Image Covering the Card */}
                <img src={brand.image} alt={brand.brand} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              </div>
              <div className="mt-1.5 text-center">
                <p className="text-[11px] font-black text-slate-800">{brand.discount}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      </>
      ) : (
        <div className="px-4 py-2 animate-fade-in pb-10 mt-1 space-y-6">
          {/* Sub-categories row */}
          {(() => {
            const subs = subCategoryChips.filter(
              sc => sc.categoryId === selectedCategory
            );
            if (subs.length === 0) return null;

            return (
              <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 mt-2">
                {/* 'All' option for subcategory filter */}
                <div 
                  className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  onClick={() => setSelectedSubCategory('all')}
                >
                  <div className={`w-14 h-14 rounded-xl overflow-hidden border transition-all flex items-center justify-center bg-slate-50 ${selectedSubCategory === 'all' ? 'border-[#ee4923] ring-2 ring-orange-100 scale-105' : 'border-slate-100'}`}>
                    <LayoutGrid className="w-6 h-6 text-slate-400" />
                  </div>
                  <span className={`text-[10px] font-bold ${selectedSubCategory === 'all' ? 'text-[#ee4923]' : 'text-slate-700'}`}>All</span>
                </div>

                {subs.map(sub => {
                  const isSubActive = selectedSubCategory.toLowerCase() === sub.subCategoryName.toLowerCase();
                  return (
                    <div 
                      key={sub._id || sub.id} 
                      className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer w-16 text-center"
                      onClick={() => setSelectedSubCategory(sub.subCategoryName)}
                    >
                      <div className={`w-14 h-14 rounded-xl overflow-hidden border transition-all ${isSubActive ? 'border-[#ee4923] ring-2 ring-orange-100 scale-105' : 'border-orange-100 shadow-sm'}`}>
                        <img src={getImageUrl(sub.image)} alt={sub.subCategoryName} className="w-full h-full object-cover" />
                      </div>
                      <span className={`text-[10px] font-bold block truncate w-full ${isSubActive ? 'text-[#ee4923]' : 'text-slate-700'}`} title={sub.subCategoryName}>
                        {sub.subCategoryName}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Category UI: Filtered Product Grid */}
          <div>
            <div className="flex items-center justify-between mb-4 mt-2 px-1">
              <h3 className="text-[17px] font-bold text-[#02006c] capitalize">
                {selectedCategory.replace('-', ' ')} {selectedSubCategory !== 'all' ? `> ${selectedSubCategory}` : ''}
              </h3>
              <span className="text-[10px] text-[#ee4923] font-bold bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg">
                {getFilteredCategoryProducts().length} Items
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 px-1">
              {getFilteredCategoryProducts().length > 0 ? (
                getFilteredCategoryProducts().map((deal) => (
                  <ProductCard key={deal.id} product={deal} />
                ))
              ) : (
                <div className="col-span-2 py-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <LayoutGrid className="w-8 h-8 text-slate-300 mb-3" />
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Nothing here yet</h4>
                  <p className="text-[10px] text-slate-400 max-w-[200px]">
                    We are updating our catalog for this category. Check back soon!
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Dynamically append Top 10 Buys and Trending Brands */}
          
          {/* Top 10 Buys Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[17px] font-bold text-[#02006c] font-sans">
                TOP 10 BUYS
              </h3>
              <span className="text-[9px] bg-orange-50 text-[#ee4923] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Popular
              </span>
            </div>

            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
              {(topBuys.length > 0 ? topBuys : [...crazyDealsProducts, ...flashSaleProducts, ...topSelectionProducts]
                .map(normaliseProduct)
                .filter((p, index, self) => self.findIndex(t => t.id === p.id) === index)
                .sort((a, b) => (b.sales || 0) - (a.sales || 0))
                .slice(0, 10))
                .map((buy, idx) => {
                  const gradients = [
                    'bg-gradient-to-b from-[#FFA781] to-[#F3557A]',
                    'bg-gradient-to-b from-[#81F5FF] to-[#0A5FA6]',
                    'bg-gradient-to-b from-[#E2F5FF] to-[#3B82F6]'
                  ];
                  return (
                    <div 
                      key={`cat-top-buy-${buy.id}`} 
                      onClick={() => navigate(`/product/${buy.id}`)}
                      className={`flex-shrink-0 w-28 h-40 rounded-xl p-2 flex flex-col justify-between ${gradients[idx % gradients.length]} text-white relative shadow-sm cursor-pointer`}
                    >
                      <div className="absolute top-1 left-2 text-[32px] font-black opacity-90 leading-none">
                        {idx + 1}.
                      </div>
                      <div className="mt-6 flex-grow flex items-center justify-center overflow-hidden">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                          <img src={getImageUrl(buy.image)} alt={buy.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-[9px] font-medium leading-tight truncate">{buy.name}</h4>
                        <p className="text-[10px] font-black">{buy.discount} OFF</p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Trending Brands Section */}
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[17px] font-bold text-[#02006c] font-sans">
                TRENDING BRANDS
              </h3>
              <span className="text-[9px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Featured
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {getTrendingBrands().map(brand => (
                <div key={`cat-brand-${brand.id}`} className="flex flex-col cursor-pointer group" onClick={() => navigate('/categories')}>
                  <div className="w-full aspect-[4/3] rounded-xl bg-slate-100 relative overflow-hidden">
                    <div className="absolute top-0 left-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-b-lg shadow-sm z-10">
                      <span className={`text-[9px] font-black ${brand.badgeColor}`}>{brand.brand.toUpperCase()}</span>
                    </div>
                    <img src={brand.image} alt={brand.brand} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="mt-1.5 text-center">
                    <p className="text-[10px] font-black text-slate-800">{brand.discount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
