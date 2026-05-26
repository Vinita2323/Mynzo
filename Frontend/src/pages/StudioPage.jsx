import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, ShoppingBag, Gift, ArrowLeft, CheckCircle2, ChevronLeft, Menu } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CRAZY_DEALS } from '../data/mockData';
import fashionReel from '../assets/videos/fashion_reel.mp4';

const ReelVideo = ({ src, isFirst }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.6 // Play when 60% of the video is visible
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Play video if it comes into view
          if (videoRef.current) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
            setIsPlaying(true);
          }
        } else {
          // Pause video if it goes out of view
          if (videoRef.current) {
            videoRef.current.pause();
            setIsPlaying(false);
          }
        }
      });
    }, options);

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const togglePlay = (e) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 cursor-pointer" onClick={togglePlay}>
      <video 
        ref={videoRef}
        src={src} 
        className="w-full h-full object-cover"
        loop
        playsInline
      />
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10 pointer-events-none">
          <div className="w-20 h-20 bg-black/30 rounded-full flex items-center justify-center backdrop-blur-md">
            <svg className="w-10 h-10 text-white opacity-80 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default function StudioPage() {
  const { addToCart, user, userReels } = useApp();
  const navigate = useNavigate();
  
  const mockPosts = [
    {
      id: 1,
      username: "curated_by_vini",
      desc: "The little details that make every outfit ✨💖 #mynzostudio #jewellery #aesthetic",
      likes: 12500,
      comments: 256,
      shares: 508,
      views: "2.1K Views",
      isLiked: false,
      product: CRAZY_DEALS[0],
      videoUrl: fashionReel,
      imageUrl: null,
      isFollowing: false
    },
    {
      id: 2,
      username: "tech_toy_reviews",
      desc: "Off-roading with the rugged Mynzo RC Car! High-speed, solid shocks. Absolute beast! 🏎️💨",
      likes: 8200,
      comments: 142,
      shares: 210,
      views: "1.4K Views",
      isLiked: true,
      product: CRAZY_DEALS[1],
      videoUrl: fashionReel,
      imageUrl: null,
      isFollowing: true
    }
  ];

  // Combine user reels with mock posts
  const [posts, setPosts] = useState([...userReels, ...mockPosts]);
  const [activeCommentPost, setActiveCommentPost] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [postComments, setPostComments] = useState({
    1: [
      { id: 101, username: "fashionista99", text: "Omg this is so cute!! 😍" },
      { id: 102, username: "style_icon", text: "Need this ASAP!" }
    ],
    2: [
      { id: 201, username: "gadget_guru", text: "Looks amazing!" }
    ]
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleLike = (postId) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return { 
            ...post, 
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            isLiked: !post.isLiked 
          };
        }
        return post;
      })
    );
  };

  const handleComment = (postId) => {
    setActiveCommentPost(postId);
  };

  const submitComment = () => {
    if (!newComment.trim()) return;
    
    setPostComments(prev => ({
      ...prev,
      [activeCommentPost]: [
        ...(prev[activeCommentPost] || []),
        { id: Date.now(), username: user ? user.name.toLowerCase().replace(' ', '_') : "you", text: newComment }
      ]
    }));
    
    // Also increment the comment count on the post
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === activeCommentPost) {
        return { ...post, comments: post.comments + 1 };
      }
      return post;
    }));
    
    setNewComment("");
  };

  const handleShare = async (post) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Check out this post by @${post.username} on Mynzo Studio!`,
          text: post.desc,
          url: window.location.href,
        });
      } else {
        alert("Share feature is not supported in your browser.");
      }
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const handleAddToCart = (product) => {
    if (!user) {
      navigate('/login');
      return;
    }
    addToCart(product);
  };

  const toggleFollow = (postId) => {
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, isFollowing: !post.isFollowing } : post
    ));
  };

  return (
    <div className="bg-black w-full h-[100dvh] overflow-y-scroll snap-y snap-mandatory scrollbar-hide text-white relative">
      
      {/* Top Navigation Overlay */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent max-w-md mx-auto">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        
        <div className="flex gap-4 items-center font-bold text-[15px] drop-shadow-md">
          <span className="text-white/70">Following</span>
          <span className="text-white border-b-2 border-white pb-1">For You</span>
        </div>
        
        <div className="bg-[#FF6E54] text-white px-2 py-1 rounded text-[10px] font-black tracking-wider shadow-lg flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          LIVE
        </div>
      </div>

      {posts.map((post, index) => (
        <div key={post.id} className="w-full h-[100dvh] snap-start relative bg-slate-900 flex justify-center items-center overflow-hidden">
          
          {/* Media Background */}
          {post.videoUrl ? (
            <ReelVideo src={post.videoUrl} isFirst={index === 0} />
          ) : (
            <img 
              src={post.imageUrl || post.product?.image || "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800"} 
              className="absolute inset-0 w-full h-full object-cover"
              alt="Post media"
            />
          )}

          {/* Gradient Overlays for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none"></div>

          {/* Right Action Panel */}
          <div className="absolute right-4 bottom-6 flex flex-col items-center gap-6 z-20">
            {/* User Profile Pic (Top of action panel in typical reels? Wait, screenshot has user info on the left.) */}
            {/* Let's follow screenshot: Heart, Comment, Share, ShoppingBag, Gift on right */}
            
            <button onClick={() => handleLike(post.id)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
              </div>
              <span className="text-[11px] font-semibold drop-shadow-md">{formatNumber(post.likes)}</span>
            </button>

            <button onClick={() => handleComment(post.id)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-semibold drop-shadow-md">{formatNumber(post.comments)}</span>
            </button>

            <button onClick={() => handleShare(post)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                <Share2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-[11px] font-semibold drop-shadow-md">{formatNumber(post.shares || 0)}</span>
            </button>

            <button onClick={() => handleAddToCart(post.product)} className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
            </button>

            <button className="flex flex-col items-center gap-1 cursor-pointer hover:scale-110 transition-transform">
              <div className="w-10 h-10 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10">
                <Gift className="w-5 h-5 text-white" />
              </div>
            </button>
          </div>

          {/* Bottom Info Panel */}
          <div className="absolute left-4 bottom-6 right-16 z-20 flex flex-col gap-3">
            
            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border border-white overflow-hidden bg-white flex-shrink-0">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.username}`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-bold drop-shadow-md">@{post.username}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-white" />
                </div>
                <span className="text-[11px] text-white/80 drop-shadow-md">{post.views}</span>
              </div>
              {!post.isFollowing && (
                <button 
                  onClick={() => toggleFollow(post.id)}
                  className="ml-2 border border-white/40 bg-white/10 backdrop-blur-sm px-3 py-1 rounded text-[11px] font-bold hover:bg-white/20 transition-colors"
                >
                  Follow
                </button>
              )}
            </div>

            {/* Product Tag Overlay */}
            {post.product && (
              <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-2.5 flex items-center gap-3 w-max max-w-[85%] pr-4 cursor-pointer hover:bg-black/50 transition-colors" onClick={() => navigate(`/product/${post.product.id}`)}>
                <img src={post.product.image} className="w-12 h-12 rounded-lg object-cover bg-white" alt="product" />
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold truncate max-w-[150px] drop-shadow-md">{post.product.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-bold text-white drop-shadow-md">₹{post.product.price}</span>
                    <span className="text-[10px] text-[#FF6E54] font-black bg-white/90 px-1 rounded">-{post.product.discount || '10%'} OFF</span>
                  </div>
                </div>
                <div className="bg-[#FF6E54] text-white text-[10px] font-bold px-2 py-1.5 rounded ml-2 whitespace-nowrap">
                  View Product &gt;
                </div>
              </div>
            )}

            {/* Description */}
            <p className="text-[13px] text-white font-medium drop-shadow-md leading-snug line-clamp-2 mt-1">
              {post.desc}
            </p>
          </div>
        </div>
      ))}

      {/* Comments Modal (Bottom Sheet) */}
      {activeCommentPost && (
        <>
          <div className="fixed inset-0 bg-black/60 z-[100]" onClick={() => setActiveCommentPost(null)}></div>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl h-[60dvh] z-[110] flex flex-col max-w-md mx-auto shadow-2xl animate-in slide-in-from-bottom-full duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-[16px]">
                {posts.find(p => p.id === activeCommentPost)?.comments} Comments
              </h3>
              <button onClick={() => setActiveCommentPost(null)} className="p-1 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <Menu className="w-5 h-5 opacity-0" /> {/* Spacer */}
                <span className="absolute top-4 right-4 text-[20px] font-bold">&times;</span>
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(postComments[activeCommentPost] || []).map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${comment.username}`} alt="avatar" />
                  </div>
                  <div>
                    <h4 className="text-[12px] font-bold text-slate-700">@{comment.username}</h4>
                    <p className="text-[13px] text-slate-800 mt-0.5">{comment.text}</p>
                  </div>
                </div>
              ))}
              {(!postComments[activeCommentPost] || postComments[activeCommentPost].length === 0) && (
                <div className="text-center text-slate-500 text-[13px] mt-10">
                  No comments yet. Be the first!
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <div className="p-4 border-t border-slate-100 flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden flex-shrink-0">
                <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user ? user.name : 'guest'}`} alt="your avatar" />
              </div>
              <input 
                type="text" 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitComment()}
                placeholder="Add comment..." 
                className="flex-1 bg-slate-100 text-slate-800 text-[14px] rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-[#FF6E54]/30"
              />
              <button 
                onClick={submitComment}
                disabled={!newComment.trim()}
                className="bg-[#FF6E54] text-white p-2 rounded-full disabled:opacity-50 disabled:bg-slate-300"
              >
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

