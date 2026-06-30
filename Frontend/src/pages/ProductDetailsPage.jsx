import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, ShoppingCart, Heart, Send, Star, ChevronRight, Home, Truck, Store, RotateCcw, Banknote, ShieldCheck, ArrowRight, ChevronDown, ChevronUp, CheckCircle2, CheckCircle, X, Play, MapPin } from 'lucide-react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useApp } from '../context/AppContext';
import analytics from '../utils/analytics';
import { CRAZY_DEALS } from '../data/mockData';
import OptimizedImage from '../components/ui/OptimizedImage';
import { getImageUrl } from '../utils/imageHelper';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { totalCartItems, addToCart, cart, toggleWishlist, isInWishlist, user, setSearchQuery, location: userLocation } = useApp();
  
  const [product, setProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  
  // Video Reels States
  const [productReels, setProductReels] = useState([]);
  const [isUploadReelOpen, setIsUploadReelOpen] = useState(false);
  const [reelRating, setReelRating] = useState(5);
  const [reelCaption, setReelCaption] = useState('');
  const [reelVideoFile, setReelVideoFile] = useState(null);
  const [isUploadingReel, setIsUploadingReel] = useState(false);
  const [isEligibleToReview, setIsEligibleToReview] = useState(false);

  const fetchProductReels = async () => {
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels`);
      const data = await res.json();
      if (res.ok && data.success) {
        // Filter approved reels for this product
        const filtered = (data.reels || []).filter(r => {
          const prodId = r.productId?._id || r.productId;
          return prodId === id;
        });
        setProductReels(filtered);
      }
    } catch (err) {
      console.error('Error fetching reels for product:', err);
    }
  };

  const fetchReviewEligibility = async () => {
    if (!user) {
      setIsEligibleToReview(false);
      return;
    }
    try {
      const token = localStorage.getItem('userToken');
      if (!token) return;
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels/check-eligibility?productId=${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsEligibleToReview(data.eligible);
      }
    } catch (err) {
      console.error('Error checking review eligibility:', err);
    }
  };

  useEffect(() => {
    fetchProductReels();
    fetchReviewEligibility();
  }, [id, user]);

  const handleUploadReel = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!reelVideoFile) {
      alert('Please select a video file first!');
      return;
    }

    const token = localStorage.getItem('userToken');
    if (!token) {
      alert('Please log in again');
      return;
    }

    const formData = new FormData();
    formData.append('productId', id);
    formData.append('rating', reelRating);
    formData.append('caption', reelCaption);
    formData.append('video', reelVideoFile);

    try {
      setIsUploadingReel(true);
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/reels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setToastMessage('Reel review uploaded! Awaiting Admin Approval.');
        setTimeout(() => setToastMessage(''), 4000);
        setIsUploadReelOpen(false);
        setReelCaption('');
        setReelVideoFile(null);
      } else {
        alert(data.message || 'Failed to upload video review');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server');
    } finally {
      setIsUploadingReel(false);
    }
  };

  // Accordion and Tab States
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);
  const [isReviewsOpen, setIsReviewsOpen] = useState(true);
  const [activeDetailTab, setActiveDetailTab] = useState('specifications');
  
  // Review Media Viewer State
  const [selectedReviewMedia, setSelectedReviewMedia] = useState(null);
  const videoRef = useRef(null);
  useEffect(() => {
    if (selectedReviewMedia?.type === 'video' && videoRef.current) {
      videoRef.current.play().catch(e => console.error("Autoplay prevented:", e));
    }
  }, [selectedReviewMedia]);

  const [pincode, setPincode] = useState('');
  const [deliveryCharge, setDeliveryCharge] = useState(null);
  const [deliveryChargeCOD, setDeliveryChargeCOD] = useState(null);
  const [deliveryEtd, setDeliveryEtd] = useState('');
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);

  // Auto-fetch user's default address pincode and estimate shipping
  useEffect(() => {
    if (user && product) {
      const fetchDefaultAddressAndEstimate = async () => {
        try {
          const token = localStorage.getItem('userToken');
          if (!token) return;
          const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiBase}/addresses`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            const defaultAddress = data.data[0];
            if (defaultAddress.pincode) {
              setPincode(defaultAddress.pincode);
              // Calculate automatically
              const [prepaidRes, codRes] = await Promise.all([
                fetch(`${apiBase}/api/shiprocket/estimate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ deliveryPincode: defaultAddress.pincode, weight: product?.shippingSpecs?.weight || 0.5, cod: 0 })
                }),
                fetch(`${apiBase}/api/shiprocket/estimate`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ deliveryPincode: defaultAddress.pincode, weight: product?.shippingSpecs?.weight || 0.5, cod: 1 })
                })
              ]);
              const estimateData = await prepaidRes.json();
              const estimateDataCOD = await codRes.json();
              
              if (prepaidRes.ok && estimateData.success) {
                setDeliveryCharge(estimateData.deliveryCharge);
                setDeliveryEtd(estimateData.etd);
                if (codRes.ok && estimateDataCOD.success) {
                  setDeliveryChargeCOD(estimateDataCOD.deliveryCharge);
                }
              }
            }
          }
        } catch (err) {
          console.error("Error auto-fetching pincode:", err);
        }
      };
      // only run once when product is loaded
      fetchDefaultAddressAndEstimate();
    }
  }, [user, product?.id]);


  const handleCheckPincode = async () => {
    if (!pincode || pincode.length !== 6) {
      alert('Please enter a valid 6-digit pincode');
      return;
    }
    setIsCheckingPincode(true);
    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const [prepaidRes, codRes] = await Promise.all([
        fetch(`${apiBase}/api/shiprocket/estimate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliveryPincode: pincode, weight: product?.shippingSpecs?.weight || 0.5, cod: 0 })
        }),
        fetch(`${apiBase}/api/shiprocket/estimate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliveryPincode: pincode, weight: product?.shippingSpecs?.weight || 0.5, cod: 1 })
        })
      ]);
      const data = await prepaidRes.json();
      const dataCOD = await codRes.json();
      if (prepaidRes.ok && data.success) {
        setDeliveryCharge(data.deliveryCharge);
        setDeliveryEtd(data.etd);
        if (codRes.ok && dataCOD.success) {
          setDeliveryChargeCOD(dataCOD.deliveryCharge);
        }
      } else {
        alert('Could not fetch delivery details for this pincode');
        setDeliveryCharge(null);
        setDeliveryChargeCOD(null);
        setDeliveryEtd('');
      }
    } catch (err) {
      alert('Error checking serviceability');
      setDeliveryCharge(null);
      setDeliveryChargeCOD(null);
      setDeliveryEtd('');
    } finally {
      setIsCheckingPincode(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/admin/catalog/products/${id}`);
        const data = await res.json();
        
        if (res.ok && data.success && data.product) {
          const p = data.product;
          console.log("=== FRONTEND PRODUCT DATA ===", { id: p._id, weight: p.shippingSpecs?.weight });
          
          let productImages = p.images || [];
          if (productImages.length === 0) {
            productImages = ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'];
          }
          
          const normalised = {
            id: p._id || p.id,
            name: p.name,
            desc: p.description || '',
            price: p.sellingPrice,
            originalPrice: p.mrp || p.sellingPrice,
            discount: p.discountLabel || (p.mrp ? `${Math.round((1 - p.sellingPrice / p.mrp) * 100)}% OFF` : '0% OFF'),
            rating: p.rating || 0,
            type: (p.category || '').toLowerCase(),
            image: getImageUrl(productImages[0]),
            images: productImages.map(getImageUrl),
            brandName: p.brandName || 'Mynzo Originals',
            flags: p.flags || {},
            stock: p.stock || 0,
            highlights: p.highlights || {},
            technicalSpecs: p.technicalSpecs || {},
            manufacturerInfo: p.manufacturerInfo || '',
            shippingSpecs: p.shippingSpecs || {}
          };
          
          setProduct(normalised);

          // Fetch similar products dynamically
          try {
             const simRes = await fetch(`${apiBase}/admin/catalog/products`);
             const simData = await simRes.json();
             if (simRes.ok && simData.success) {
                const similar = simData.products.filter(p => p._id !== p.id && p._id !== id).slice(0, 10);
                setSimilarProducts(similar);
             }
          } catch(e) { console.error(e); }

        } else {
          const foundProduct = CRAZY_DEALS.find(item => item.id === id);
          if (foundProduct) {
            setProduct({
              ...foundProduct,
              images: [foundProduct.image]
            });
          } else {
            setProduct({
              id: 'fallback',
              name: 'Product Details',
              desc: 'Product description goes here',
              price: 999,
              originalPrice: 1999,
              discount: '50% OFF',
              image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800',
              images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800'],
              brandName: 'Mynzo Originals',
              highlights: {},
              technicalSpecs: {}
            });
          }
        }
      } catch (err) {
        console.error('Error fetching product details:', err);
        const foundProduct = CRAZY_DEALS.find(item => item.id === id);
        if (foundProduct) {
          setProduct({
            ...foundProduct,
            images: [foundProduct.image]
          });
        }
      } finally {
        setIsLoading(false);
        setActiveImageIndex(0);
        window.scrollTo(0, 0);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product && product.id !== 'fallback') {
      analytics.trackProductView(product.id, product.name, product.type);
    }
  }, [product]);

  if (isLoading || !product) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-100 font-sans pb-[80px]">
        {/* Sticky Header Skeleton */}
        <header className="bg-white sticky top-0 z-50 flex items-center justify-between px-3 py-3 shadow-sm border-b border-slate-100 animate-pulse">
          <div className="w-6 h-6 bg-slate-200 rounded-full" />
          <div className="flex-1 mx-3 h-8 bg-slate-200 rounded" />
          <div className="w-6 h-6 bg-slate-200 rounded-full" />
        </header>

        {/* Hero Image Section Skeleton */}
        <div className="w-full aspect-[3/4] bg-slate-200 animate-pulse" />

        {/* Product Info Section Skeleton */}
        <div className="bg-white p-4 space-y-3 animate-pulse">
          <div className="w-3/4 h-5 bg-slate-200 rounded" />
          <div className="w-1/2 h-4 bg-slate-200 rounded" />
          <div className="w-1/3 h-6 bg-slate-200 rounded" />
        </div>

        {/* Size Selector Skeleton */}
        <div className="bg-white p-4 mt-2 space-y-3 animate-pulse">
          <div className="w-24 h-4 bg-slate-200 rounded" />
          <div className="flex gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="w-12 h-12 rounded-xl bg-slate-200" />
            ))}
          </div>
        </div>

        {/* Product Details Description Skeleton */}
        <div className="bg-white p-4 mt-2 space-y-2.5 animate-pulse">
          <div className="w-28 h-5 bg-slate-200 rounded" />
          <div className="w-full h-3.5 bg-slate-200 rounded" />
          <div className="w-5/6 h-3.5 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product);
    setToastMessage('Item added to cart!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleBuyNow = () => {
    const itemInCart = cart.find(item => item.id === product.id);
    if (!itemInCart) {
      addToCart(product);
    }
    navigate('/review-order');
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Check out this product',
      text: product?.desc || 'Great product on Mynzo',
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };


  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans relative pb-[80px] md:pb-12 animate-fade-in select-none">
      
      {/* Sticky Header (Mobile Only) */}
      <header className="bg-white sticky top-0 z-50 flex items-center justify-between px-3 py-2 shadow-sm md:hidden">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-700">
          <ArrowLeft className="w-6 h-6" />
        </button>
        
        <div className="flex-1 mx-2 bg-slate-50 rounded flex items-center px-3 py-1.5 border border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-2" />
          <input 
            type="text" 
            placeholder="Search for products" 
            className="w-full bg-transparent outline-none text-sm text-slate-700"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && localSearchQuery.trim() !== '') {
                setSearchQuery(localSearchQuery);
                navigate('/categories');
              }
            }}
          />
        </div>

        <button onClick={() => navigate('/cart')} className="p-2 relative text-slate-700">
          <ShoppingCart className="w-6 h-6" />
          {totalCartItems > 0 && (
            <span className="absolute top-0 right-0 bg-[#ee4923] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
              {totalCartItems}
            </span>
          )}
        </button>
      </header>

      {/* Main Content wrapper */}
      <div className="max-w-7xl mx-auto w-full px-0 md:px-6 lg:px-8 md:py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery on desktop */}
        <div className="md:col-span-7 bg-white p-0 md:p-6 md:rounded-2xl md:border md:border-slate-100 md:shadow-xs space-y-6">
          {/* Hero Image Section */}
          <div className="relative bg-white border-b border-slate-100 md:border-b-0">
            <div className="w-full aspect-square relative overflow-hidden rounded-none md:rounded-2xl">
              {/* Main Product Images Slider */}
              <div 
                id="product-image-slider"
                className="w-full h-full flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
                style={{ touchAction: 'pan-x pan-y pinch-zoom' }}
                onScroll={(e) => {
                  const scrollPosition = e.target.scrollLeft;
                  const width = e.target.offsetWidth;
                  setActiveImageIndex(Math.round(scrollPosition / width));
                }}
              >
                {(product.images && product.images.length > 0 ? product.images : [product.image]).map((img, idx) => (
                  <div
                    key={idx}
                    className="w-full h-full flex-shrink-0 snap-center relative overflow-hidden cursor-pointer"
                    onClick={() => setFullscreenImage(img)}
                  >
                    <OptimizedImage src={img} alt={`${product.name} - view ${idx + 1}`} type="product" className="absolute inset-0" />
                  </div>
                ))}
              </div>

              {/* Dots Indicator Overlay */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {product.images.map((_, idx) => (
                    <div 
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === idx ? 'bg-[#ee4923] w-3.5' : 'bg-white/60'}`}
                    />
                  ))}
                </div>
              )}

              {/* Right Action Overlays */}
              <div className="absolute top-4 right-4 flex flex-col gap-3 z-10">
                <button 
                  onClick={() => {
                    if (!user) {
                      navigate('/login');
                      return;
                    }
                    toggleWishlist(product);
                  }}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                >
                  <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
                </button>
                <button 
                  onClick={handleShare}
                  className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform cursor-pointer"
                >
                  <Send className="w-5 h-5 text-slate-600 ml-[-2px]" />
                </button>
              </div>

              {/* Left Rating Badge Overlay */}
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md shadow-md flex items-center gap-1">
                <span className="text-[11px] font-bold text-[#02006c]">4.5</span>
                <Star className="w-2.5 h-2.5 fill-[#ee4923] text-[#ee4923]" />
                <span className="text-slate-300 text-[10px] mx-0.5">|</span>
                <span className="text-[10px] text-slate-500 font-medium">1.2k</span>
              </div>

              {/* Highlights Overlay (Gradient Mask) */}
              <div className={`absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent pointer-events-none flex flex-col justify-center px-4 transition-opacity duration-300 ${activeImageIndex === 1 ? 'opacity-100' : 'opacity-0'}`}>
                <h2 className="text-white font-black tracking-tight text-xl mb-4 drop-shadow-md">Key Highlights</h2>
                
                <div className="space-y-3">
                  {product.highlights && Object.keys(product.highlights).length > 0 ? (
                    Object.entries(product.highlights).slice(0, 5).map(([key, val]) => (
                      <div key={key} className="flex flex-col border-b border-white/20 pb-0.5 w-28">
                        <span className="text-[10px] text-white/70 capitalize">{key}</span>
                        <span className="text-xs font-bold text-white drop-shadow truncate">{val}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex flex-col border-b border-white/20 pb-1 w-24">
                        <span className="text-[10px] text-white/70">Fit</span>
                        <span className="text-sm font-bold text-white drop-shadow">Regular</span>
                      </div>
                      <div className="flex flex-col border-b border-white/20 pb-1 w-24">
                        <span className="text-[10px] text-white/70">Fabric</span>
                        <span className="text-sm font-bold text-white drop-shadow">Premium Quality</span>
                      </div>
                      <div className="flex flex-col border-b border-white/20 pb-1 w-24">
                        <span className="text-[10px] text-white/70">Origin</span>
                        <span className="text-sm font-bold text-white drop-shadow">Made in India</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Image Thumbnails Row */}
            {product.images && product.images.length > 1 && (
              <div className="flex justify-center gap-2 mt-4 px-4 overflow-x-auto scrollbar-none">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveImageIndex(idx);
                      const slider = document.getElementById('product-image-slider');
                      if (slider) {
                        slider.scrollTo({
                          left: idx * slider.offsetWidth,
                          behavior: 'smooth'
                        });
                      }
                    }}
                    className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all flex-shrink-0 relative cursor-pointer ${
                      activeImageIndex === idx ? 'border-[#ee4923] scale-105 shadow-sm' : 'border-slate-200 opacity-60'
                    }`}
                  >
                    <OptimizedImage src={img} alt="" type="product" className="absolute inset-0" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Info & Specs on desktop */}
        <div className="md:col-span-5 bg-white p-4 md:p-6 md:rounded-2xl md:border md:border-slate-100 md:shadow-xs space-y-6 md:sticky md:top-28">
          {/* Brand & Desc */}
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-extrabold block mb-1">
              {product.brandName || 'Mynzo Originals'}
            </span>
            <h1 className="text-base md:text-xl font-bold text-[#02006c] leading-tight">
              {product.name}
            </h1>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {product.desc}
            </p>
          </div>

          {/* Pricing */}
          <div className="border-b border-slate-100 pb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-[#ee4923] font-bold text-lg">{product.discount} OFF</span>
              <span className="text-2xl md:text-3xl font-black text-[#02006c] tracking-tight">₹{product.price}</span>
            </div>
            <p className="text-xs text-slate-400 line-through mt-1">MRP ₹{product.originalPrice}</p>
          </div>

          {/* Size Selector */}
          {['tee', 'pants', 'blouse', 'outfit'].includes(product.type) && (
            <div className="pb-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-sm text-[#02006c]">Select Size</span>
                <button 
                  onClick={() => setIsSizeChartOpen(true)}
                  className="text-[#ee4923] font-bold text-[11px] cursor-pointer hover:underline"
                >
                  Size Chart
                </button>
              </div>
              
              <div className="flex gap-2.5">
                {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                  const isSelected = selectedSize === size;
                  const isOutOfStock = size === 'S';
                  
                  return (
                    <button
                      key={size}
                      disabled={isOutOfStock}
                      onClick={() => setSelectedSize(size)}
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center text-xs font-bold transition-all relative overflow-hidden cursor-pointer
                        ${isSelected ? 'border-[#ee4923] text-[#ee4923] bg-[#ee4923]/5' : 
                          isOutOfStock ? 'border-dashed border-slate-300 text-slate-300 bg-slate-50 cursor-not-allowed' : 
                          'border-slate-300 text-slate-700 hover:border-slate-400'
                        }
                      `}
                    >
                      {size}
                      {isOutOfStock && <div className="absolute w-[150%] h-[1px] bg-slate-300 -rotate-45" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Delivery Details Section */}
          <div className="pb-4 border-b border-slate-100">
            <h3 className="font-bold text-sm text-[#02006c] mb-3">Delivery Details</h3>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Enter Pincode" 
                  className="flex-1 bg-transparent text-sm outline-none text-slate-700 font-semibold"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                />
                <button 
                  onClick={handleCheckPincode}
                  disabled={isCheckingPincode || pincode.length !== 6}
                  className="text-[#ee4923] text-sm font-bold disabled:opacity-50 cursor-pointer"
                >
                  {isCheckingPincode ? 'Checking...' : 'Check'}
                </button>
              </div>
              
              {deliveryCharge !== null && (
                <div className="pt-2 border-t border-slate-200/60 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1 font-semibold"><Truck className="w-3.5 h-3.5 text-slate-400"/> Prepaid Delivery</span>
                    <span className="font-extrabold text-slate-900">{deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE'}</span>
                  </div>
                  {deliveryChargeCOD !== null && (
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="flex items-center gap-1 font-semibold"><Truck className="w-3.5 h-3.5 text-slate-400"/> COD Delivery</span>
                      <span className="font-extrabold text-slate-900">{deliveryChargeCOD > 0 ? `₹${deliveryChargeCOD}` : 'FREE'}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-700">
                    <span className="flex items-center gap-1 font-semibold"><CheckCircle className="w-3.5 h-3.5 text-emerald-600"/> Est. Delivery Date</span>
                    <span className="font-bold text-emerald-600">{deliveryEtd || '3-5 Days'}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Purchase Action Buttons (Visible only on md: and above) */}
          <div className="hidden md:flex gap-3 pt-2">
            <button 
              onClick={handleAddToCart}
              className="flex-1 bg-white hover:bg-slate-50 border border-[#02006c] rounded-xl text-[#02006c] font-black text-xs uppercase tracking-wider py-3.5 transition-colors cursor-pointer"
            >
              Add to cart
            </button>
            <button 
              onClick={handleBuyNow}
              className="flex-1 bg-[#ee4923] hover:bg-orange-600 rounded-xl text-white font-black text-xs uppercase tracking-wider py-3.5 shadow-md shadow-orange-500/20 transition-colors cursor-pointer"
            >
              Buy at ₹{product.price}
            </button>
          </div>
        </div>

        {/* Bottom Area (Specs & Reviews & Similar Products) - Spans full 12 columns */}
        <div className="col-span-1 md:col-span-12 grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
          
          {/* Specifications, Highlights & Details - col-span-7 */}
          <div className="md:col-span-7 space-y-6">
            {/* Highlights */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#02006c]">Product Highlights</span>
                  {!isHighlightsOpen && <span className="text-xs text-slate-500">Key features and descriptions</span>}
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center transition-transform">
                  {isHighlightsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>
              
              {isHighlightsOpen && (
                <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-6 animate-fade-in border-t border-slate-100 pt-4">
                  {product.highlights && Object.keys(product.highlights).length > 0 ? (
                    Object.entries(product.highlights).map(([key, val]) => (
                      <div key={key} className="flex flex-col border-b border-slate-50 pb-2">
                        <span className="text-[11px] text-slate-400 mb-0.5 capitalize font-extrabold">{key}</span>
                        <span className="text-xs font-bold text-slate-800">{val}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex flex-col border-b border-slate-50 pb-2">
                        <span className="text-[11px] text-slate-400 mb-0.5 font-extrabold">Quality</span>
                        <span className="text-xs font-bold text-slate-800">Premium Grade</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-50 pb-2">
                        <span className="text-[11px] text-slate-400 mb-0.5 font-extrabold">Warranty</span>
                        <span className="text-xs font-bold text-slate-800">1 Year Warranty</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Technical Specifications */}
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDetailsOpen(!isDetailsOpen)}>
                <div className="flex flex-col">
                  <span className="font-bold text-base text-[#02006c]">All Details & Specs</span>
                  {!isDetailsOpen && <span className="text-xs text-slate-500">Manufacturer info and complete list</span>}
                </div>
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center transition-transform">
                  {isDetailsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isDetailsOpen && (
                <div className="mt-4 animate-fade-in border-t border-slate-100 pt-4">
                  <div className="flex gap-2 mb-4">
                    <button 
                      onClick={() => setActiveDetailTab('specifications')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeDetailTab === 'specifications' ? 'bg-[#02006c] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                    >
                      Specifications
                    </button>
                    <button 
                      onClick={() => setActiveDetailTab('manufacturer')}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${activeDetailTab === 'manufacturer' ? 'bg-[#02006c] text-white' : 'bg-slate-50 text-slate-600 border border-slate-200'}`}
                    >
                      Manufacturer Info
                    </button>
                  </div>

                  {activeDetailTab === 'specifications' && (
                    <div className="animate-fade-in">
                      <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                        {product.technicalSpecs && Object.keys(product.technicalSpecs).length > 0 ? (
                          Object.entries(product.technicalSpecs).map(([key, val]) => (
                            <div key={key} className="flex flex-col border-b border-slate-100 pb-2">
                              <span className="text-[11px] text-slate-400 mb-0.5 capitalize font-extrabold">{key}</span>
                              <span className="text-xs font-bold text-slate-800">{val}</span>
                            </div>
                          ))
                        ) : (
                          <>
                            <div className="flex flex-col border-b border-slate-100 pb-2">
                              <span className="text-[11px] text-slate-400 mb-0.5 font-extrabold">Brand</span>
                              <span className="text-xs font-bold text-slate-800">{product.brandName || 'Generic'}</span>
                            </div>
                            <div className="flex flex-col border-b border-slate-100 pb-2">
                              <span className="text-[11px] text-slate-400 mb-0.5 font-extrabold">Type</span>
                              <span className="text-xs font-bold text-slate-800">Premium quality product</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {activeDetailTab === 'manufacturer' && (
                    <div className="text-xs font-bold text-slate-600 animate-fade-in space-y-2">
                      <p><span className="text-slate-800 uppercase tracking-wide text-[10px] block text-slate-400">Manufactured by</span> {product.manufacturerInfo || 'Premium Brand Logistics Ltd.'}</p>
                      <p><span className="text-slate-800 uppercase tracking-wide text-[10px] block text-slate-400">Country of Origin</span> India</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ratings, Reviews & Reels - col-span-5 */}
          <div className="md:col-span-5 bg-white p-4 rounded-2xl border border-slate-100 shadow-3xs space-y-6">
            <div className="flex items-center justify-between cursor-pointer animate-fade-in" onClick={() => setIsReviewsOpen(!isReviewsOpen)}>
              <span className="font-bold text-base text-[#02006c]">Ratings & Reviews</span>
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center transition-transform">
                {isReviewsOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {isReviewsOpen && (
              <div className="space-y-4 animate-fade-in border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2.5">
                  <span className="text-3xl font-black text-slate-800">4.1</span>
                  <Star className="w-6 h-6 fill-emerald-600 text-emerald-600" />
                  <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded text-xs font-extrabold">Very Good</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>based on 63 ratings by</span>
                  <CheckCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Verified Buyers</span>
                </div>

                {/* Video Review Reels list */}
                {productReels.length > 0 && (
                  <div className="border-t border-slate-100 pt-4">
                    <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Video Reviews (Reels)</h4>
                    <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2">
                      {productReels.map((reel) => {
                        const videoUrl = getImageUrl(reel.video);
                        return (
                          <div 
                            key={reel._id}
                            onClick={() => setSelectedReviewMedia({ type: 'video', url: videoUrl, reel })}
                            className="relative w-20 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-black cursor-pointer shadow-md group border border-slate-100"
                          >
                            <div className="absolute inset-0 bg-black/15 flex items-center justify-center group-hover:bg-black/35 transition-colors z-10">
                              <Play className="w-6 h-6 text-white fill-white opacity-85" />
                            </div>
                            <video src={videoUrl} className="w-full h-full object-cover opacity-80" muted playsInline />
                            
                            <div className="absolute bottom-0 left-0 right-0 p-1 bg-gradient-to-t from-black/90 to-transparent text-white text-[8px] z-10">
                              <p className="font-bold truncate">@{reel.username}</p>
                              <div className="flex items-center gap-0.5 mt-0.5">
                                <span>{reel.rating}</span>
                                <Star className="w-1.5 h-1.5 fill-amber-400 text-amber-400" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Upload Reel button */}
                <div>
                  {user && !isEligibleToReview ? (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center text-xs text-rose-600 font-bold leading-relaxed">
                      ⚠️ You can only review products that you have purchased.
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (!user) navigate('/login');
                        else setIsUploadReelOpen(true);
                      }}
                      className="w-full py-3 bg-indigo-50 border border-indigo-200 text-indigo-700 font-extrabold text-xs rounded-xl hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                      Submit Video Review (Reel)
                    </button>
                  )}
                </div>

                {/* Customer Reviews List */}
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Customer Reviews</h4>
                  
                  {productReels.length === 0 ? (
                    <p className="text-center text-slate-400 text-xs py-6 font-semibold">
                      No reviews yet. Be the first to submit a video review!
                    </p>
                  ) : (
                    <div className="space-y-3.5">
                      {productReels.map((reel) => {
                        const videoUrl = getImageUrl(reel.video);
                        return (
                          <div key={reel._id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex gap-3.5 items-start">
                            {/* Playable Video Thumbnail */}
                            <div 
                              onClick={() => setSelectedReviewMedia({ type: 'video', url: videoUrl, reel })}
                              className="relative w-14 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-black cursor-pointer shadow-sm border border-slate-100 group"
                            >
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                                <Play className="w-4 h-4 text-white fill-white opacity-90" />
                              </div>
                              <video src={videoUrl} className="w-full h-full object-cover" muted playsInline />
                            </div>

                            {/* Text content */}
                            <div className="flex-grow space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-extrabold text-[11px] text-slate-800 truncate">
                                  {reel.username}
                                </span>
                                <span className="text-[9px] text-slate-400 font-bold">
                                  {new Date(reel.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                              </div>

                              <div className="flex items-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${i < (reel.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                                  />
                                ))}
                              </div>

                              <p className="text-[11.5px] text-slate-600 font-bold leading-normal break-words">
                                {reel.caption || "No comment provided."}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Products Grid (Spans full width) */}
        <div className="col-span-1 md:col-span-12 bg-white py-6 px-4 md:rounded-2xl md:border md:border-slate-100 md:shadow-xs mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg tracking-tight text-[#02006c]">Similar Products</h3>
            <div 
              onClick={() => navigate('/similar-products')}
              className="w-8 h-8 bg-slate-800 hover:bg-[#ee4923] transition-colors rounded-full flex items-center justify-center cursor-pointer shadow-sm"
            >
              <ArrowRight className="w-4 h-4 text-white" />
            </div>
          </div>
          
          {/* Horizontal Scroll on Mobile, responsive grid layout on Desktop */}
          <div className="flex overflow-x-auto gap-4 pb-2 snap-x scrollbar-none md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-4 md:overflow-visible">
            {similarProducts.length > 0 ? similarProducts.map((deal) => (
              <div 
                key={deal._id} 
                className="w-32 md:w-auto flex-shrink-0 snap-start flex flex-col cursor-pointer group" 
                onClick={() => { navigate(`/product/${deal._id}`); window.scrollTo(0,0); }}
              >
                <div className="aspect-[3/4] bg-[#F8F9FD] rounded-xl overflow-hidden relative mb-2.5">
                  <OptimizedImage src={getImageUrl(deal.images && deal.images[0])} alt={deal.name} type="product" className="absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 left-2 bg-white/90 px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                    <span className="text-[9.5px] font-bold text-slate-800">{deal.rating || '4.2'}</span>
                    <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#02006c] truncate group-hover:text-[#ee4923]">{deal.name}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{deal.description || 'Premium Product'}</p>
                <div className="flex items-center gap-1.5 mt-1 leading-none">
                  <span className="text-xs md:text-sm font-extrabold text-[#ee4923]">₹{deal.sellingPrice}</span>
                  <span className="text-[9.5px] md:text-xs text-slate-400 line-through">₹{deal.mrp || deal.sellingPrice + 500}</span>
                </div>
              </div>
            )) : CRAZY_DEALS.map((deal) => (
              <div 
                key={deal.id} 
                className="w-32 md:w-auto flex-shrink-0 snap-start flex flex-col cursor-pointer group" 
                onClick={() => { navigate(`/product/${deal.id}`); window.scrollTo(0,0); }}
              >
                <div className="aspect-[3/4] bg-[#F8F9FD] rounded-xl overflow-hidden relative mb-2.5">
                  <OptimizedImage src={deal.image} alt={deal.name} type="product" className="absolute inset-0 group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute bottom-2 left-2 bg-white/90 px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-sm">
                    <span className="text-[9.5px] font-bold text-slate-800">4.2</span>
                    <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                  </div>
                </div>
                <h4 className="text-xs font-bold text-[#02006c] truncate group-hover:text-[#ee4923]">{deal.name}</h4>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{deal.desc}</p>
                <div className="flex items-center gap-1.5 mt-1 leading-none">
                  <span className="text-xs md:text-sm font-extrabold text-[#ee4923]">₹{deal.price}</span>
                  <span className="text-[9.5px] md:text-xs text-slate-400 line-through">₹{deal.originalPrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-2.5 z-40 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] max-w-md mx-auto w-full md:hidden">
        <div className="flex gap-2 h-12">
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-white border border-[#02006c] rounded text-[#02006c] font-bold text-[13px] flex items-center justify-center active:bg-slate-50 transition-colors"
          >
            Add to cart
          </button>
          <button 
            onClick={handleBuyNow}
            className="flex-1 bg-[#ee4923] rounded text-white font-bold text-[13px] flex items-center justify-center active:bg-orange-600 shadow-sm transition-colors"
          >
            Buy at ₹{product.price}
          </button>
        </div>
      </div>

      {/* Size Chart Modal */}
      {['tee', 'pants', 'blouse', 'outfit'].includes(product.type) && isSizeChartOpen && (
        <div className="fixed inset-0 z-[100] bg-white flex flex-col animate-fade-in font-sans">
          {/* Header */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-200 sticky top-0 bg-white">
            <button onClick={() => setIsSizeChartOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
              <X className="w-6 h-6 text-slate-500" />
            </button>
            <h2 className="text-[17px] text-slate-800">Size Chart</h2>
          </div>

          <div className="overflow-y-auto flex-1 bg-slate-100">
            {/* Title */}
            <div className="bg-slate-200 px-4 py-4 text-center">
              <h3 className="font-bold text-slate-900 text-sm">{product.name}</h3>
            </div>

            {/* Table */}
            <div className="bg-white overflow-x-auto">
              <table className="w-full text-center text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="p-3 font-bold text-slate-800">Size</th>
                    <th className="p-3 font-bold text-slate-800">Chest</th>
                    <th className="p-3 font-bold text-slate-800">Brand Size</th>
                    <th className="p-3 font-bold text-slate-800">Shoulder</th>
                    <th className="p-3 font-bold text-slate-800">Length</th>
                    <th className="p-3 font-bold text-slate-800">Sleeve Length</th>
                    <th className="p-3 font-bold text-slate-800">Waist</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="p-3 font-black text-black">M</td>
                    <td className="p-3 whitespace-nowrap">35.5 - 37</td>
                    <td className="p-3">M</td>
                    <td className="p-3">14</td>
                    <td className="p-3">23</td>
                    <td className="p-3">6</td>
                    <td className="p-3">34</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-black">L</td>
                    <td className="p-3 whitespace-nowrap">37.5 - 39</td>
                    <td className="p-3">L</td>
                    <td className="p-3">15</td>
                    <td className="p-3">23.5</td>
                    <td className="p-3">6.5</td>
                    <td className="p-3">36</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-black text-black">XL</td>
                    <td className="p-3 whitespace-nowrap">39.5 - 41</td>
                    <td className="p-3">XL</td>
                    <td className="p-3">16</td>
                    <td className="p-3">24</td>
                    <td className="p-3">7</td>
                    <td className="p-3">38</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Measurement Guidelines */}
            <div className="bg-slate-200 p-4 pb-12 mt-1 h-full">
              <h4 className="font-bold text-slate-900 text-sm mb-3">Measurement Guidelines:</h4>
              <p className="text-sm text-slate-800 mb-2 leading-snug">
                <span className="font-bold">Measuring T Shirt Size</span> Not sure about your t shirt size? Follow these simple steps to figure it out:
              </p>
              <ul className="text-sm text-slate-800 space-y-2 leading-snug">
                <li><span className="font-bold">Shoulder</span> - Measure the shoulder at the back, from edge to edge with arms relaxed on both sides</li>
                <li><span className="font-bold">Chest</span> - Measure around the body under the arms at the fullest part of the chest with your arms relaxed at both sides.</li>
                <li><span className="font-bold">Sleeve</span> - Measure from the shoulder seam through the outer arm to the cuff/hem</li>
                <li><span className="font-bold">Neck</span> - Measured horizontally across the neck Length - Measure from the highest point of the shoulder seam to the bottom hem of the garment's</li>
              </ul>
              
              <div className="mt-6 flex justify-center bg-white rounded-lg p-3 max-w-[280px] mx-auto border border-slate-300">
                <svg viewBox="0 0 200 150" className="w-full h-auto text-slate-800" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M60,40 Q100,20 140,40 L180,90 L160,110 L140,90 L140,150 L60,150 L60,90 L40,110 L20,90 Z" />
                  <path strokeDasharray="4 4" d="M100,30 L100,150" stroke="#ee4923" />
                  <path strokeDasharray="4 4" d="M60,90 L140,90" stroke="#ee4923" />
                  <path strokeDasharray="4 4" d="M60,40 L140,40" stroke="#ee4923" />
                  <path strokeDasharray="4 4" d="M40,65 L80,65" stroke="#ee4923" />
                  <text x="90" y="20" fontSize="8" fill="currentColor" stroke="none">NECK</text>
                  <text x="130" y="35" fontSize="8" fill="currentColor" stroke="none">SHOULDER</text>
                  <text x="95" y="100" fontSize="8" fill="currentColor" stroke="none">CHEST</text>
                  <text x="25" y="125" fontSize="8" fill="currentColor" stroke="none">SLEEVE</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-[70px] left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-4 py-2.5 rounded-full shadow-lg text-sm font-bold animate-slide-up z-[60] flex items-center gap-2 whitespace-nowrap">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Media Viewer Modal */}
      {selectedReviewMedia && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex flex-col animate-fade-in font-sans">
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setSelectedReviewMedia(null)} 
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center p-4">
            {selectedReviewMedia.type === 'video' ? (
              <div className="relative w-full max-w-sm aspect-[9/16] bg-black rounded-xl overflow-hidden shadow-2xl">
                <video 
                  ref={videoRef}
                  src={selectedReviewMedia.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline
                  controls
                  onTimeUpdate={(e) => {
                    if (e.target.currentTime >= 8) {
                      e.target.currentTime = 0;
                      e.target.play();
                    }
                  }}
                  className="w-full h-full object-cover" 
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-md p-3 rounded-xl border border-white/10 text-white z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                      {(selectedReviewMedia.reel?.username || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold shadow-sm">@{selectedReviewMedia.reel?.username || 'Aman Sharma'}</span>
                  </div>
                  <p className="text-[10px] line-clamp-2 text-white/90">{selectedReviewMedia.reel?.caption || 'Amazing quality! The fabric feels premium and the fit is exactly as shown.'}</p>
                </div>
              </div>
            ) : (
              <OptimizedImage src={selectedReviewMedia.url} alt="Review" type="product" className="w-full max-w-sm rounded-xl object-contain max-h-[80vh] shadow-2xl" />
            )}
          </div>
        </div>
      )}

      {/* Upload Video Reel Modal */}
      {isUploadReelOpen && (
        <div className="fixed inset-0 z-[150] bg-slate-900/60 backdrop-blur-sm flex items-end justify-center p-4">
          <div className="bg-white rounded-t-3xl rounded-b-3xl w-full max-w-md p-6 space-y-5 shadow-2xl animate-slide-up pb-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base uppercase tracking-wider">Submit video review (reel)</h3>
              <button onClick={() => setIsUploadReelOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadReel} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Rating (1-5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setReelRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-8 h-8 ${star <= reelRating ? 'fill-amber-400' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Review Caption / Text</label>
                <textarea
                  required
                  rows={3}
                  value={reelCaption}
                  onChange={(e) => setReelCaption(e.target.value)}
                  placeholder="Tell us what you loved about this product..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-xs font-bold focus:ring-4 focus:ring-indigo-50 outline-none text-slate-800 placeholder:text-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Select Video File</label>
                <input
                  required
                  type="file"
                  accept="video/*"
                  onChange={(e) => setReelVideoFile(e.target.files[0])}
                  className="w-full text-xs font-bold text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 file:cursor-pointer hover:file:bg-indigo-100"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUploadingReel}
                  className="w-full py-3 bg-[#ee4923] text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none"
                >
                  {isUploadingReel ? 'Uploading Video...' : 'Submit Reel Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Zoom Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[300] bg-black flex flex-col animate-fade-in font-sans touch-none">
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-end z-[310]">
            <button 
              onClick={() => setFullscreenImage(null)} 
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
          <div className="flex-1 flex items-center justify-center w-full h-full overflow-hidden">
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={4}
              centerOnInit={true}
              wheel={{ step: 0.1 }}
              doubleClick={{ mode: 'toggle' }}
              pinch={{ step: 5 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <TransformComponent wrapperStyle={{ width: '100vw', height: '100vh' }} contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <OptimizedImage 
                    src={fullscreenImage} 
                    alt="Zoomed Product" 
                    type="product"
                    objectFit="contain"
                    className="w-full h-auto max-h-[100dvh] pointer-events-auto" 
                  />
                </TransformComponent>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </div>
  );
}
