import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ShoppingCart, Check, Heart } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ProductCard({ product }) {
  const { addToCart, toggleWishlist, isInWishlist, user } = useApp();
  const navigate = useNavigate();
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  // Render highly-detailed, beautiful, custom inline vectors to prevent blank image placeholders
  const renderProductGraphic = (type) => {
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
            <path d="M50 58 C46 52 32 52 32 68 C32 80 50 90 50 90 C50 90 68 80 68 68 C68 52 54 52 50 58 Z" fill="url(#silverGrad)" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Inlaid Diamond */}
            <path d="M50 66 L54 72 L50 78 L46 72 Z" fill="#38BDF8" opacity="0.8" />
            {/* Sparkles */}
            <polygon points="34 56, 36 52, 38 56, 36 60" fill="#F59E0B" />
            <polygon points="64 74, 66 70, 68 74, 66 78" fill="#F59E0B" />
            
            <defs>
              <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
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

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-lg border border-slate-100/80 p-2 shadow-2xs hover:shadow-[0_8px_24px_-6px_rgba(255,110,84,0.2)] hover:border-[#FF6E54]/30 hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-300 flex flex-col justify-between group cursor-pointer"
    >
      <div>
        {/* Card Top: Discount Badge & Rating */}
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className="bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
            {product.discount}
          </span>
          <div className="flex items-center gap-0.5 bg-slate-50/80 backdrop-blur-xs border border-slate-100/50 px-1 py-0.5 rounded">
            <Star className="w-2 h-2 text-amber-500 fill-current" />
            <span className="text-[8px] font-bold text-slate-600">{product.rating}</span>
          </div>
        </div>

        {/* Image display */}
        <div className="bg-slate-50/60 backdrop-blur-xs border border-white/80 rounded flex items-center justify-center mb-1.5 group-hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden aspect-square w-full">
          {product.image ? (
            <img src={product.image} alt={product.name} className="w-full h-full object-cover drop-shadow-sm" />
          ) : (
            renderProductGraphic(product.type)
          )}
          
          {/* Floating Wishlist Heart */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!user) {
                navigate('/login');
                return;
              }
              toggleWishlist(product);
            }}
            className="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white backdrop-blur-xs rounded-full shadow-3xs hover:scale-105 active:scale-95 transition-all duration-300 z-10 cursor-pointer"
          >
            <Heart className={`w-3.5 h-3.5 ${isInWishlist(product.id) ? 'fill-[#FF6E54] text-[#FF6E54]' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Title */}
        <h4 className="text-[11px] font-black text-[#02006c] truncate tracking-tight">{product.name}</h4>
        <p className="text-[8.5px] text-slate-400 line-clamp-2 mt-0.5 leading-tight min-h-[20px]">
          {product.desc}
        </p>
      </div>

      {/* Pricing and Button */}
      <div className="mt-1 flex items-center justify-between gap-1 border-t border-slate-100/50 pt-1">
        <div className="flex flex-col">
          <span className="text-[11px] font-black text-[#02006c]">₹{product.price}</span>
          <span className="text-[8.5px] text-slate-400 line-through leading-none">₹{product.originalPrice}</span>
        </div>

        <button
          onClick={handleAdd}
          className={`flex items-center justify-center p-1 rounded transition-all duration-300 ${
            added 
              ? 'bg-emerald-500 text-white scale-95 shadow-md shadow-emerald-500/20' 
              : 'bg-orange-50 hover:bg-[#FF6E54] text-[#FF6E54] hover:text-white hover:scale-105 active:scale-95 shadow-3xs'
          }`}
        >
          {added ? (
            <Check className="w-3 h-3 stroke-[3]" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
