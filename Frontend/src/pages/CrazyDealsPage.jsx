import React, { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CRAZY_DEALS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CrazyDealsPage() {
  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist, user } = useApp();
  const [toastMessage, setToastMessage] = useState('');

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
          <h2 className="text-xl font-black text-[#FF6E54] tracking-tight leading-none mb-1">CRAZY DEALS</h2>
          <p className="text-[10px] text-orange-800 font-medium leading-none">Up to 50% Off! Don't miss out.</p>
        </div>
      </div>

      {/* Grid of Deals */}
      <div className="p-4 grid grid-cols-2 gap-4 mt-2">
        {CRAZY_DEALS.map((deal) => {
          const isWished = isInWishlist(deal.id);
          return (
            <div 
              key={deal.id} 
              className="bg-white rounded-lg shadow-sm border border-slate-100 relative cursor-pointer hover:shadow-md transition-shadow group overflow-hidden flex flex-col"
              onClick={() => navigate(`/product/${deal.id}`)} 
            >
              {/* Discount Badge */}
              <span className="absolute top-2 left-2 bg-[#FF6E54] text-white text-[9px] font-black px-1.5 py-0.5 rounded-lg shadow-sm z-10">
                {deal.discount}
              </span>

              {/* Wishlist Button */}
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  toggleWishlist(deal);
                  if (!isWished) {
                    setToastMessage('Added to your picks');
                    setTimeout(() => setToastMessage(''), 2000);
                  }
                }}
                className={`absolute top-2 right-2 w-7 h-7 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm z-10 transition-colors ${
                  isWished ? 'text-red-500' : 'text-slate-300 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isWished ? 'fill-current' : ''}`} />
              </button>
              
              {/* Image */}
              <div className="aspect-square w-full bg-[#F8F9FD] flex items-center justify-center overflow-hidden">
                <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>

              {/* Product Details */}
              <div className="p-2 space-y-1">
                <h4 className="text-xs font-bold text-[#02006c] truncate">{deal.name}</h4>
                <p className="text-[9px] text-slate-500 truncate">{deal.desc}</p>
                
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-sm font-extrabold text-[#FF6E54]">₹{deal.price}</span>
                  <span className="text-[10px] text-slate-400 font-medium line-through">₹{deal.originalPrice}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg z-50 animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
