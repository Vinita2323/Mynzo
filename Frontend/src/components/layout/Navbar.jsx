import React, { useState } from 'react';
import { Bell, Heart, ShoppingCart, MapPin, ChevronDown, Search, Camera, Mic, Scan, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function Navbar() {
  const navigate = useNavigate();
  const {
    totalCartItems,
    wishlist,
    location,
    setLocation,
    searchQuery,
    setSearchQuery,
    isLocationModalOpen,
    setIsLocationModalOpen
  } = useApp();

  const [tempLocation, setTempLocation] = useState(location);
  const popularLocations = [
    "83 Kishan Pura Mataji Mandir, Sector 3, Mathura",
    "Connaught Place, New Delhi",
    "Bandra West, Mumbai",
    "Koramangala, Bengaluru",
    "Salt Lake Sector V, Kolkata"
  ];

  const handleSaveLocation = (loc) => {
    setLocation(loc);
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <header className="bg-orange-50 transition-all duration-300">
        {/* Compact Main top header */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-transparent">
          <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => navigate('/')}>
            {/* Logo image */}
            <img
              src="/Logo.jpg"
              alt="Mynzo Logo"
              className="h-14 object-contain rounded-lg hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                e.target.alt = "Mynzo World";
              }}
            />
          </div>

          {/* Color theme with #02006c */}
          <div className="flex items-center gap-3 text-[#02006c]">
            <button className="relative p-1 hover:bg-orange-100/40 rounded-full transition-colors">
              <Bell className="w-5.5 h-5.5 stroke-[1.8]" />
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-[#FF6E54] border-2 border-white rounded-full"></span>
            </button>
            <button 
              onClick={() => navigate('/wishlist')}
              className="relative p-1 hover:bg-orange-100/40 rounded-full transition-colors"
            >
              <Heart className="w-5.5 h-5.5 stroke-[1.8]" />
              {wishlist && wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#FF6E54] border border-white rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative p-1 hover:bg-orange-100/40 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5.5 h-5.5 stroke-[1.8]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF6E54] text-[8.5px] font-black text-white ring-1.5 ring-white animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Location selector bar with INCREASED WIDTH (px-1.5) and DECREASED BORDER RADIUS (rounded-lg) */}
        <div className="px-1.5 py-1 bg-transparent">
          <div
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-[#FF6E54] text-white flex items-center justify-between px-4 py-2.5 rounded-lg text-[10.5px] font-black cursor-pointer hover:bg-[#e64c33] shadow-md shadow-orange-500/15 active:scale-[0.99] transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-4 h-4 text-white flex-shrink-0" />
              <span className="truncate tracking-wide">
                HOME &nbsp;<span className="font-normal text-orange-50/90">| &nbsp;{location}</span>
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-white flex-shrink-0" />
          </div>
        </div>

      </header>

      {/* Search bar row - Now Sticky at the top! */}
      <div className="sticky top-0 z-40 px-2 py-2 bg-orange-50 border-b border-orange-100/40 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          {/* Search Input Bar (Symmetrical rounded-lg and increased height with py-2) */}
          <div className="flex-1 relative flex items-center bg-white/95 rounded-lg px-3.5 py-2 border border-slate-200/50 focus-within:border-[#FF6E54] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-300 shadow-3xs">
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-transparent text-xs text-[#02006c] outline-none placeholder-slate-400 font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Voice search Mic option added next to Camera inside input capsule */}
            <div className="flex items-center gap-1.5 ml-2.5">
              <Camera className="w-4 h-4 text-slate-400 cursor-pointer hover:text-[#FF6E54] transition-colors" />
              <Mic className="w-4 h-4 text-slate-400 cursor-pointer hover:text-[#FF6E54] transition-colors" />
            </div>
          </div>

          {/* Barcode/QR Scanner button (Symmetrical rounded-lg and balanced w-9 h-9) */}
          <button className="bg-white/95 border border-slate-200/50 hover:bg-white active:scale-95 text-[#FF6E54] rounded-lg shadow-3xs transition-all duration-300 w-9 h-9 flex items-center justify-center flex-shrink-0">
            <Scan className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Delivery Address Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl animate-slide-up max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-[#02006c]">Select Delivery Address</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Enter Custom Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:border-orange-500 focus:outline-none"
                    placeholder="e.g. 83 Kishan Pura Mataji Mandir, Mathura"
                    value={tempLocation}
                    onChange={(e) => setTempLocation(e.target.value)}
                  />
                  <button
                    onClick={() => handleSaveLocation(tempLocation)}
                    className="bg-[#FF6E54] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-orange-600 transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Popular / Recent Locations</h4>
                <div className="space-y-2">
                  {popularLocations.map((loc, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSaveLocation(loc)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-sm transition-all duration-300 ${location === loc
                          ? 'border-orange-500 bg-orange-50 text-orange-950 font-semibold'
                          : 'border-slate-100 hover:bg-slate-50 text-slate-700'
                        }`}
                    >
                      <MapPin className={`w-4 h-4 ${location === loc ? 'text-orange-500' : 'text-slate-400'}`} />
                      <span>{loc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

