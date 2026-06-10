import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronLeft, LayoutGrid } from 'lucide-react';
import { CATEGORIES, CRAZY_DEALS } from '../data/mockData';
import { useApp } from '../context/AppContext';
import ProductCard from '../components/ui/ProductCard';

// Category Images
import catForYou from '../assets/CategorySection/categoryForU-removebg-preview.png';
import cat1 from '../assets/CategorySection/Category1-removebg-preview.png';
import cat2 from '../assets/CategorySection/Category2-removebg-preview.png';
import cat3 from '../assets/CategorySection/Category3-removebg-preview.png';
import cat4 from '../assets/CategorySection/Category4-removebg-preview.png';
import cat5 from '../assets/CategorySection/Category5-removebg-preview.png';
import cat6 from '../assets/CategorySection/Category6-removebg-preview.png';
import cat7 from '../assets/CategorySection/Category7-removebg-preview.png';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery } = useApp();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('for-you');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');

  const [sortBy, setSortBy] = useState('none'); // 'none', 'price-low', 'price-high', 'rating'
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const [categories, setCategories] = useState(CATEGORIES);
  const [subCategories, setSubCategories] = useState([]);
  const [rawProducts, setRawProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryChips = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/chips`);
        const data = await res.json();
        if (res.ok && data.success && data.chips && data.chips.length > 0) {
          const activeChips = data.chips.filter(c => c.active && c.id !== 'for-you');
          const forYouChip = CATEGORIES.find(c => c.id === 'for-you');
          setCategories([forYouChip, ...activeChips]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    const fetchSubCategoryChips = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/subchips`);
        const data = await res.json();
        if (res.ok && data.success && data.subchips) {
          const activeSubChips = data.subchips.filter(sc => sc.active);
          setSubCategories(activeSubChips);
        }
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/products?status=Approved`);
        const data = await res.json();
        if (res.ok && data.success && data.products) {
          setRawProducts(data.products);
        }
      } catch (err) {
        console.error('Error fetching products (CategoriesPage):', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryChips();
    fetchSubCategoryChips();
    fetchProducts();
  }, []);

  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedCategory]);

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

  // Sync with URL parameter (e.g. when navigated from Home category capsule)
  useEffect(() => {
    const catParam = searchParams.get('cat');
    if (catParam && categories.some(c => c.id === catParam)) {
      setSelectedCategory(catParam);
    }
  }, [searchParams, categories]);

  // Category Image drawer
  const renderCatIcon = (id, isActive) => {
    let imgSrc = null;
    switch (id) {
      case 'for-you': imgSrc = catForYou; break;
      case 'beauty': imgSrc = cat1; break;
      case 'toys': imgSrc = cat2; break; // teddy bear
      case 'jewellery': imgSrc = cat3; break; // woman with necklace
      case 'electronics': imgSrc = cat4; break; // home appliances
      case 'stationery': imgSrc = cat5; break; // pencils
      case 'fashion': imgSrc = cat6; break;
      case 'gifting': imgSrc = cat7; break;
      case 'electrical': imgSrc = cat4; break;
      default: imgSrc = catForYou;
    }

    if (!imgSrc) return null;

    return (
      <img 
        src={imgSrc} 
        alt={id} 
        className={`w-[36px] h-[36px] object-contain drop-shadow-sm transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
      />
    );
  };

  // Normalise API product to match the shape the UI expects
  const normaliseProduct = (p) => ({
    id: p._id || p.id,
    name: p.name,
    desc: p.description || '',
    price: p.sellingPrice,
    originalPrice: p.mrp || p.sellingPrice,
    discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
    rating: p.rating || 0,
    type: (p.category || '').toLowerCase(),
    subCategory: p.subCategory ? p.subCategory.toLowerCase() : '',
    image: p.images && p.images[0] ? p.images[0] : '',
    brandName: p.brandName || 'Mynzo Originals',
    flags: p.flags || {},
    stock: p.stock || 0,
    sales: p.sales || 0,
  });

  // Category product filter mapper
  const getFilteredProducts = () => {
    let items = rawProducts.map(normaliseProduct);
    if (searchQuery) {
      items = items.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    let filtered = [];
    if (selectedCategory === 'for-you') {
      filtered = items;
    } else {
      filtered = items.filter((p) => p.type.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Filter by subcategory if one is active
    if (selectedSubCategory !== 'all') {
      const activeSubChip = subCategories.find(sc => sc.id === selectedSubCategory);
      if (activeSubChip) {
        const targetName = activeSubChip.subCategoryName.toLowerCase();
        filtered = filtered.filter(
          (p) => p.subCategory.toLowerCase() === targetName || p.subCategory.toLowerCase() === selectedSubCategory.toLowerCase()
        );
      } else {
        filtered = filtered.filter(
          (p) => p.subCategory.toLowerCase() === selectedSubCategory.toLowerCase()
        );
      }
    }

    // Apply sorting
    if (sortBy === 'price-low') {
      return [...filtered].sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      return [...filtered].sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      return [...filtered].sort((a, b) => b.rating - a.rating);
    }

    return filtered;
  };

  const filteredProducts = getFilteredProducts();

  return (
    <div className="h-full flex flex-col bg-white overflow-hidden">
      {/* Elevated Sticky Header */}
      <header className="sticky top-0 bg-[#ee4923] border-b border-[#ee4923] px-4 py-3 flex items-center justify-between z-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate(-1)}
            className="p-1 bg-white hover:bg-white/90 border border-transparent rounded-full shadow-2xs transition-colors active:scale-95 cursor-pointer text-[#ee4923]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-black text-white tracking-wide uppercase font-syne">
              Discover <span>Mynzo</span>
            </h1>
            <p className="text-[10px] text-white/90 font-bold uppercase tracking-widest font-sans mt-0.5">
              Trend Starts Here
            </p>
          </div>
        </div>
        
        {/* Pulsing Active Badge */}
        <div className="flex items-center gap-1 bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
          <span className="w-2 h-2 bg-white rounded-full animate-ping"></span>
          <span className="text-[9px] font-bold uppercase tracking-wider">Live Catalog</span>
        </div>
      </header>

      <div className="flex-grow flex animate-fade-in overflow-hidden">
        
        {/* 1. Vertical Sidebar Category Navigation */}
        <div className="w-[72px] bg-[#02006c]/[0.02] border-r border-slate-100 flex flex-col items-center pt-2 pb-2 overflow-y-auto scrollbar-none gap-3 flex-shrink-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const labelText = cat.categoryName || cat.name;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className="flex flex-col items-center w-full relative pb-1 group cursor-pointer"
              >
                <div className="relative w-[52px] h-[52px] flex items-center justify-center">
                  {/* Background Cover */}
                  {isActive ? (
                    <motion.div 
                      layoutId="activeCategoryCapsule"
                      className="absolute inset-0 rounded-xl bg-[#ee4923] shadow-md shadow-[#ee4923]/30"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  ) : (
                    <div className="absolute inset-0 rounded-xl bg-orange-50 group-hover:bg-orange-100 transition-colors duration-300" />
                  )}
                  
                  {/* Image Icon */}
                  <div className="relative z-10 flex items-center justify-center">
                    {cat.image ? (
                      <img 
                        src={getImageUrl(cat.image)} 
                        alt={labelText} 
                        className={`w-[36px] h-[36px] object-contain drop-shadow-sm transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`} 
                      />
                    ) : (
                      renderCatIcon(cat.id, isActive)
                    )}
                  </div>
                </div>

                {/* Text Label */}
                <span className={`text-[10px] leading-tight font-bold tracking-tight select-none px-1 text-center mt-1 transition-colors ${
                  isActive ? 'text-[#0F172A] font-bold' : 'text-slate-500 font-semibold'
                }`}>
                  {labelText}
                </span>
                
                {/* Active Indicator Line (Vertical Left) */}
                {isActive && (
                  <motion.div 
                    layoutId="activeCategoryLine"
                    className="absolute left-0 top-1 bottom-1 w-1 bg-[#02006c] rounded-r-full z-20"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* 2. Main filtered products catalog grid */}
        <div className="flex-grow p-2.5 overflow-y-auto space-y-3 bg-[#ff7400]/15 relative">
        
        {/* Title bar */}
        <div className="flex items-center justify-between border-b border-slate-50 pb-2 relative z-20 px-1">
          <div className="space-y-0.5">
            <h3 className="text-xs font-bold text-[#02006c] uppercase tracking-wider">
              {categories.find((c) => c.id === selectedCategory)?.categoryName || categories.find((c) => c.id === selectedCategory)?.name || "Catalog"}
            </h3>
            <p className="text-[8px] text-[#02006c]/60 font-bold uppercase tracking-widest">
              {filteredProducts.length} items found
            </p>
          </div>
          <div className="relative">
            <Filter 
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className={`w-4 h-4 cursor-pointer transition-colors ${showSortDropdown ? 'text-[#ee4923]' : 'text-[#02006c]/70 hover:text-[#02006c]'}`} 
            />
            {showSortDropdown && (
              <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-100 rounded-lg shadow-lg py-1 z-30 animate-fade-in text-[10px]">
                <button 
                  onClick={() => { setSortBy('none'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 font-bold ${sortBy === 'none' ? 'text-[#ee4923]' : 'text-slate-600'}`}
                >
                  DEFAULT
                </button>
                <button 
                  onClick={() => { setSortBy('price-low'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 font-bold ${sortBy === 'price-low' ? 'text-[#ee4923]' : 'text-slate-600'}`}
                >
                  PRICE: LOW TO HIGH
                </button>
                <button 
                  onClick={() => { setSortBy('price-high'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 font-bold ${sortBy === 'price-high' ? 'text-[#ee4923]' : 'text-slate-600'}`}
                >
                  PRICE: HIGH TO LOW
                </button>
                <button 
                  onClick={() => { setSortBy('rating'); setShowSortDropdown(false); }}
                  className={`w-full text-left px-3 py-1.5 hover:bg-orange-50 font-bold ${sortBy === 'rating' ? 'text-[#ee4923]' : 'text-slate-600'}`}
                >
                  TOP RATED
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Horizontal Subcategories Scroll */}
        {selectedCategory !== 'for-you' && subCategories.filter(sc => sc.categoryId.toLowerCase() === selectedCategory.toLowerCase()).length > 0 && (
          <div className="flex overflow-x-auto gap-3 py-2.5 scrollbar-none snap-x relative z-20 px-1.5 flex-shrink-0 bg-white/40 backdrop-blur-md rounded-2xl border border-white/50 shadow-3xs">
            <button
              onClick={() => setSelectedSubCategory('all')}
              className="flex flex-col items-center w-[48px] group cursor-pointer flex-shrink-0 snap-start"
            >
              <div className="relative w-[44px] h-[44px] flex items-center justify-center">
                {selectedSubCategory === 'all' ? (
                  <div className="absolute inset-0 rounded-lg bg-[#ee4923] shadow-md shadow-[#ee4923]/25" />
                ) : (
                  <div className="absolute inset-0 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors duration-300" />
                )}
                <div className="relative z-10 flex items-center justify-center">
                  <LayoutGrid className={`w-5 h-5 transition-all duration-300 ${selectedSubCategory === 'all' ? 'text-white scale-110' : 'text-[#ee4923]'}`} />
                </div>
              </div>
              <span className={`text-[8.5px] leading-tight font-black tracking-tight select-none px-0.5 text-center mt-1 transition-colors ${
                selectedSubCategory === 'all' ? 'text-[#0F172A]' : 'text-slate-500'
              }`}>
                ALL
              </span>
            </button>
            {subCategories.filter(sc => sc.categoryId.toLowerCase() === selectedCategory.toLowerCase()).map((sub) => {
              const isSubActive = selectedSubCategory === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubCategory(sub.id)}
                  className="flex flex-col items-center w-[48px] group cursor-pointer flex-shrink-0 snap-start"
                >
                  <div className="relative w-[44px] h-[44px] flex items-center justify-center">
                    {isSubActive ? (
                      <div className="absolute inset-0 rounded-lg bg-[#ee4923] shadow-md shadow-[#ee4923]/25 animate-scale-up" />
                    ) : (
                      <div className="absolute inset-0 rounded-lg bg-orange-50 group-hover:bg-orange-100 transition-colors duration-300" />
                    )}
                    <div className="relative z-10 flex items-center justify-center">
                      {sub.image ? (
                        <img 
                          src={getImageUrl(sub.image)} 
                          alt="" 
                          className={`w-[28px] h-[28px] object-contain drop-shadow-xs transition-transform duration-300 ${isSubActive ? 'scale-110' : 'scale-100'}`} 
                        />
                      ) : (
                        <div className="w-[28px] h-[28px] bg-slate-200 rounded" />
                      )}
                    </div>
                  </div>
                  <span className={`text-[8.5px] leading-tight font-black tracking-tight select-none px-0.5 text-center truncate w-full mt-1 transition-colors ${
                    isSubActive ? 'text-[#0F172A]' : 'text-slate-500'
                  }`}>
                    {sub.subCategoryName}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Dynamic product list */}
        {loading ? (
          <div className="grid grid-cols-2 gap-2 pb-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white flex flex-col items-center pb-3 animate-pulse shadow-sm border border-slate-100 rounded-lg overflow-hidden">
                <div className="w-full aspect-[4/5] bg-slate-200 mb-2" />
                <div className="w-3/4 h-3 bg-slate-200 rounded mb-1.5" />
                <div className="w-1/2 h-2.5 bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <motion.div 
            key={selectedCategory + sortBy}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-2 pb-8"
          >
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </motion.div>
        ) : (
          /* Empty state if search parameters yield nothing */
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-3 mt-6"
          >
            <div className="w-12 h-12 bg-orange-100 text-[#ee4923] rounded-full flex items-center justify-center mx-auto shadow-sm">
              <Search className="w-6 h-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-black text-[#0F172A]">No Items Found</h4>
              <p className="text-[9px] text-slate-400 leading-normal font-medium max-w-[150px] mx-auto">
                No items match this filter in this category.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('for-you');
                setSearchQuery('');
              }}
              className="bg-white border border-slate-200 hover:border-[#ee4923] text-[#ee4923] text-[8px] font-black px-4 py-2 rounded-xl transition-all duration-300"
            >
              RESET FILTERS
            </button>
          </motion.div>
        )}

      </div>

      </div>
    </div>
  );
}
