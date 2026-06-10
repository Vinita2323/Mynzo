import React, { useState, useEffect } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function CrazyDealsPage() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, user } = useApp();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/products?status=Approved`);
        const data = await res.json();
        if (res.ok && data.success && data.products) {
          const crazy = data.products.filter(p => p.flags?.crazyDeals);
          setDeals(crazy.map(p => ({
            id: p._id || p.id,
            name: p.name,
            desc: p.description || '',
            price: p.sellingPrice,
            originalPrice: p.mrp || p.sellingPrice,
            discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
            rating: p.rating || 0,
            image: (p.images && p.images[0]) ? p.images[0] : '',
            brandName: p.brandName || 'Mynzo Originals',
            sales: p.sales || 0
          })));
        }
      } catch (err) {
        console.error('Error fetching crazy deals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (
      imagePath.startsWith('http://') || 
      imagePath.startsWith('https://') || 
      imagePath.startsWith('data:') ||
      imagePath.startsWith('/src/') ||
      imagePath.startsWith('/assets/')
    ) {
      return imagePath;
    }
    const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    return `${apiBase}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 animate-fade-in">

      {/* Hero Banner Area */}
      <div className="bg-gradient-to-r from-orange-100 to-rose-100 py-3 px-4 flex items-center justify-center text-center relative">
        <button 
          onClick={() => navigate(-1)}
          className="absolute left-4 p-1.5 bg-white/40 hover:bg-white/70 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-orange-900" />
        </button>
        <div className="flex flex-col">
          <h2 className="text-xl font-black text-[#ee4923] tracking-tight leading-none mb-1">CRAZY DEALS</h2>
          <p className="text-[10px] text-orange-800 font-medium leading-none">Up to 50% Off! Don't miss out.</p>
        </div>
      </div>

      {/* Grid of Deals */}
      <div className="p-4 grid grid-cols-2 gap-4 mt-2">
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-slate-100 animate-pulse overflow-hidden flex flex-col pb-3">
              <div className="aspect-square w-full bg-slate-200" />
              <div className="p-2 space-y-2">
                <div className="w-3/4 h-3 bg-slate-200 rounded" />
                <div className="w-1/2 h-2 bg-slate-200 rounded" />
                <div className="w-1/3 h-3.5 bg-slate-200 rounded pt-1" />
              </div>
            </div>
          ))
        ) : deals.length > 0 ? (
          deals.map((deal) => {
            const isWished = isInWishlist(deal.id);
            return (
              <div 
                key={deal.id} 
                className="bg-white rounded-lg shadow-sm border border-slate-100 relative cursor-pointer hover:shadow-md transition-shadow group overflow-hidden flex flex-col"
                onClick={() => navigate(`/product/${deal.id}`)} 
              >  
                {/* Discount Badge */}
                <span className="absolute top-2 left-2 bg-[#ee4923] text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm z-10">
                  {deal.discount}
                </span>

                {/* Wishlist Button */}
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
                  className={`absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10 transition-colors ${
                    isWished ? 'text-red-500' : 'text-slate-300 hover:text-red-500'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
                </button>
                
                {/* Image */}
                <div className="aspect-square w-full bg-[#F8F9FD] flex items-center justify-center overflow-hidden">
                  <img src={getImageUrl(deal.image)} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                {/* Product Details */}
                <div className="p-2 space-y-1">
                  <h4 className="text-xs font-bold text-[#02006c] truncate">{deal.name}</h4>
                  <p className="text-[9px] text-slate-500 truncate">{deal.desc}</p>
                  
                  <div className="flex items-center gap-1.5 pt-1">
                    <span className="text-sm font-extrabold text-[#ee4923]">₹{deal.price}</span>
                    <span className="text-[10px] text-slate-400 font-medium line-through">₹{deal.originalPrice}</span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 py-10 text-center text-slate-400 text-xs font-medium">
            No Crazy Deals available right now.
          </div>
        )}
      </div>
    </div>
  );
}
