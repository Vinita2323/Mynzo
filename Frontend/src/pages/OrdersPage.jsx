import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, SlidersHorizontal, ChevronRight, Star, PenLine, Package, X, Image as ImageIcon, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import { BANNERS } from '../data/mockData';
import OptimizedImage from '../components/ui/OptimizedImage';

// Mock data matching the new design
const MOCK_ORDERS = [
  {
    id: 'ORD-8X92-K1',
    date: 'Arriving by May 10',
    status: 'In Transit',
    name: 'WALKAROO Men Casual',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200',
    rating: 0,
    ratingText: ''
  },
  {
    id: 'ORD-3M44-P9',
    date: 'Delivered on Apr 13',
    status: 'Delivered',
    name: 'SONATA NP7987YM06W Sonata Qua...',
    image: 'https://images.unsplash.com/photo-1524592094714-cb9c5d4d3bd1?auto=format&fit=crop&q=80&w=200',
    rating: 3,
    ratingText: 'Okay'
  },
  {
    id: 'ORD-1K99-L2',
    date: 'Delivered on Mar 19',
    status: 'Delivered',
    name: 'Lakmé Sunscreen - SPF 50 PA+++ Su...',
    image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=200',
    rating: 0,
    ratingText: 'Rate & Review'
  }
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const { orders: appOrders } = useApp();

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedOrderForReview, setSelectedOrderForReview] = useState(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);

  // Auto-slide Banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % BANNERS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleOpenReview = (order) => {
    setSelectedOrderForReview(order);
    setReviewRating(order.rating || 0);
    setReviewText('');
    setReviewModalOpen(true);
  };

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const invalidFile = filesArray.find(f => f.size > 10 * 1024 * 1024);
      if (invalidFile) {
        toast.error('Image size cannot exceed 10MB!');
        e.target.value = '';
        return;
      }
      toast.success('Photos selected successfully!');
    }
  };

  const handleVideoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Video size cannot exceed 10MB!');
        e.target.value = '';
        return;
      }
      toast.success('Video selected successfully!');
    }
  };
  
  const fallbackImages = [
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200', // Shoes
    'https://images.unsplash.com/photo-1524592094714-cb9c5d4d3bd1?auto=format&fit=crop&q=80&w=200', // Watch
    'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=200'  // Sunscreen
  ];

  // Transform appOrders to match the required UI structure, or use MOCK_ORDERS
  let rawOrders = appOrders && appOrders.length > 0 ? appOrders.map((o, idx) => ({
    id: o.id || `ORD-MOCK-${idx}`,
    date: o.status === 'Delivered' ? `Delivered on ${o.date || 'Apr 13'}` : (o.etd ? `Arriving by ${o.etd}` : 'Processing'),
    status: o.status || (idx === 0 ? 'In Transit' : 'Delivered'),
    name: o.items && o.items[0] ? o.items[0].name : 'Product',
    image: (o.items && o.items[0] && o.items[0].image) ? o.items[0].image : fallbackImages[idx % fallbackImages.length],
    rating: idx === 1 ? 3 : 0,
    ratingText: idx === 1 ? 'Okay' : (idx === 0 ? '' : 'Rate & Review')
  })) : [];

  // Apply Search
  if (searchQuery.trim() !== '') {
    rawOrders = rawOrders.filter(o => 
      o.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      o.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Apply Filter
  if (filterStatus !== 'All') {
    rawOrders = rawOrders.filter(o => o.status === filterStatus);
  }

  const orders = rawOrders;

  return (
    <div className="bg-white min-h-full font-sans pb-20">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3 sticky top-0 bg-[#FFE4D6] z-50 shadow-sm">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-orange-200/50 rounded-full transition-colors cursor-pointer">
          <ArrowLeft className="w-6 h-6 text-[#02006c]" />
        </button>
        <h1 className="text-[#02006c] text-[18px] font-semibold tracking-wide">My Orders</h1>
      </div>



      {/* Search and Filters */}
      <div className="px-4 py-3 mt-2 flex items-center gap-2 relative z-40">
        <div className="flex-1 flex items-center gap-2 border border-slate-300 rounded-lg px-3 py-2.5 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
          <Search className="w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search your order here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-[14px] text-slate-700 placeholder-slate-400 font-medium bg-transparent"
          />
        </div>
        <div className="relative pr-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-slate-800 font-medium text-[14px] px-2"
          >
            <SlidersHorizontal className="w-4 h-4" /> Filters
          </button>
          
          {showFilters && (
            <div className="absolute right-0 top-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50 w-36">
              {['All', 'In Transit', 'Delivered'].map(status => (
                <div 
                  key={status}
                  onClick={() => { setFilterStatus(status); setShowFilters(false); }}
                  className={`px-3 py-2 text-[14px] rounded-lg cursor-pointer transition-colors ${filterStatus === status ? 'bg-[#ee4923]/10 text-[#ee4923] font-bold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  {status}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="h-[1px] bg-slate-100 w-full mt-2"></div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="p-4 flex flex-col items-center justify-center mt-10">
          <Package className="w-12 h-12 text-slate-300 mb-4" />
          <p className="text-slate-500 font-medium">No orders found.</p>
        </div>
      ) : (
        <div className="p-3 space-y-3 bg-slate-50">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 p-3 flex flex-col">
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/order-details/${order.id}`)}
              >
                <div className="w-16 h-16 rounded-lg bg-slate-50 p-1.5 flex-shrink-0 flex items-center justify-center border border-slate-100 relative">
                  <OptimizedImage src={order.image} alt={order.name} type="product" className="absolute inset-0 p-1 object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 flex flex-col justify-center">
                  <h3 className="font-bold text-slate-800 text-[14px]">{order.date}</h3>
                  <p className="text-slate-500 text-[12px] mt-0.5 line-clamp-1">{order.name}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
              </div>
              
              {/* Rating Section */}
              {order.status === 'Delivered' && (
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 bg-slate-50/80 rounded-lg p-2 border border-slate-100/50">
                  <div 
                    className="flex items-center gap-1.5 min-w-0 cursor-pointer"
                    onClick={() => handleOpenReview(order)}
                  >
                    <span className="text-[11px] font-bold text-slate-700 truncate hover:text-blue-600 transition-colors">{order.ratingText}</span>
                    <div className="flex items-center gap-0.5 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-[14px] h-[14px] ${
                            star <= order.rating 
                              ? 'text-green-600 fill-green-600' 
                              : 'text-slate-200'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>
                  {order.rating > 0 ? (
                    <button 
                      onClick={() => handleOpenReview(order)}
                      className="flex items-center gap-1 border border-blue-600 bg-white text-blue-600 rounded-md px-2 py-1 hover:bg-blue-50 transition-colors flex-shrink-0 ml-auto"
                    >
                      <PenLine className="w-3 h-3" />
                      <span className="text-[11px] font-bold tracking-tight whitespace-nowrap">Write review</span>
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-black/50 backdrop-blur-sm transition-opacity">
          <div className="bg-white w-full sm:w-[400px] rounded-t-2xl sm:rounded-2xl p-5 shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-[18px] font-bold text-slate-800">Write a Review</h2>
              <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {selectedOrderForReview && (
              <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="w-12 h-12 rounded-lg bg-white p-1 flex-shrink-0 border border-slate-100 flex items-center justify-center relative">
                  <OptimizedImage src={selectedOrderForReview.image} alt="" type="product" className="absolute inset-0 p-0.5 object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-[13px] text-slate-800 line-clamp-1">{selectedOrderForReview.name}</h3>
                  <p className="text-[11px] text-slate-500">{selectedOrderForReview.status}</p>
                </div>
              </div>
            )}

            <div className="flex flex-col items-center justify-center mb-6">
              <p className="text-[14px] font-semibold text-slate-700 mb-3">How would you rate this product?</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className="p-1 hover:scale-110 transition-transform cursor-pointer">
                    <Star 
                      className={`w-8 h-8 ${star <= reviewRating ? 'text-green-500 fill-green-500' : 'text-slate-200'} transition-colors`} 
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-[14px] font-semibold text-slate-700 mb-2">Add a written review</p>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="What did you like or dislike?"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-[14px] outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-[100px]"
              ></textarea>
            </div>

            <div className="mb-6">
              <p className="text-[14px] font-semibold text-slate-700 mb-2">Add Photos or Reel (Optional)</p>
              <div className="flex gap-3">
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <ImageIcon className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[11px] font-medium text-slate-600">Add Photos</span>
                  <input type="file" accept="image/jpeg, image/png, image/webp" multiple className="hidden" onChange={handlePhotoUpload} />
                </label>
                <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Video className="w-6 h-6 text-slate-400 mb-2" />
                  <span className="text-[11px] font-medium text-slate-600">Add Reel</span>
                  <input type="file" accept="video/mp4, video/webm" className="hidden" onChange={handleVideoUpload} />
                </label>
              </div>
            </div>

            <button 
              onClick={() => {
                setReviewModalOpen(false);
                alert("Review submitted successfully!");
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm cursor-pointer"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
