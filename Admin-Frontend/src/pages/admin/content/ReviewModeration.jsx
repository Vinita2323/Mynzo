import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Star, Search, Filter, MoreVertical, 
  CheckCircle2, XCircle, AlertCircle, Trash2, 
  User, ShoppingBag, Calendar, ThumbsUp, Play, Upload, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MOCK_REVIEWS = [
  { id: 1, user: 'Rahul Sharma', product: 'Premium Leather Satchel', rating: 5, comment: 'Amazing quality! The leather feels very premium and the stitching is perfect.', date: '2026-05-10', status: 'Pending' },
  { id: 2, user: 'Priyanka Das', product: 'Biotique Face Wash', rating: 4, comment: 'Good product, but the delivery was a bit slow.', date: '2026-05-09', status: 'Approved' },
  { id: 3, user: 'Amit Verma', product: 'Wireless Earbuds Pro', rating: 1, comment: 'Worst experience. The left earbud stopped working after 2 days.', date: '2026-05-08', status: 'Flagged' },
  { id: 4, user: 'Sneha Kapur', product: 'Summer Floral Dress', rating: 5, comment: 'Perfect fit and beautiful design. Highly recommended!', date: '2026-05-08', status: 'Pending' },
];

const ReviewModeration = () => {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [reviewType, setReviewType] = useState('text'); // 'text' or 'reels'
  const [activeTab, setActiveTab] = useState('Pending'); // 'Pending', 'Approved', 'Flagged'/'Rejected', 'All'

  // Video Reels States
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingReels, setLoadingReels] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  
  // Admin Upload form fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [reelCaption, setReelCaption] = useState('');
  const [reelRating, setReelRating] = useState(5);
  const [reelSection, setReelSection] = useState('forYou');
  const [reelVideoFile, setReelVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  const tabs = ['Pending', 'Approved', 'Flagged', 'All'];
  const reelsTabs = ['pending', 'approved', 'rejected', 'All'];

  // Fetch reels for admin moderation
  const fetchReels = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      setLoadingReels(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels/admin/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setReels(data.reels || []);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not connect to backend to load reels');
    } finally {
      setLoadingReels(false);
    }
  };

  // Fetch products for admin upload product dropdown selector
  const fetchProducts = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/admin/catalog/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (reviewType === 'reels') {
      fetchReels();
      fetchProducts();
    }
  }, [reviewType]);

  // Update reel status (Approve/Reject)
  const handleUpdateReelStatus = async (reelId, newStatus) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels/admin/${reelId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Reel marked as ${newStatus}`);
        setReels(prev => prev.map(r => r._id === reelId ? { ...r, status: newStatus } : r));
      } else {
        toast.error(data.message || 'Failed to update status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status');
    }
  };

  // Delete reel
  const handleDeleteReel = async (reelId) => {
    if (!window.confirm('Are you sure you want to permanently delete this reel?')) return;
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels/admin/${reelId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Reel deleted successfully');
        setReels(prev => prev.filter(r => r._id !== reelId));
      } else {
        toast.error(data.message || 'Failed to delete');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error deleting reel');
    }
  };

  // Admin direct upload reel
  const handleAdminUpload = async (e) => {
    e.preventDefault();
    if (!selectedProductId) {
      toast.error('Please select a product');
      return;
    }
    if (!reelVideoFile) {
      toast.error('Please upload a video file');
      return;
    }

    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const formData = new FormData();
    formData.append('productId', selectedProductId);
    formData.append('caption', reelCaption);
    formData.append('rating', reelRating);
    formData.append('section', reelSection);
    formData.append('video', reelVideoFile);

    try {
      setIsUploading(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels/admin/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        toast.success('Reel uploaded and published successfully!');
        setIsUploadOpen(false);
        setReelCaption('');
        setSelectedProductId('');
        setReelVideoFile(null);
        fetchReels();
      } else {
        toast.error(data.message || 'Failed to upload reel');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error uploading reel');
    } finally {
      setIsUploading(false);
    }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
      'Pending-reels': 'bg-amber-50 text-amber-600 border-amber-100',
      'Approved': 'bg-green-50 text-green-600 border-green-100',
      'Flagged': 'bg-red-50 text-red-600 border-red-100',
      'Rejected': 'bg-red-50 text-red-600 border-red-100',
    };
    const key = status === 'pending' || status === 'approved' || status === 'rejected' ? status.charAt(0).toUpperCase() + status.slice(1) : status;
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[key] || 'bg-slate-50 text-slate-500'}`}>
        {key}
      </span>
    );
  };

  const filteredReels = reels.filter(r => {
    const mappedTab = activeTab.toLowerCase();
    if (mappedTab === 'all') return true;
    if (mappedTab === 'flagged') return r.status === 'rejected';
    return r.status === mappedTab;
  });

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight font-montserrat uppercase">Review Moderation</h1>
          <p className="text-slate-500 font-medium mt-1 font-raleway">Monitor and approve customer feedback and review reels to maintain platform quality.</p>
        </div>
        
        {reviewType === 'reels' && (
          <button 
            onClick={() => setIsUploadOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={16} />
            Add Admin Reel
          </button>
        )}
      </div>

      {/* Review Type Selection Toggles */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
        <button 
          onClick={() => { setReviewType('text'); setActiveTab('Pending'); }}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reviewType === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Standard Reviews
        </button>
        <button 
          onClick={() => { setReviewType('reels'); setActiveTab('Pending'); }}
          className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${reviewType === 'reels' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Video Reels Reviews
        </button>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
           <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {reviewType === 'text' ? (
          <div className="divide-y divide-slate-50">
            {reviews.filter(r => activeTab === 'All' || r.status === activeTab).map((review) => (
              <motion.div 
                key={review.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-slate-50/50 transition-colors flex gap-6"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0">
                   <User size={24} />
                </div>
                <div className="flex-1 space-y-3">
                   <div className="flex justify-between items-start">
                      <div>
                         <div className="flex items-center gap-3">
                            <h4 className="font-black text-slate-900 font-montserrat uppercase tracking-tight">{review.user}</h4>
                            <StatusBadge status={review.status} />
                         </div>
                         <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                            <ShoppingBag size={12} />
                            {review.product}
                            <span className="mx-1">•</span>
                            <Calendar size={12} />
                            {review.date}
                         </div>
                      </div>
                      <div className="flex gap-1">
                         {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                         ))}
                      </div>
                   </div>
                   <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                      "{review.comment}"
                   </p>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {loadingReels ? (
              <div className="py-20 text-center text-slate-400 font-black text-xs uppercase tracking-widest animate-pulse">
                Loading Video Reels...
              </div>
            ) : filteredReels.length > 0 ? (
              filteredReels.map((reel) => {
                const videoUrl = reel.video.startsWith('http') ? reel.video : `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${reel.video}`;
                return (
                  <motion.div 
                    key={reel._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 hover:bg-slate-50/50 transition-colors flex gap-6"
                  >
                    {/* Video Thumbnail with hover play */}
                    <div className="relative w-28 h-48 bg-black rounded-2xl overflow-hidden flex-shrink-0 shadow-md group border border-slate-100">
                      <video src={videoUrl} className="w-full h-full object-cover" controls playsInline muted />
                      <div className="absolute top-2 left-2 bg-slate-900/60 text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                        {reel.section}
                      </div>
                    </div>

                    <div className="flex-1 space-y-3">
                       <div className="flex justify-between items-start">
                          <div>
                             <div className="flex items-center gap-3">
                                <h4 className="font-black text-slate-900 font-montserrat uppercase tracking-tight">@{reel.username}</h4>
                                <StatusBadge status={reel.status} />
                             </div>
                             <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                <ShoppingBag size={12} />
                                {reel.productId?.name || 'Unknown Product'}
                                <span className="mx-1">•</span>
                                <Calendar size={12} />
                                {new Date(reel.createdAt).toLocaleDateString()}
                             </div>
                          </div>
                          <div className="flex gap-1">
                             {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} className={i < reel.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                             ))}
                          </div>
                       </div>
                       
                       {reel.caption && (
                         <p className="text-sm text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                            "{reel.caption}"
                         </p>
                       )}

                       <div className="flex justify-between items-center pt-2">
                          <div className="flex gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                             <span>Views: {reel.views}</span>
                             <span>Likes: {reel.likes?.length || 0}</span>
                             <span>Comments: {reel.comments?.length || 0}</span>
                          </div>

                          <div className="flex gap-2">
                             {reel.status !== 'approved' && (
                               <button 
                                 onClick={() => handleUpdateReelStatus(reel._id, 'approved')}
                                 className="flex items-center gap-2 px-4 py-2.5 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-sm"
                               >
                                  <CheckCircle2 size={14} />
                                  Approve
                               </button>
                             )}
                             {reel.status !== 'rejected' && (
                               <button 
                                 onClick={() => handleUpdateReelStatus(reel._id, 'rejected')}
                                 className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-sm"
                               >
                                  <XCircle size={14} />
                                  Reject
                               </button>
                             )}
                             <button 
                               onClick={() => handleDeleteReel(reel._id)}
                               className="p-2.5 bg-slate-50 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-all border border-slate-100"
                             >
                                <Trash2 size={16} />
                             </button>
                          </div>
                       </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-20 text-center text-slate-300 font-bold uppercase tracking-widest text-xs">
                No video reels matching this filter.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Admin Reels Upload slide-over / Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-full max-w-lg bg-white h-full rounded-[32px] shadow-2xl p-10 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
                <h2 className="text-xl font-black text-slate-900 font-montserrat uppercase tracking-tight">Upload Brand Reel</h2>
                <button 
                  onClick={() => setIsUploadOpen(false)} 
                  className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAdminUpload} className="flex-1 space-y-6 overflow-y-auto pr-1">
                <div className="space-y-2 relative">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Select Associated Product</label>
                  
                  {/* Dropdown Toggle Button */}
                  <div 
                    onClick={() => setIsProductDropdownOpen(!isProductDropdownOpen)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 focus:ring-blue-50 outline-none transition-all flex justify-between items-center cursor-pointer select-none"
                  >
                    <span className={selectedProductId ? "text-slate-900" : "text-slate-400"}>
                      {products.find(p => p._id === selectedProductId)?.name || "-- Select Product --"}
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </div>

                  {/* Dropdown Menu Overlay */}
                  {isProductDropdownOpen && (
                    <div className="absolute left-0 right-0 z-[110] mt-1 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-60">
                      {/* Search Bar */}
                      <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                        <input 
                          type="text"
                          placeholder="Search product..."
                          value={productSearchQuery}
                          onChange={(e) => setProductSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
                          className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 text-xs font-bold outline-none focus:border-blue-500 transition-colors"
                        />
                      </div>
                      {/* Scrollable list */}
                      <div className="overflow-y-auto max-h-44 divide-y divide-slate-50">
                        {products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).length > 0 ? (
                          products.filter(p => p.name.toLowerCase().includes(productSearchQuery.toLowerCase())).map(p => (
                            <div 
                              key={p._id}
                              onClick={() => {
                                setSelectedProductId(p._id);
                                setIsProductDropdownOpen(false);
                                setProductSearchQuery('');
                              }}
                              className={`py-3 px-6 text-xs font-black cursor-pointer transition-colors text-left hover:bg-slate-50 ${selectedProductId === p._id ? 'bg-blue-50 text-blue-600' : 'text-slate-700'}`}
                            >
                              {p.name}
                            </div>
                          ))
                        ) : (
                          <div className="py-4 px-6 text-xs text-slate-400 text-center">
                            No products found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reel Caption</label>
                  <textarea 
                    value={reelCaption}
                    onChange={(e) => setReelCaption(e.target.value)}
                    placeholder="E.g. The little details that make every outfit... ✨" 
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 focus:ring-blue-50 outline-none transition-all" 
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Rating (Optional)</label>
                    <select
                      value={reelRating}
                      onChange={(e) => setReelRating(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 px-6 text-sm font-black focus:ring-4 focus:ring-blue-50 outline-none transition-all appearance-none"
                    >
                      {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>{num} Star</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Reel Video File</label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                    <input 
                      required
                      type="file" 
                      accept="video/*" 
                      onChange={(e) => setReelVideoFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Upload className="text-slate-400 w-10 h-10 mb-2" />
                    <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                      {reelVideoFile ? reelVideoFile.name : 'Select video file (MP4/MOV)'}
                    </span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsUploadOpen(false)} 
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isUploading}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-slate-300"
                  >
                    {isUploading ? 'Uploading...' : 'Publish Reel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewModeration;
