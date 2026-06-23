import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle2, Star, MapPin, Receipt, Download, ChevronDown, PenLine, X, Package, Image as ImageIcon, Video } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

export default function OrderDetailsPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { addStudioPost, user, getOrderReview, addOrderReview, orders } = useApp();

  const id = orderId || 'OD337252952617879100';
  const initialDraft = getOrderReview(id) || {};

  const [isEditingReview, setIsEditingReview] = useState(initialDraft.isEditingReview || false);
  const [reviewRating, setReviewRating] = useState(initialDraft.reviewRating || 0);
  const [reviewText, setReviewText] = useState(initialDraft.reviewText || '');
  const [reviewPhotos, setReviewPhotos] = useState(initialDraft.reviewPhotos || []);
  const [reviewVideo, setReviewVideo] = useState(initialDraft.reviewVideo || null);
  const [submittedReview, setSubmittedReview] = useState(initialDraft.submittedReview || null);
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    addOrderReview(id, {
      isEditingReview,
      reviewRating,
      reviewText,
      reviewPhotos,
      reviewVideo,
      submittedReview
    });
  }, [id, isEditingReview, reviewRating, reviewText, reviewPhotos, reviewVideo, submittedReview]);

  const handlePhotoUpload = (e) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const invalidFile = filesArray.find(f => f.size > 10 * 1024 * 1024);
      if (invalidFile) {
        toast.error('Image size cannot exceed 10MB!');
        return;
      }
      const newPhotos = filesArray.map(f => URL.createObjectURL(f));
      setReviewPhotos(prev => [...prev, ...newPhotos]);
    }
  };

  const handleVideoUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Video size cannot exceed 10MB!');
        return;
      }
      setReviewVideo(URL.createObjectURL(file));
    }
  };
  const [isOffersExpanded, setIsOffersExpanded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);

  const globalOrder = orders?.find(o => o.id === id);
  const isDelivered = globalOrder ? globalOrder.status === 'Delivered' : id !== 'ORD-8X92-K1';

  const MOCK_ORDER_DETAILS = {
    'ORD-8X92-K1': {
       name: 'WALKAROO Men Casual',
       image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200',
       price: 999,
       selling: 855
    },
    'ORD-3M44-P9': {
       name: 'SONATA NP7987YM06W Sonata Quartz Gold...',
       image: 'https://images.unsplash.com/photo-1524592094714-cb9c5d4d3bd1?auto=format&fit=crop&q=80&w=200',
       price: 2499,
       selling: 1999
    },
    'ORD-1K99-L2': {
       name: 'Lakmé Sunscreen - SPF 50 PA+++ Su...',
       image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&q=80&w=200',
       price: 350,
       selling: 299
    }
  };

  const orderItems = globalOrder ? globalOrder.items : [
    {
      id: 'mock-1',
      name: (MOCK_ORDER_DETAILS[id] || MOCK_ORDER_DETAILS['ORD-3M44-P9']).name,
      image: (MOCK_ORDER_DETAILS[id] || MOCK_ORDER_DETAILS['ORD-3M44-P9']).image,
      price: (MOCK_ORDER_DETAILS[id] || MOCK_ORDER_DETAILS['ORD-3M44-P9']).selling,
      quantity: 1
    }
  ];

  // Helper product details for reviews / first item reference
  const firstItem = orderItems[0];
  const product = {
    name: firstItem.name,
    image: firstItem.image,
    price: firstItem.price * 1.2, // mock original price
    selling: firstItem.price
  };

  const deliveryAddress = globalOrder?.deliveryAddress || {
    name: user?.name || "Mukesh Jinodiya",
    type: "Home",
    address: "83 kishan pura mataji mandir, sector no. 5 new harsook, Jaipur, Rajasthan 302033",
    pincode: "302033"
  };

  const orderTotal = globalOrder ? globalOrder.total : (product.selling + 7 - 150);

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      const itemsText = orderItems.map(item => `${item.quantity}x ${item.name} - ₹${item.price}`).join('\n');
      const invoiceContent = `
=========================================
               MYNZO INVOICE
=========================================
Order ID: ${id}
Date: ${globalOrder?.date || new Date().toLocaleDateString()}

Items:
${itemsText}

-----------------------------------------
Total Amount:       ₹${orderTotal}
Paid By:            ${globalOrder?.paymentMethod || 'UPI'}

Thank you for shopping with Mynzo!
=========================================
`;
      const blob = new Blob([invoiceContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Invoice_${id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      setIsDownloading(false);
    }, 1500);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(id);
    toast.success('Order ID copied to clipboard!');
  };

  return (
    <div className="bg-white min-h-[100dvh] font-sans pb-24">
      {/* Header */}
      <div className="bg-[#FFE4D6] px-4 py-3 sticky top-0 z-50 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 -ml-1 hover:bg-orange-200/50 rounded-full transition-colors cursor-pointer">
            <ArrowLeft className="w-6 h-6 text-[#02006c]" />
          </button>
          <h1 className="text-[18px] font-semibold tracking-wide text-[#02006c]">Order Details</h1>
        </div>
        <button 
          onClick={() => navigate('/support')}
          className="border border-[#02006c]/20 bg-white/50 rounded-lg px-4 py-1.5 text-[14px] font-semibold text-[#02006c] hover:bg-white transition-colors cursor-pointer"
        >
          Help & Support
        </button>
      </div>

      <div className="flex flex-col">
        {/* Top Section */}
        <div className="p-3">
          {/* Products List & Order ID */}
          <div className="flex flex-col gap-3 mb-3">
            {orderItems.map((item, idx) => (
              <div key={item.id || idx} className="flex gap-3 items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <div className="w-14 h-14 bg-pink-50 rounded-lg p-1.5 flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200/50 shadow-sm">
                   <img src={item.image} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-slate-800 line-clamp-1 font-semibold">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Qty: {item.quantity} • Price: ₹{item.price}
                  </p>
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 px-1 mt-1 justify-between">
              <div className="flex items-center gap-1">
                <span>Order ID: #{id}</span>
                <Copy onClick={handleCopyId} className="w-3.5 h-3.5 text-[#ee4923] cursor-pointer hover:text-[#ff5c3f]" />
              </div>
              <span className="font-bold text-slate-600">Total Items: {orderItems.reduce((acc, curr) => acc + curr.quantity, 0)}</span>
            </div>
          </div>

          {/* Compact Delivered Card */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-1">
            <div className="p-3 border-b border-slate-100 flex items-center justify-between">
               <div>
                 <h2 className={`text-[15px] font-bold ${isDelivered ? 'text-green-700' : 'text-[#ee4923]'} mb-1`}>
                   {isDelivered ? `Delivered, ${globalOrder?.date || 'Apr 13'}` : 'Arriving by May 10'}
                 </h2>
                 {isDelivered ? (
                   <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                     <div className="w-3 h-3 border border-slate-400 rounded-full flex items-center justify-center text-[8px]">i</div>
                     Return policy ended on Apr 23
                   </div>
                 ) : (
                   <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                     <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                     Item is out for delivery
                   </div>
                 )}
               </div>
               <div className={`${isDelivered ? 'bg-green-600' : 'bg-[#ee4923]'} rounded-full w-6 h-6 flex items-center justify-center shadow-sm`}>
                 {isDelivered ? (
                   <CheckCircle2 className="w-4 h-4 text-white" />
                 ) : (
                   <Package className="w-4 h-4 text-white" />
                 )}
               </div>
            </div>
            <button 
              onClick={() => navigate(`/track-order/${id}`)}
              className="w-full py-2.5 text-[13px] font-semibold text-[#ee4923] hover:bg-[#ee4923]/5 active:bg-[#ee4923]/10 transition-colors"
            >
              {isDelivered ? 'See all updates' : 'Track your order'}
            </button>
          </div>
        </div>

        <div className="h-2 bg-slate-100 w-full"></div>

        {isDelivered && (
          <>
            {/* Rate Experience */}
            <div className="p-3">
              <h2 className="text-[15px] font-bold text-slate-800 mb-2">Rate your experience</h2>
              {isEditingReview ? (
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex flex-col items-center justify-center mb-5">
                    <p className="text-[14px] font-semibold text-slate-700 mb-2">How would you rate this product?</p>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setReviewRating(star)} className="p-1 hover:scale-110 transition-transform cursor-pointer">
                          <Star className={`w-8 h-8 ${star <= reviewRating ? 'text-green-500 fill-green-500' : 'text-slate-200'} transition-colors`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-700 mb-2">Add a written review</p>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="What did you like or dislike?"
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[14px] outline-none focus:border-[#ee4923] focus:ring-1 focus:ring-[#ee4923] transition-all resize-none h-[80px]"
                    ></textarea>
                  </div>

                  <div className="mb-5">
                    <p className="text-[14px] font-semibold text-slate-700 mb-2">Add Photos or Reel (Optional)</p>
                    {(reviewPhotos.length > 0 || reviewVideo) && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {reviewPhotos.map((p, i) => (
                          <div key={i} className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden relative">
                            <img src={p} className="w-full h-full object-cover" />
                            <button onClick={() => setReviewPhotos(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-slate-500 shadow-sm"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                        {reviewVideo && (
                          <div className="w-14 h-14 rounded-lg border border-slate-200 overflow-hidden relative bg-black flex items-center justify-center">
                            <Video className="w-5 h-5 text-white/70 absolute" />
                            <video src={reviewVideo} className="w-full h-full object-cover opacity-50" />
                            <button onClick={() => setReviewVideo(null)} className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-slate-500 shadow-sm z-10"><X className="w-3 h-3" /></button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 bg-white rounded-xl cursor-pointer hover:border-[#ee4923] hover:bg-orange-50 transition-colors">
                        <ImageIcon className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-medium text-slate-600">Add Photos</span>
                        <input type="file" accept="image/jpeg, image/png, image/webp" multiple className="hidden" onChange={handlePhotoUpload} />
                      </label>
                      <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-slate-300 bg-white rounded-xl cursor-pointer hover:border-[#ee4923] hover:bg-orange-50 transition-colors">
                        <Video className="w-5 h-5 text-slate-400 mb-1" />
                        <span className="text-[10px] font-medium text-slate-600">Add Reel</span>
                        <input type="file" accept="video/mp4, video/webm" className="hidden" onChange={handleVideoUpload} />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {submittedReview && (
                      <button 
                        onClick={() => setIsEditingReview(false)}
                        className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        setSubmittedReview({ rating: reviewRating, text: reviewText, photos: reviewPhotos, video: reviewVideo });
                        setIsEditingReview(false);
                        
                        if (reviewVideo || reviewPhotos.length > 0) {
                          addStudioPost({
                            id: Date.now(),
                            username: user ? user.name.toLowerCase().replace(' ', '_') : 'guest_user',
                            desc: reviewText || "Check out my new purchase! ✨",
                            likes: 0,
                            comments: 0,
                            views: "0",
                            isLiked: false,
                            product: product,
                            videoUrl: reviewVideo,
                            imageUrl: reviewPhotos.length > 0 ? reviewPhotos[0] : null
                          });
                        }
                        
                        alert("Review submitted successfully!");
                      }}
                      className="flex-1 bg-[#ee4923] hover:bg-[#ff5c3f] text-white font-bold py-3 rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      Submit Review
                    </button>
                  </div>
                </div>
              ) : submittedReview ? (
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className={`w-4 h-4 ${star <= submittedReview.rating ? 'text-green-600 fill-green-600' : 'text-slate-200 fill-slate-200'}`} />
                      ))}
                    </div>
                    <button onClick={() => setIsEditingReview(true)} className="text-[12px] font-semibold text-[#ee4923] hover:underline flex items-center gap-1">
                      <PenLine className="w-3 h-3" /> Edit
                    </button>
                  </div>
                  {submittedReview.text && (
                    <p className="text-[12px] text-slate-700 mt-1 mb-2 leading-snug">{submittedReview.text}</p>
                  )}
                  {(submittedReview.photos.length > 0 || submittedReview.video) && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {submittedReview.photos.map((p, i) => (
                        <div key={i} onClick={() => setSelectedMedia({ type: 'image', url: p })} className="w-12 h-12 rounded-md border border-slate-200 overflow-hidden bg-white cursor-pointer hover:opacity-80 transition-opacity">
                          <img src={p} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {submittedReview.video && (
                        <div onClick={() => setSelectedMedia({ type: 'video', url: submittedReview.video })} className="w-12 h-12 rounded-md border border-slate-200 overflow-hidden bg-black relative flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity">
                          <Video className="w-4 h-4 text-white/80 absolute z-10" />
                          <video src={submittedReview.video} className="w-full h-full object-cover opacity-60" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-[14px] text-slate-700 mb-4">
                     <Receipt className="w-5 h-5 text-slate-400" />
                     Write a product review
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-bold text-slate-800 mr-1">Okay</span>
                      <Star className="w-5 h-5 text-green-600 fill-green-600" />
                      <Star className="w-5 h-5 text-green-600 fill-green-600" />
                      <Star className="w-5 h-5 text-green-600 fill-green-600" />
                      <Star className="w-5 h-5 text-slate-200 fill-slate-200" />
                      <Star className="w-5 h-5 text-slate-200 fill-slate-200" />
                    </div>
                    <button 
                      onClick={() => setIsEditingReview(true)}
                      className="border border-[#ee4923] text-[#ee4923] bg-white px-4 py-1.5 rounded-lg text-[14px] font-semibold flex items-center gap-2 hover:bg-[#ee4923]/5 transition-colors"
                    >
                      <PenLine className="w-4 h-4" />
                      Write review
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="h-2 bg-slate-100 w-full"></div>
          </>
        )}

        {/* Delivery Details */}
        <div className="p-4">
          <h2 className="text-[18px] font-bold text-slate-800 mb-3">Delivery details</h2>
          <div className="bg-slate-50 rounded-xl p-4 space-y-4">
             <div 
               className="flex gap-3 cursor-pointer group"
               onClick={() => setIsAddressExpanded(!isAddressExpanded)}
             >
                <MapPin className="w-5 h-5 text-slate-600 flex-shrink-0 mt-0.5 group-hover:text-slate-800 transition-colors" />
                <p className={`text-[14px] text-slate-700 leading-snug transition-all ${isAddressExpanded ? '' : 'line-clamp-2'}`}>
                  <span className="font-bold text-slate-900 mr-1">{deliveryAddress.type}</span>
                  {deliveryAddress.address}, {deliveryAddress.pincode}
                </p>
             </div>
             <div className="flex gap-3 items-center pt-2">
                <div className="w-5 h-5 flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <p className="text-[14px] font-semibold text-slate-800">
                  {deliveryAddress.name} <span className="font-normal text-slate-600 ml-1">{user?.phone || '9302841832'}</span>
                </p>
             </div>
          </div>
        </div>

        <div className="h-2 bg-slate-100 w-full"></div>

        {/* Price Details */}
        <div className="p-4">
          <h2 className="text-[18px] font-bold text-slate-800 mb-3">Price details</h2>
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 mb-4">
             <div className="space-y-3 text-[14px]">
                <div className="flex justify-between items-center text-slate-700">
                  <span>Listing price</span>
                  <span>₹{orderItems.reduce((acc, curr) => acc + (curr.price * 1.2 * curr.quantity), 0).toFixed(0)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1">Selling price <div className="w-3.5 h-3.5 border border-slate-400 rounded-full flex items-center justify-center text-[8px]">i</div></span>
                  <span>₹{orderItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1">Total fees <ChevronDown className="w-4 h-4" /></span>
                  <span>₹15</span>
                </div>
                <div className="flex justify-between items-center text-slate-700">
                  <span className="flex items-center gap-1">Delivery Charges</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
             </div>
             
             <div className="border-t border-dashed border-slate-300 my-4"></div>
             
             <div className="flex justify-between items-center text-[15px] font-bold text-slate-800 mb-4">
               <span>Total amount</span>
               <span>₹{orderTotal}</span>
             </div>

             <div className="bg-slate-50 rounded-lg p-3 flex justify-between items-center text-[14px]">
               <span className="text-slate-700">Paid By</span>
               <div className="flex items-center gap-1 font-semibold text-slate-800">
                 <div className="border border-slate-300 rounded px-1 text-[10px] font-black tracking-widest uppercase">{globalOrder?.paymentMethod || 'COD'}</div>
                 {globalOrder?.paymentMethod || 'Cash on Delivery'}
               </div>
             </div>

             <button 
               onClick={handleDownload}
               disabled={isDownloading}
               className="w-full mt-4 flex items-center justify-center gap-2 border border-slate-300 rounded-xl py-3 text-[15px] font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
             >
               <Download className="w-5 h-5" /> 
               {isDownloading ? 'Downloading...' : 'Download Invoice'}
             </button>
          </div>

          {/* Offers earned */}
          <div className="bg-slate-50 rounded-xl overflow-hidden transition-all duration-300">
            <div 
              onClick={() => setIsOffersExpanded(!isOffersExpanded)}
              className="p-4 flex items-center justify-between text-[14px] font-medium text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                Offers earned
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOffersExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isOffersExpanded && (
              <div className="p-4 pt-0 text-[13px] text-slate-600 border-t border-slate-200 mt-2">
                <ul className="list-disc pl-5 space-y-1">
                  <li>You won 50 SuperCoins on this purchase</li>
                  <li>Get 10% off on your next order up to ₹100</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="h-2 bg-slate-100 w-full"></div>

        {/* Order ID bottom */}
        <div className="p-4 pb-28">
          <h3 className="text-[14px] font-bold text-slate-800">Order ID</h3>
          <div className="flex items-center gap-2 text-[13px] text-slate-500 mt-1">
            <span>{id}</span>
            <Copy onClick={handleCopyId} className="w-4 h-4 text-[#ee4923] cursor-pointer hover:text-[#ff5c3f]" />
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-2 bg-white border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] z-50">
         <button 
           onClick={() => navigate('/')}
           className="w-full border border-[#ee4923] text-[#ee4923] font-bold text-[13px] py-2.5 rounded-lg hover:bg-[#ee4923]/5 active:bg-[#ee4923]/10 transition-colors"
         >
           Shop more from Mynzo
         </button>
      </div>

      {/* Media Lightbox Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4">
          <button 
            onClick={() => setSelectedMedia(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="max-w-full max-h-full flex items-center justify-center">
            {selectedMedia.type === 'image' ? (
              <img src={selectedMedia.url} className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" alt="Review Media" />
            ) : (
              <video src={selectedMedia.url} controls autoPlay className="max-w-full max-h-[85vh] rounded-lg shadow-2xl" />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
