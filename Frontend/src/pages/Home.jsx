import React, { useState, useEffect } from 'react';
import { Sparkles, Gift, Gamepad2, Gem, Heart, LayoutGrid, Compass, HelpCircle, Layers, MapPin, Trophy, ShieldAlert, Truck, RotateCcw, ShieldCheck, Tag, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIES, BANNERS, VALUE_PROPS, CRAZY_DEALS } from '../data/mockData';
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

  // Auto-slide Banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

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

  // Filter deals in-place on the Home page based on search bar query AND active category tab
  const getHomeFilteredDeals = () => {
    let items = CRAZY_DEALS;

    // 1. Search Query filter
    if (searchQuery) {
      items = items.filter((deal) =>
        deal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deal.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (selectedCategory) {
      case 'for-you':
        return items;
      case 'beauty':
        return items.filter((p) => ['tint', 'makeup', 'skincare', 'haircare'].includes(p.type));
      case 'gifting':
        return items.filter((p) => ['tee', 'necklace', 'watch', 'mug', 'tumbler', 'keychain', 'hamper', 'bouquet'].includes(p.type));
      case 'electronics':
        return items.filter((p) => ['earbuds', 'powerbank', 'fan', 'headphones', 'smartwatch'].includes(p.type));
      case 'jewellery':
        return items.filter((p) => ['necklace', 'bracelet', 'watch'].includes(p.type));
      case 'toys':
        return items.filter((p) => ['plush', 'toy', 'nightlight'].includes(p.type));
      case 'stationery':
        return items.filter((p) => ['notebook', 'pen', 'stapler'].includes(p.type));
      case 'fashion':
        return items.filter((p) => ['tee', 'necklace', 'watch', 'pants', 'blouse', 'outfit'].includes(p.type));
      case 'electrical':
        return items.filter((p) => ['bulb', 'wire', 'fan', 'iron'].includes(p.type));
      default:
        return items;
    }
  };

  const filteredDeals = getHomeFilteredDeals();

  const getFlashFilteredDeals = () => {
    let items = CRAZY_DEALS;
    switch (activeFlashTab) {
      case 'All':
        return items;
      case 'Newest':
        return items.slice().reverse();
      case 'Popular':
        return items.filter(d => d.rating >= 4.8);
      case 'Clothes':
        return items.filter(d => d.type === 'tee');
      case 'Beauty':
        return items.filter(d => d.type === 'tint');
      case 'Gifts':
        return items.filter(d => d.type === 'necklace' || d.type === 'watch' || d.type === 'tint');
      case 'Electronics':
        return items.filter(d => d.type === 'watch');
      case 'Toys':
        return []; // placeholder
      default:
        return items;
    }
  };

  const flashDeals = getFlashFilteredDeals();

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
            <rect x="22" y="52" width="56" height="18" rx="6" fill="#FF6E54" />
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

  return (
    <div className="flex-grow space-y-3.5 pb-6 animate-fade-in">
      
      {/* 1. Ultra-Compact Category strip with minimized gaps and in-place active states */}
      <div className="flex items-center gap-1 overflow-x-auto px-2 py-1.5 bg-white border-b border-slate-50 scrollbar-none scroll-smooth">
        {CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                // Active that category in-place! NO redirect navigation!
              }}
              className="flex flex-col items-center gap-0.5 flex-shrink-0 cursor-pointer transition-all duration-300 min-w-[52px]"
            >
              {/* Ultra-Compact Card box for only the icon */}
              <div className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all duration-300 ${
                isActive 
                  ? 'bg-[#FF6E54] border-[#FF6E54] text-white shadow-xs' 
                  : 'bg-white border-orange-200 text-[#02006c] hover:border-[#FF6E54]/40'
              }`}>
                {renderCategoryIcon(cat.id, isActive)}
              </div>

              {/* Centered label below */}
              <div className="flex flex-col items-center gap-0.5">
                <span className={`text-[8.5px] tracking-tight transition-colors ${
                  isActive ? 'font-black text-[#02006c]' : 'font-bold text-slate-500'
                }`}>
                  {cat.name}
                </span>
                
                {/* Active Indicator Underline centered beneath label */}
                {isActive && (
                  <span className="w-4 h-[1.5px] bg-[#FF6E54] rounded-full"></span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Banner Slider (Hero Banner Section) */}
      <div className="px-2 relative">
        <div className="overflow-hidden rounded-xl border border-slate-100 shadow-sm relative h-32">
          {BANNERS.map((banner, idx) => (
            <div
              key={banner.id}
              className={`absolute inset-0 p-4 flex flex-col justify-center gap-1.5 transition-all duration-700 ease-in-out ${
                idx === activeBanner 
                  ? 'opacity-100 translate-x-0 scale-100' 
                  : 'opacity-0 translate-x-8 scale-95 pointer-events-none'
              } ${banner.bg}`}
            >
              {/* Text Layout */}
              <div className="max-w-[65%] space-y-0.5">
                <span className="text-[9px] font-extrabold tracking-widest text-[#FF6E54] uppercase">
                  {banner.title}
                </span>
                <h2 className={`text-[15px] font-extrabold leading-tight tracking-tight ${banner.textColor}`}>
                  {banner.subtitle}
                </h2>
                <p className="text-[9px] text-slate-500 font-medium">
                  {banner.desc}
                </p>
              </div>

              {/* Action Button */}
              <button 
                onClick={() => navigate('/categories')}
                className="bg-[#FF6E54] hover:bg-orange-600 active:scale-95 text-white text-[8.5px] font-extrabold px-3 py-1.5 rounded-full shadow-md shadow-orange-500/20 w-fit transition-all duration-300 mt-0.5"
              >
                {banner.cta}
              </button>

              {/* Image Graphic Layout inside banner */}
              <div className="absolute right-1 bottom-0 top-0 w-28 flex items-center justify-center">
                {banner.id === 1 ? (
                  // Custom Teddy Bear Vector Illustration
                  <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-md">
                    <circle cx="50" cy="74" r="22" fill="#FECDD3" />
                    <circle cx="50" cy="46" r="18" fill="#FDA4AF" />
                    {/* Ears */}
                    <circle cx="32" cy="32" r="8" fill="#FDA4AF" />
                    <circle cx="68" cy="32" r="8" fill="#FDA4AF" />
                    <ellipse cx="50" cy="50" r="7" rx="6" ry="4" fill="#FFE4E6" />
                    <ellipse cx="50" cy="48" r="2.5" fill="#475569" />
                    <circle cx="44" cy="42" r="2" fill="#0F172A" />
                    <circle cx="56" cy="42" r="2" fill="#0F172A" />
                    <path d="M45 58c1.5 2 3.5 2 5 0" stroke="#F43F5E" strokeWidth="2" fill="none" />
                  </svg>
                ) : (
                  // Custom Gift Illustration
                  <svg viewBox="0 0 100 100" className="w-20 h-20 drop-shadow-md animate-pulse">
                    <rect x="25" y="38" width="50" height="42" rx="4" fill="#F97316" />
                    <rect x="20" y="32" width="60" height="8" rx="2" fill="#EA580C" />
                    {/* Ribbon */}
                    <rect x="46" y="32" width="8" height="48" fill="#FEF08A" />
                    <circle cx="50" cy="24" r="6" fill="#FDE047" />
                  </svg>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Indicators */}
        <div className="flex justify-center items-center gap-1.5 mt-1">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveBanner(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeBanner ? 'w-4 bg-[#FF6E54]' : 'w-1.5 bg-slate-200'
              }`}
            ></button>
          ))}
        </div>
      </div>

      {/* CONDITIONAL RENDER: "For You" vs Other Categories */}
      {selectedCategory === 'for-you' ? (
        <>
          {/* 3. Mynzo Trust Stamps (Value Props) */}
          <div className="px-4 -mt-2">
        <div className="grid grid-cols-4 gap-2">
          {VALUE_PROPS.map((prop) => (
            <div 
              key={prop.id} 
              className="flex flex-col items-center justify-center rounded-lg bg-white border border-orange-200 p-1 py-1.5 shadow-3xs hover:border-[#FF6E54] hover:scale-[1.01] active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {/* Colored Stamp Icon box with soft blue and blue icon */}
              <div className="w-6.5 h-6.5 bg-blue-50 text-[#02006c] rounded-md flex items-center justify-center mb-0.75 shadow-3xs">
                {prop.id === 1 && <Truck className="w-3.5 h-3.5 stroke-[2.2]" />}
                {prop.id === 2 && <RotateCcw className="w-3.5 h-3.5 stroke-[2.2]" />}
                {prop.id === 3 && <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />}
                {prop.id === 4 && <Tag className="w-3.5 h-3.5 stroke-[2.2]" />}
              </div>
              <h5 className="text-[7.5px] font-bold text-[#02006c] leading-tight text-center">{prop.title}</h5>
              <p className="text-[6.5px] text-slate-400 font-medium leading-none mt-0.5 text-center">{prop.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Crazy Deals Horizontal Scroll List (Custom Compact & Soft Orange Canvas Layout) */}
      <div className="px-4 space-y-2.5">
        
        {/* Title Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span 
              className="text-xl font-extrabold text-[#02006c] flex items-center gap-1.5"
              style={{ fontFamily: "'Times New Roman', Times, Georgia, serif" }}
            >
              Crazy Deals
            </span>
            <span className="text-[10px] text-slate-400 font-bold tracking-tight">
              (Like, really crazy!)
            </span>
          </div>
          <button 
            onClick={() => navigate('/crazy-deals')}
            className="text-xs font-black text-[#FF6E54] hover:underline"
          >
            See All
          </button>
        </div>

        {/* Ticking Countdown Timer */}
        <div className="flex items-center gap-1 text-[12px] font-black text-[#FF6E54] tracking-wide -mt-1.5">
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
                    <span className="absolute top-1.5 left-1.5 bg-[#FF6E54] text-white text-[7.5px] font-black px-1.5 py-0.5 rounded-lg shadow-3xs z-10">
                      {deal.discount}
                    </span>

                    {/* Real Image loaded from assets/CrazyDeals */}
                    <img 
                      src={deal.image} 
                      alt={deal.name}
                      className="w-18 h-18 object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Title */}
                  <h4 className="text-[10.5px] font-bold text-[#02006c] truncate mt-1.5 px-0.5 tracking-tight">
                    {deal.name}
                  </h4>
                </div>

                {/* Pricing row (No cart button, no description) */}
                <div className="flex items-center gap-1.5 mt-0.5 px-0.5 leading-none">
                  <span className="text-[10.5px] font-extrabold text-[#FF6E54]">₹{deal.price}</span>
                  <span className="text-[8.5px] text-slate-400 font-bold line-through">₹{deal.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback empty state */
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6 text-center space-y-2">
            <ShieldAlert className="w-8 h-8 text-[#FF6E54] mx-auto opacity-75" />
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
            <h3 className="text-[17px] font-semibold tracking-wide text-[#02006c]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
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
            
            {/* 1. Oversized Tee (Comfort Fit Tee) */}
            <div 
              onClick={() => navigate('/categories')}
              className="bg-white border border-[#FF6E54] rounded-lg p-2.5 pb-3.5 flex flex-col justify-between shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              <div>
                <div className="bg-[#F8F9FD] rounded-md w-full aspect-square flex items-center justify-center mb-2 relative overflow-hidden group">
                  <img src={CrazyDeals2} alt="Vintage Oversized Tee" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[9.5px] font-medium text-slate-400 tracking-tight leading-normal px-1">
                  Vintage Oversized Tee
                </span>
              </div>
              <h4 className="text-[12.5px] font-bold text-slate-800 leading-tight mt-0.5 px-1">
                Comfort Fit Tee
              </h4>
            </div>

            {/* 2. Layered Necklace (Gold Plated Jewelry) */}
            <div 
              onClick={() => navigate('/categories')}
              className="bg-white border border-[#FF6E54] rounded-lg p-2.5 pb-3.5 flex flex-col justify-between shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              <div>
                <div className="bg-[#F8F9FD] rounded-md w-full aspect-square flex items-center justify-center mb-2 relative overflow-hidden group">
                  <img src={CrazyDeals3} alt="Layered Charm Necklace" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[9.5px] font-medium text-slate-400 tracking-tight leading-normal px-1">
                  Layered Charm Necklace
                </span>
              </div>
              <h4 className="text-[12.5px] font-bold text-slate-800 leading-tight mt-0.5 px-1">
                Gold Plated Jewelry
              </h4>
            </div>

            {/* 3. Vintage Watch (Gold Chain Dial) */}
            <div 
              onClick={() => navigate('/categories')}
              className="bg-white border border-[#FF6E54] rounded-lg p-2.5 pb-3.5 flex flex-col justify-between shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              <div>
                <div className="bg-[#F8F9FD] rounded-md w-full aspect-square flex items-center justify-center mb-2 relative overflow-hidden group">
                  <img src={CrazyDeals4} alt="Vintage Luxury Watch" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[9.5px] font-medium text-slate-400 tracking-tight leading-normal px-1">
                  Vintage Luxury Watch
                </span>
              </div>
              <h4 className="text-[12.5px] font-bold text-slate-800 leading-tight mt-0.5 px-1">
                Gold Chain Dial
              </h4>
            </div>

            {/* 4. Benetint Lip Tint (Cheek & Lip Stain) */}
            <div 
              onClick={() => navigate('/categories')}
              className="bg-white border border-[#FF6E54] rounded-lg p-2.5 pb-3.5 flex flex-col justify-between shadow-2xs cursor-pointer hover:scale-[1.01] active:scale-95 transition-all duration-300"
            >
              <div>
                <div className="bg-[#F8F9FD] rounded-md w-full aspect-square flex items-center justify-center mb-2 relative overflow-hidden group">
                  <img src={CrazyDeals5} alt="Benetint Lip Tint" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[9.5px] font-medium text-slate-400 tracking-tight leading-normal px-1">
                  Benetint Lip Tint
                </span>
              </div>
              <h4 className="text-[12.5px] font-bold text-slate-800 leading-tight mt-0.5 px-1">
                Cheek & Lip Stain
              </h4>
            </div>

          </div>

        </div>
      </div>

      {/* 6. Flash Sale Section */}
      <div className="px-4 py-2 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-[#02006c]">Flash Sale</h3>
          <div className="flex items-center gap-1">
            <span className="text-[10px] text-slate-400 font-medium mr-1">Closing in :</span>
            <div className="flex items-center gap-0.5 text-[10px] font-bold text-[#FF6E54]">
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
                  ? 'bg-[#FF6E54] text-white shadow-sm' 
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
                    isInWishlist(deal.id) ? 'text-[#FF6E54]' : 'text-slate-300 hover:text-[#FF6E54]'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${isInWishlist(deal.id) ? 'fill-current' : ''}`} />
                </button>
                
                <div className="aspect-square bg-transparent rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="px-1">
                  <h4 className="text-[11px] font-bold text-[#02006c] truncate">{deal.name}</h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[12px] font-extrabold text-[#FF6E54]">₹{deal.price}</span>
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
      </>
      ) : selectedCategory === 'beauty' ? (
        <div className="px-4 py-2 animate-fade-in space-y-8 pb-10">
          
          {/* 1. Sub-categories */}
          <div className="flex gap-4 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4 mt-2">
            {BEAUTY_SUB_CATEGORIES.map(sub => (
              <div key={sub.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer">
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
                  <img src={sub.icon} alt={sub.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[10px] font-bold text-slate-700">{sub.name}</span>
              </div>
            ))}
          </div>

          {/* 2. Top 10 beauty buys */}
          <div>
            <h3 className="text-[15px] font-black text-slate-800 mb-3 tracking-tight">Top 10 beauty buys</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 -mx-4 px-4">
              {TOP_10_BUYS.map(buy => (
                <div key={buy.id} className={`flex-shrink-0 w-32 h-44 rounded-xl p-2.5 flex flex-col justify-between ${buy.bg} text-white relative shadow-sm cursor-pointer hover:-translate-y-1 transition-transform`}>
                  <div className="absolute top-1 left-2.5 text-[42px] font-black opacity-90 leading-none" style={{ fontFamily: 'sans-serif' }}>
                    {buy.rank}.
                  </div>
                  
                  <div className="mt-8 flex-grow flex items-center justify-center relative z-10">
                    <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-inner overflow-hidden">
                      {buy.image ? (
                        <img src={buy.image} alt={buy.name} className="w-full h-full object-cover" />
                      ) : (
                        <Sparkles className="w-8 h-8 text-white/80" />
                      )}
                    </div>
                  </div>

                  <div className="z-10 mt-2">
                    <h4 className="text-[10px] font-medium leading-tight truncate">{buy.name}</h4>
                    <p className="text-[11px] font-black">{buy.discount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Trending brands */}
          <div>
            <h3 className="text-[15px] font-black text-slate-800 mb-3 tracking-tight">Trending brands</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">
              {TRENDING_BRANDS.map(brand => (
                <div key={brand.id} className="flex flex-col cursor-pointer group">
                  <div className="w-full aspect-[4/3] rounded-xl bg-slate-100 relative shadow-sm hover:shadow-md transition-shadow flex items-center justify-center overflow-hidden">
                    {/* Brand Badge */}
                    <div className="absolute top-0 left-2 bg-white/95 backdrop-blur-md px-2 py-1 rounded-b-lg shadow-sm z-10">
                      <span className={`text-[10px] font-black ${brand.badgeColor}`}>{brand.brand}</span>
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
          
        </div>
      ) : selectedCategory === 'electronics' ? (
        <div className="px-3 py-2 animate-fade-in pb-10 mt-1">
          <div className="grid grid-cols-5 gap-x-3 gap-y-5 pt-2 pb-2 w-full">
            {filteredDeals.map((deal) => (
              <div 
                key={deal.id} 
                className="flex flex-col items-center gap-1 cursor-pointer group w-full" 
                onClick={() => navigate(`/product/${deal.id}`)}
              >
                {/* Small 3D Base Platform */}
                <div className="w-full aspect-square bg-[#F3E8FF] rounded-xl relative shadow-[0_3px_0_0_#E9D5FF] flex items-center justify-center group-hover:translate-y-0.5 group-hover:shadow-[0_1px_0_0_#E9D5FF] transition-all">
                  <img 
                    src={deal.image} 
                    alt={deal.name} 
                    className="absolute bottom-[5%] w-[85%] h-[85%] object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <span className="text-[8.5px] font-bold text-slate-800 text-center leading-tight line-clamp-2 px-0.5 mt-0.5 w-full">
                  {deal.name}
                </span>
              </div>
            ))}
          </div>

          {/* Top Electronics Section */}
          <div className="mt-8 px-1">
            <h3 className="text-[17px] font-black text-slate-900 tracking-tight mb-4">Top Electronics</h3>
            <div className="grid grid-cols-2 gap-3">
              {filteredDeals.map((deal) => (
                <ProductCard key={`elec-top-${deal.id}`} product={deal} />
              ))}
            </div>
          </div>
        </div>
      ) : selectedCategory === 'gifting' ? (
        <div className="px-3 py-2 animate-fade-in pb-10 mt-1">
          <div className="grid grid-cols-5 gap-x-3 gap-y-5 pt-2 pb-2 w-full">
            {filteredDeals.map((deal) => (
              <div 
                key={deal.id} 
                className="flex flex-col items-center gap-1 cursor-pointer group w-full" 
                onClick={() => navigate(`/product/${deal.id}`)}
              >
                {/* Small 3D Base Platform */}
                <div className="w-full aspect-square bg-[#F3E8FF] rounded-xl relative shadow-[0_3px_0_0_#E9D5FF] flex items-center justify-center group-hover:translate-y-0.5 group-hover:shadow-[0_1px_0_0_#E9D5FF] transition-all">
                  <img 
                    src={deal.image} 
                    alt={deal.name} 
                    className="absolute bottom-[5%] w-[85%] h-[85%] object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <span className="text-[8.5px] font-bold text-slate-800 text-center leading-tight line-clamp-2 px-0.5 mt-0.5 w-full">
                  {deal.name}
                </span>
              </div>
            ))}
          </div>

          {/* BEST ON A BUDGET SECTION */}
          <div className="mt-8 px-1 pb-4">
            <div className="flex items-center justify-between mb-4 pr-1">
              <h3 className="text-[17px] font-black text-slate-900 tracking-tight">Best on a budget</h3>
              <button 
                onClick={() => setBudgetFilter(null)}
                className={`text-[10px] font-bold px-3 py-1 rounded-full transition-colors shadow-sm ${
                  budgetFilter === null 
                    ? 'bg-[#CD97FE] text-white' 
                    : 'bg-slate-100 text-slate-500 hover:bg-purple-50 hover:text-purple-600'
                }`}
              >
                All
              </button>
            </div>
            <div className="grid grid-cols-3 gap-x-3 gap-y-5">
              {[
                { id: 1, line1: 'From', line2: '₹99', coin: 'bottom-left', coinSize: 'w-6 h-6', coinPos: '-bottom-1.5 -left-1' },
                { id: 2, line1: 'From', line2: '₹299', coin: 'top-right', coinSize: 'w-5 h-5', coinPos: '-top-1.5 right-0' },
                { id: 3, line1: 'From', line2: '₹499', coin: 'bottom-left', coinSize: 'w-5 h-5', coinPos: '-bottom-1 -left-1' },
                { id: 4, line1: 'Min.', line2: '70%', line3: 'Off', coin: 'top-right', coinSize: 'w-4 h-4', coinPos: '-top-0.5 -right-0.5' },
                { id: 5, line1: 'From', line2: '₹999', coin: 'top-top', coinSize: 'w-5 h-5', coinPos: '-top-1.5 right-4' },
                { id: 6, line1: 'Min.', line2: '50%', line3: 'Off', coin: 'bottom-right', coinSize: 'w-3.5 h-3.5', coinPos: 'bottom-1 -right-0.5' }
              ].map(badge => {
                const isSelected = budgetFilter === badge.id;
                return (
                <div 
                  key={badge.id} 
                  className={`relative w-full aspect-square cursor-pointer transition-transform flex items-center justify-center group ${isSelected ? 'scale-105 drop-shadow-md ring-2 ring-purple-400 rounded-full' : 'hover:scale-105'}`}
                  onClick={() => setBudgetFilter(budgetFilter === badge.id ? null : badge.id)}
                >
                  {/* Scalloped SVG Background */}
                  <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-[#CD97FE] drop-shadow-sm">
                    <path fill="currentColor" d="M50 3 C 58 3 61 9 67 11 C 74 13 78 8 83 14 C 88 20 83 25 86 31 C 88 38 95 40 95 48 C 95 56 88 58 86 65 C 83 71 88 76 83 82 C 78 88 74 83 67 85 C 61 87 58 93 50 93 C 42 93 39 87 33 85 C 26 83 22 88 17 82 C 12 76 17 71 14 65 C 12 58 5 56 5 48 C 5 40 12 38 14 31 C 17 25 12 20 17 14 C 22 8 26 13 33 11 C 39 9 42 3 50 3 Z" />
                    {/* Dotted texture overlay */}
                    <circle cx="30" cy="30" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="70" cy="30" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="30" cy="70" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="70" cy="70" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="50" cy="20" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="50" cy="80" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="20" cy="50" r="1.5" fill="white" opacity="0.25" />
                    <circle cx="80" cy="50" r="1.5" fill="white" opacity="0.25" />
                  </svg>
                  
                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center justify-center text-white drop-shadow-sm mt-1">
                    <span className="text-[11px] font-extrabold leading-tight">{badge.line1}</span>
                    <span className="text-[18px] font-black leading-none my-0.5 tracking-tight" style={{textShadow: '1px 1px 0px rgba(0,0,0,0.1)'}}>{badge.line2}</span>
                    {badge.line3 && <span className="text-[11px] font-extrabold leading-tight">{badge.line3}</span>}
                  </div>

                  {/* Coin Decoration */}
                  <div className={`absolute ${badge.coinPos} ${badge.coinSize} bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-b-[2px] border-r-[1px] border-yellow-600 shadow-md z-20 group-hover:rotate-12 transition-transform`} />
                </div>
              )})}
            </div>
          </div>

          {/* GIFTS YOU LIKE SECTION */}
          <div className="mt-8 px-1">
            <h3 className="text-[17px] font-black text-slate-900 tracking-tight mb-4">Gifts you like</h3>
            <div className="grid grid-cols-2 gap-3">
              {(() => {
                let displayDeals = filteredDeals;
                if (budgetFilter === 1) displayDeals = displayDeals.filter(d => d.price < 299);
                if (budgetFilter === 2) displayDeals = displayDeals.filter(d => d.price >= 299 && d.price < 499);
                if (budgetFilter === 3) displayDeals = displayDeals.filter(d => d.price >= 499 && d.price < 999);
                if (budgetFilter === 5) displayDeals = displayDeals.filter(d => d.price >= 999);
                if (budgetFilter === 4) displayDeals = displayDeals.filter(d => (parseInt(d.discount.replace(/\D/g, '')) || 0) >= 70);
                if (budgetFilter === 6) displayDeals = displayDeals.filter(d => (parseInt(d.discount.replace(/\D/g, '')) || 0) >= 50);

                if (displayDeals.length === 0) {
                  return <div className="col-span-2 text-center text-slate-400 text-sm py-4">No gifts found for this filter.</div>;
                }

                return displayDeals.map((deal) => (
                  <ProductCard key={`gift-like-${deal.id}`} product={deal} />
                ));
              })()}
            </div>
          </div>
        </div>
      ) : (
        <div className="px-3 py-2 animate-fade-in pb-10 mt-1">
          {/* Dynamic Top Horizontal Grid (Purple 3D Blocks) */}
          <div className="grid grid-cols-5 gap-x-3 gap-y-5 pt-2 pb-6 w-full">
            {filteredDeals.map((deal) => (
              <div 
                key={`top-${deal.id}`} 
                className="flex flex-col items-center gap-1 cursor-pointer group w-full" 
                onClick={() => navigate(`/product/${deal.id}`)}
              >
                {/* Small 3D Base Platform */}
                <div className="w-full aspect-square bg-[#F3E8FF] rounded-xl relative shadow-[0_3px_0_0_#E9D5FF] flex items-center justify-center group-hover:translate-y-0.5 group-hover:shadow-[0_1px_0_0_#E9D5FF] transition-all">
                  <img 
                    src={deal.image} 
                    alt={deal.name} 
                    className="absolute bottom-[5%] w-[85%] h-[85%] object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-300" 
                  />
                </div>
                <span className="text-[8.5px] font-bold text-slate-800 text-center leading-tight line-clamp-2 px-0.5 mt-0.5 w-full">
                  {deal.name}
                </span>
              </div>
            ))}
          </div>

          {/* Category UI: Filtered Product Grid */}
          <div className="flex items-center justify-between mb-4 mt-2 px-1">
            <h3 className="text-[17px] font-bold text-[#02006c] capitalize">
              {selectedCategory.replace('-', ' ')}
            </h3>
            <span className="text-[10px] text-[#FF6E54] font-bold bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-lg">
              {filteredDeals.length} Items
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 pb-8 px-1">
            {filteredDeals.length > 0 ? (
              filteredDeals.map((deal) => (
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
      )}

    </div>
  );
}

