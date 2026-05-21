import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart, MessageCircle, Share2, ShoppingBag, Eye, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CRAZY_DEALS } from '../data/mockData';

export default function StudioPage() {
  const { addToCart, user } = useApp();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: "curated_by_vini",
      desc: "This Cuddly Giant Teddy Bear is the absolute best gift for birthdays! 🧸✨ Super soft premium plush. #gifting #aesthetic #cuddles",
      likes: 342,
      comments: 24,
      views: "2.1K",
      isLiked: false,
      product: CRAZY_DEALS[0] // Teddy Bear
    },
    {
      id: 2,
      username: "tech_toy_reviews",
      desc: "Off-roading with the rugged Mynzo RC Car! High-speed, solid shocks. Absolute beast! 🏎️💨 #toys #rccars #unboxing",
      likes: 189,
      comments: 12,
      views: "1.4K",
      isLiked: true,
      product: CRAZY_DEALS[1] // RC Car
    }
  ]);

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      )
    );
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  return (
    <div className="flex-grow p-4 space-y-6 pb-6 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div>
          <h2 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#FF6E54]" />
            Mynzo Studio
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold italic">Explore gift unboxings and visual reviews</p>
        </div>
        
        {/* Active live badge */}
        <span className="flex items-center gap-1.5 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full text-[9px] font-black text-red-600">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping"></span>
          LIVE
        </span>
      </div>

      {/* Social post reels */}
      <div className="space-y-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="bg-slate-50 border border-slate-100 rounded-3xl p-4 space-y-4 hover:border-slate-200 transition-all duration-300"
          >
            {/* User details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* User avatar mockup */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 via-red-500 to-yellow-500 p-0.5 shadow-sm">
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[10px] font-black text-[#FF6E54]">
                    {post.username[0].toUpperCase()}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-black text-[#0F172A]">@{post.username}</h4>
                  <div className="flex items-center gap-1 text-[8px] text-slate-400 font-bold uppercase tracking-wider">
                    <Eye className="w-2.5 h-2.5" />
                    <span>{post.views} views</span>
                  </div>
                </div>
              </div>
              
              {/* Follow action button */}
              <button className="text-[9px] font-black text-[#FF6E54] border border-orange-200 hover:bg-orange-50 px-3 py-1 rounded-full transition-all duration-300">
                FOLLOW
              </button>
            </div>

            {/* Simulated rich visual card media overlay */}
            <div className="w-full h-48 bg-gradient-to-tr from-slate-900 to-[#0F172A] rounded-2xl relative overflow-hidden flex items-center justify-center p-6 text-white group cursor-pointer shadow-inner">
              <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
              
              {/* Central post artwork */}
              <div className="flex flex-col items-center gap-2 relative z-10 text-center">
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/20 group-hover:scale-105 transition-transform duration-300">
                  <ShoppingBag className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] font-extrabold tracking-widest text-[#FF6E54] uppercase">MYNZO ORIGINALS</span>
                <p className="text-xs font-bold px-2 line-clamp-1">{post.product.name}</p>
              </div>

              {/* Glowing decorative gradient circles */}
              <div className="absolute -top-12 -left-12 w-28 h-28 bg-[#FF6E54]/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute -bottom-12 -right-12 w-28 h-28 bg-[#FF6E54]/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
            </div>

            {/* Shoppable Tag Box linked directly in post! */}
            <div className="bg-white border border-slate-100 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0 text-[#FF6E54]">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h5 className="text-[10px] font-black text-[#0F172A] truncate leading-tight">{post.product.name}</h5>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-black text-slate-800">₹{post.product.price}</span>
                    <span className="text-[9px] text-[#FF6E54] font-extrabold">{post.product.discount} OFF</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAddToCart(post.product)}
                className="bg-[#FF6E54] hover:bg-orange-600 active:scale-95 text-white text-[9px] font-black px-3.5 py-2 rounded-xl shadow-xs transition-all duration-300"
              >
                BUY NOW
              </button>
            </div>

            {/* Text description */}
            <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
              {post.desc}
            </p>

            {/* Social action panel */}
            <div className="flex items-center gap-5 border-t border-slate-100 pt-3">
              <button 
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${
                  post.isLiked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Heart className={`w-4.5 h-4.5 ${post.isLiked ? 'fill-current animate-pulse' : ''}`} />
                <span>{post.likes}</span>
              </button>

              <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">
                <MessageCircle className="w-4.5 h-4.5" />
                <span>{post.comments}</span>
              </button>

              <button className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 ml-auto transition-colors">
                <Share2 className="w-4.5 h-4.5" />
                <span>SHARE</span>
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

