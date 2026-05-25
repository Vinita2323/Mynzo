import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import avtarImage from '../assets/AvatarProfile-removebg-preview.png';
import { 
  ChevronLeft, User, Lock, Settings, Phone, LogOut, Camera, 
  ChevronRight, Coins, Gift, ShoppingBag, Sparkles, X,
  CreditCard, Globe, Bell, Headphones, Store, FileText, HelpCircle,
  Heart, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CRAZY_DEALS } from '../data/mockData';

// Dynamic SVG Avatar Component
function DynamicAvatar({ config, size = "w-20 h-20" }) {
  if (!config) return null;
  const { skinTone, hairStyle, hairColor, outfitColor, accessory } = config;

  return (
    <svg viewBox="0 0 100 100" className={`${size} rounded-full shadow-inner bg-slate-50`} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="50" fill="#F8FAFC" />

      {/* Back Hair */}
      {hairStyle === 'crop' && (
        <circle cx="50" cy="18" r="15" fill={hairColor} />
      )}
      {hairStyle === 'long' && (
        <path d="M 25 40 L 25 80 C 25 90 40 95 50 95 C 60 95 75 90 75 80 L 75 40 Z" fill={hairColor} />
      )}
      {hairStyle === 'curly' && (
        <path d="M 20 40 Q 15 60 25 70 Q 50 80 75 70 Q 85 60 80 40 Z" fill={hairColor} />
      )}

      {/* Neck */}
      <path d="M 42 65 L 42 85 L 58 85 L 58 65 Z" fill={skinTone} />
      
      {/* Outfit */}
      <path d="M 20 100 C 20 80 35 75 50 75 C 65 75 80 80 80 100 Z" fill={outfitColor} />
      <path d="M 38 75 C 45 82 55 82 62 75" fill="none" stroke="#E2E8F0" strokeWidth="2" />

      {/* Face Base */}
      <ellipse cx="50" cy="48" rx="22" ry="25" fill={skinTone} />
      
      {/* Ears */}
      <ellipse cx="27" cy="48" rx="3.5" ry="5.5" fill={skinTone} />
      <ellipse cx="73" cy="48" rx="3.5" ry="5.5" fill={skinTone} />

      {/* Eyes */}
      <circle cx="39" cy="45" r="5" fill="#FFFFFF" />
      <circle cx="39" cy="45" r="3.5" fill="#4A2F1D" />
      <circle cx="39" cy="45" r="1.5" fill="#000000" />
      <circle cx="37.5" cy="43.5" r="1.2" fill="#FFFFFF" />

      <circle cx="61" cy="45" r="5" fill="#FFFFFF" />
      <circle cx="61" cy="45" r="3.5" fill="#4A2F1D" />
      <circle cx="61" cy="45" r="1.5" fill="#000000" />
      <circle cx="62.5" cy="43.5" r="1.2" fill="#FFFFFF" />

      {/* Eyelashes / Eyebrows */}
      <path d="M 33 42 Q 39 37 45 42" fill="none" stroke="#2B1A10" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 55 42 Q 61 37 67 42" fill="none" stroke="#2B1A10" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M 34 38 Q 39 36 44 38" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
      <path d="M 56 38 Q 61 36 66 38" fill="none" stroke={hairColor} strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />

      {/* Cheek blush */}
      <ellipse cx="34" cy="52" rx="4" ry="2.5" fill="#FF8A8A" opacity="0.4" />
      <ellipse cx="66" cy="52" rx="4" ry="2.5" fill="#FF8A8A" opacity="0.4" />

      {/* Nose */}
      <path d="M 49 53 Q 50 55 51 53" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" strokeLinecap="round" />

      {/* Mouth */}
      <path d="M 43 59 Q 50 64 57 59 Q 50 62 43 59 Z" fill="#FFFFFF" stroke="#D67575" strokeWidth="0.8" />

      {/* Front Hair */}
      {hairStyle === 'crop' && (
        <g fill={hairColor}>
          <path d="M 27 45 C 25 30 35 15 50 15 C 65 15 75 30 73 45 C 73 35 65 22 50 22 C 35 22 27 35 27 45 Z" />
          <path d="M 27 40 C 35 25 45 25 55 32 C 45 28 35 32 27 40 Z" />
          <path d="M 73 40 C 65 25 55 25 45 32 C 55 28 65 32 73 40 Z" />
          <path d="M 27 40 Q 22 55 25 65 Q 26 55 29 45 Z" />
          <path d="M 73 40 Q 78 55 75 65 Q 74 55 71 45 Z" />
        </g>
      )}
      {hairStyle === 'long' && (
        <g fill={hairColor}>
          <path d="M 27 45 C 25 30 35 15 50 15 C 65 15 75 30 73 45 C 73 35 65 22 50 22 C 35 22 27 35 27 45 Z" />
          <path d="M 27 40 Q 30 20 50 30 Q 40 25 27 40 Z" />
          <path d="M 73 40 Q 70 20 50 30 Q 60 25 73 40 Z" />
        </g>
      )}
      {hairStyle === 'curly' && (
        <g fill={hairColor}>
          <circle cx="35" cy="22" r="10" />
          <circle cx="50" cy="16" r="12" />
          <circle cx="65" cy="22" r="10" />
          <circle cx="27" cy="32" r="9" />
          <circle cx="73" cy="32" r="9" />
        </g>
      )}
      {hairStyle === 'spiky' && (
        <g fill={hairColor}>
          <path d="M 26 40 L 32 20 L 40 28 L 50 12 L 60 28 L 68 20 L 74 40 C 65 30 35 30 26 40 Z" />
        </g>
      )}

      {/* Accessories */}
      {accessory === 'glasses' && (
        <g stroke="#1E293B" strokeWidth="2.5" fill="none">
          <circle cx="39" cy="45" r="9" />
          <circle cx="61" cy="45" r="9" />
          <line x1="48" y1="45" x2="52" y2="45" />
          <line x1="30" y1="43" x2="25" y2="40" />
          <line x1="70" y1="43" x2="75" y2="40" />
        </g>
      )}
      {accessory === 'headphones' && (
        <g>
          <path d="M 24 45 A 28 28 0 0 1 76 45" stroke="#02006c" strokeWidth="4.5" fill="none" />
          <rect x="16" y="38" width="8" height="18" rx="4" fill="#02006c" />
          <rect x="76" y="38" width="8" height="18" rx="4" fill="#02006c" />
        </g>
      )}
      {accessory === 'crown' && (
        <path d="M 33 22 L 38 6 L 50 15 L 62 6 L 67 22 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
      )}
    </svg>
  );
}

export default function ProfilePage() {
  const { coins, user, setUser } = useApp();
  const navigate = useNavigate();

  // Load avatar config from sessionStorage
  const [avatarConfig, setAvatarConfig] = useState(() => {
    const saved = sessionStorage.getItem('userAvatar');
    return saved ? JSON.parse(saved) : {
      skinTone: "#FFDBB5",
      hairStyle: "crop",
      hairColor: "#3E2723",
      outfitColor: "#F8FAFC",
      accessory: "none"
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWalletBalance, setShowWalletBalance] = useState(false);
  const [tempConfig, setTempConfig] = useState({ ...avatarConfig });
  const [modalStep, setModalStep] = useState(0); // 0 = Welcome onboarding, 1 = Creator editor
  const [infoModalType, setInfoModalType] = useState(null); // 'terms', 'faq', or null

  // Custom Image Upload State
  const [uploadedImage, setUploadedImage] = useState(() => {
    return sessionStorage.getItem('userUploadedImage') || null;
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUploadedImage(base64String);
        sessionStorage.setItem('userUploadedImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!user) {
    return (
      <div className="bg-slate-100 min-h-[100dvh] pb-24 font-sans animate-fade-in flex flex-col">
        
        {/* Sticky App Header */}
        <div className="bg-[#FFE4D6] px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center text-[#02006c] hover:bg-white active:scale-95 transition-all cursor-pointer shadow-sm flex-shrink-0"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-[#02006c] text-[20px] font-black tracking-tight">Profile</h1>
        </div>

        {/* Login Section Card */}
        <div className="bg-white px-4 py-4 mb-2 shadow-sm mt-2">
          <div className="flex items-center justify-between">
            <span className="text-[14px] text-[#02006c] font-medium">Log in to get exclusive offers</span>
            <button 
              onClick={() => navigate('/login')}
              className="bg-[#02006c] hover:bg-blue-900 active:scale-95 text-white text-[13px] font-bold py-2 px-6 rounded transition-all shadow-sm"
            >
              Log In
            </button>
          </div>
        </div>



        {/* Recently Viewed Stores */}
        <div className="bg-white p-4 mb-2 shadow-sm">
          <h3 className="text-[15px] font-bold text-slate-800 mb-3">Recently Viewed Stores</h3>
          <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-none">
            {CRAZY_DEALS.slice(0, 3).map((deal) => (
              <div key={deal.id} className="w-24 flex-shrink-0 flex flex-col items-center border border-slate-100 rounded-lg p-1.5 cursor-pointer hover:border-orange-200 hover:shadow-sm transition-all group">
                <div className="w-full aspect-[4/5] overflow-hidden rounded mb-2 bg-[#F8F9FD]">
                  <img src={deal.image} alt={deal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <span className="text-[10px] font-bold text-slate-600 text-center truncate w-full px-1 group-hover:text-[#02006c] transition-colors">{deal.name}</span>
              </div>
            ))}
          </div>
        </div>



        {/* Feedback & Information */}
        <div className="bg-white shadow-sm mb-4">
          <h3 className="text-[15px] font-bold text-slate-800 p-4 pb-2">Feedback & Information</h3>
          <div className="flex flex-col">
            {[
              { icon: FileText, label: 'Terms, Policies and Licenses', id: 'terms' },
              { icon: HelpCircle, label: 'Browse FAQs', id: 'faq' },
              { icon: Phone, label: 'Help & Support', path: '/help' }
            ].map((item, idx) => (
              <div 
                key={idx} 
                onClick={() => {
                  if (item.path) {
                    navigate(item.path);
                  } else {
                    setInfoModalType(item.id);
                  }
                }}
                className="flex items-center gap-4 p-4 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50 group transition-colors"
              >
                <item.icon className="w-5 h-5 text-[#02006c] group-hover:scale-110 transition-transform" />
                <span className="text-[13px] font-medium text-slate-700 flex-1 group-hover:text-[#02006c] transition-colors">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#FF6E54] group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>

        {/* Info Modals */}
        <AnimatePresence>
          {infoModalType === 'terms' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0a0927]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md overflow-hidden flex flex-col h-[85vh] shadow-2xl border-t border-slate-100"
              >
                <div className="w-full flex justify-center pt-4 pb-2 bg-white relative z-20">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>
                <div className="px-6 pb-4 pt-1 flex items-center justify-between border-b border-slate-100">
                  <h3 className="text-lg font-black text-[#02006c]">Terms & Policies</h3>
                  <button onClick={() => setInfoModalType(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-4.5 h-4.5 text-slate-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600">
                  <h4 className="font-bold text-slate-800">1. Acceptance of Terms</h4>
                  <p>By using Mynzo, you agree to these conditions. Please read them carefully.</p>
                  <h4 className="font-bold text-slate-800">2. Privacy Policy</h4>
                  <p>Your privacy is important to us. We only collect information necessary to provide you with our services.</p>
                  <h4 className="font-bold text-slate-800">3. Return & Refund</h4>
                  <p>Items can be returned within 14 days of delivery. Custom avatars and digital goods are non-refundable.</p>
                  <h4 className="font-bold text-slate-800">4. Intellectual Property</h4>
                  <p>All content included in or made available through Mynzo, such as text, graphics, logos, and avatars is the property of Mynzo.</p>
                  <h4 className="font-bold text-slate-800">5. User Conduct</h4>
                  <p>Users must not engage in any activity that disrupts or interferes with Mynzo services.</p>
                </div>
              </motion.div>
            </motion.div>
          )}

          {infoModalType === 'faq' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0a0927]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
            >
              <motion.div 
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-md overflow-hidden flex flex-col h-[85vh] shadow-2xl border-t border-slate-100"
              >
                <div className="w-full flex justify-center pt-4 pb-2 bg-white relative z-20">
                  <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
                </div>
                <div className="px-6 pb-4 pt-1 flex items-center justify-between border-b border-slate-100">
                  <h3 className="text-lg font-black text-[#02006c]">Frequently Asked Questions</h3>
                  <button onClick={() => setInfoModalType(null)} className="p-2 bg-slate-50 rounded-full hover:bg-slate-100 transition-colors"><X className="w-4.5 h-4.5 text-slate-500" /></button>
                </div>
                <div className="p-6 overflow-y-auto space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">How do I track my order?</h4>
                    <p className="text-sm text-slate-600">You can track your order status in the "My Orders" section if you are logged in, or using the tracking link in your email.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">What are Mynzo Coins?</h4>
                    <p className="text-sm text-slate-600">Mynzo Coins are our loyalty currency. You earn them on every purchase and can use them for discounts on future orders.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Can I change my avatar later?</h4>
                    <p className="text-sm text-slate-600">Yes! You can edit your avatar at any time by clicking on it in your profile page.</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Do you ship internationally?</h4>
                    <p className="text-sm text-slate-600">Currently, we only ship within select regions. Please check our delivery coverage during checkout.</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    );
  }

  const mockUser = user;

  const menuOptions = [
    { id: 'wallet', label: "My Wallet", desc: "View your current Mynzo coin balance", icon: Coins, color: "bg-indigo-100/60 text-[#02006c]" },
    { label: "My Picks", desc: "Check your wishlist", icon: Heart, color: "bg-rose-100/60 text-rose-500", path: "/wishlist" },
    { label: "My Orders", desc: "Watch what orders are placed", icon: Package, color: "bg-sky-100/60 text-sky-600", path: "/orders" },
    { label: "Account Information", desc: "Manage your email, phone, and profile settings", icon: User, color: "bg-orange-100/60 text-[#FF6E54]" },
    { label: "Security & Password", desc: "Change password and secure credentials", icon: Lock, color: "bg-amber-100/60 text-amber-600" },
    { label: "System Settings", desc: "Configure app defaults and notifications", icon: Settings, color: "bg-slate-100 text-slate-600" },
    { label: "Help & Support", desc: "Access 24/7 client care and FAQs", icon: Phone, color: "bg-emerald-100/60 text-emerald-600", path: "/help" }
  ];

  // Options configuration pools
  const optionsPool = {
    skinTones: [
      { name: "Fair", value: "#FFDBB5" },
      { name: "Tan", value: "#E0A96D" },
      { name: "Warm", value: "#AE7A48" },
      { name: "Rich", value: "#5C3E21" }
    ],
    hairStyles: [
      { id: "crop", label: "Crop" },
      { id: "curly", label: "Curly" },
      { id: "long", label: "Long" },
      { id: "spiky", label: "Spiky" }
    ],
    hairColors: [
      { name: "Dark", value: "#3E2723" },
      { name: "Blonde", value: "#E6C15C" },
      { name: "Coral", value: "#FF6E54" },
      { name: "Teal", value: "#2DD4BF" }
    ],
    outfitColors: [
      { name: "Coral", value: "#FF6E54" },
      { name: "Navy", value: "#02006c" },
      { name: "Emerald", value: "#10B981" },
      { name: "Amber", value: "#F59E0B" }
    ],
    accessories: [
      { id: "none", label: "None" },
      { id: "glasses", label: "Glasses" },
      { id: "headphones", label: "Gaming" },
      { id: "crown", label: "Crown" }
    ]
  };

  const handleOpenCreator = () => {
    const defaultConfig = {
      skinTone: "#FFDBB5",
      hairStyle: "crop",
      hairColor: "#3E2723",
      outfitColor: "#F8FAFC",
      accessory: "none"
    };
    setTempConfig(avatarConfig || defaultConfig);
    setModalStep(0);
    setIsModalOpen(true);
  };

  const handleSaveAvatar = () => {
    setAvatarConfig(tempConfig);
    sessionStorage.setItem('userAvatar', JSON.stringify(tempConfig));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white relative pb-24 w-full min-h-full font-sans overflow-x-hidden selection:bg-orange-100 animate-fade-in">
      
      {/* 1. Soft Pastel Background */}
      <div className="absolute top-0 left-0 right-0 h-[240px] z-0 pointer-events-none overflow-hidden rounded-b-[48px] bg-gradient-to-b from-orange-50/80 to-white">
        {/* Cute soft blobs */}
        <div className="absolute -top-10 -left-10 w-48 h-48 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <div className="absolute top-10 -right-10 w-48 h-48 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
      </div>

      {/* 2. Page Content Overlaid */}
      <div className="relative z-10 pt-4 px-5 space-y-4">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-100 text-slate-600 hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-sm">
             <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* User Card: Avatar and Names (Cute & Simple) */}
        <div className="flex flex-col items-center text-center pt-2 relative">
          {/* Avatar Container with Soft Ring */}
          <div 
            onClick={handleOpenCreator}
            className="relative group cursor-pointer"
          >
            {/* Soft Pulse Ring */}
            <div className="absolute -inset-1.5 rounded-full bg-orange-200/40 animate-ping opacity-50 blur-sm"></div>
            
            <div className="relative p-1.5 bg-white rounded-full shadow-md border border-orange-100 transition-transform duration-300 group-hover:scale-105">
              <div className="w-20 h-20 rounded-full border-2 border-orange-50 overflow-hidden bg-slate-50 flex items-center justify-center relative">
                {uploadedImage ? (
                  <img src={uploadedImage} alt="Uploaded Profile" className="w-full h-full object-cover" />
                ) : avatarConfig ? (
                  <DynamicAvatar config={avatarConfig} size="w-full h-full object-cover" />
                ) : (
                  <img src={avtarImage} alt="Profile Avatar" className="w-full h-full object-cover" />
                )}
              </div>
              
              {/* Floating Camera Button */}
              <div 
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current.click();
                }}
                className="absolute -bottom-1 -right-1 p-2 bg-white border border-slate-100 rounded-full shadow-sm text-orange-400 group-hover:text-orange-500 transition-colors"
              >
                <Camera className="w-3.5 h-3.5 fill-current" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                onClick={(e) => e.stopPropagation()}
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>

          {/* User Names */}
          <h3 className="text-xl font-black text-slate-800 mt-3 font-syne tracking-wide">
            {mockUser.name}
          </h3>
          <div className="flex items-center gap-1 mt-1.5 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3 text-orange-400 fill-orange-400" />
            <span className="text-[9px] text-orange-600 font-extrabold tracking-widest uppercase">
              {mockUser.tier || 'Gold Tier Gifter'}
            </span>
          </div>
        </div>



        {/* Horizontal Rewards Stats Grid (Flat Cute) */}
        <div className="grid grid-cols-3 gap-2 px-1 pt-2">
          <div className="bg-white rounded-[20px] p-3 text-center shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
            <div className="w-8 h-8 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-amber-100 transition-colors">
              <Coins className="w-4 h-4 text-amber-500 group-hover:animate-bounce" />
            </div>
            <span className="text-[12px] font-black text-slate-800 block leading-none">{coins || 560}</span>
            <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest block mt-1">Mynzo Coins</span>
          </div>

          <div className="bg-white rounded-[20px] p-3 text-center shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
            <div className="w-8 h-8 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-orange-100 transition-colors">
              <Gift className="w-4 h-4 text-orange-400" />
            </div>
            <span className="text-[12px] font-black text-slate-800 block leading-none">3 Active</span>
            <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest block mt-1">Vouchers</span>
          </div>

          <div className="bg-white rounded-[20px] p-3 text-center shadow-sm border border-slate-100 hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
            <div className="w-8 h-8 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-1.5 group-hover:bg-emerald-100 transition-colors">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[12px] font-black text-slate-800 block leading-none">2 Orders</span>
            <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-widest block mt-1">In Transit</span>
          </div>
        </div>

        {/* Soft Pastel Avatar Creator Prompt Banner */}
        <div 
          onClick={handleOpenCreator}
          className="relative overflow-hidden rounded-[24px] p-4 bg-orange-50 border border-orange-100 cursor-pointer group hover:bg-orange-100/50 transition-colors duration-300 shadow-sm"
        >
          {/* Subtle Decorative blobs */}
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider font-syne text-orange-500 flex items-center gap-1.5">
                Create My Avatar
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              </h4>
              <p className="text-[9px] font-extrabold text-orange-400/80 uppercase tracking-widest leading-none">
                Design & dress your character
              </p>
            </div>
            <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-orange-400 border border-orange-100 shadow-sm group-hover:bg-orange-50 transition-colors">
              <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Menu Options Stack (Cute List) */}
        <div className="bg-white rounded-[28px] p-2 shadow-sm border border-slate-100">
          <div className="space-y-1">
            {menuOptions.map((opt, idx) => {
              const Icon = opt.icon;
              const isWallet = opt.id === 'wallet';
              return (
                <button
                  key={idx}
                  onClick={() => {
                    if (isWallet) setShowWalletBalance(!showWalletBalance);
                    else if (opt.path) navigate(opt.path);
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-[20px] hover:bg-slate-50 active:scale-[0.98] transition-all duration-300 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0 flex-1">
                    <div className={`w-11 h-11 ${opt.color} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105 shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-[#02006c] font-sans tracking-wide block leading-tight">{opt.label}</span>
                      <span className="text-[9px] text-slate-400 font-bold block truncate mt-1 leading-none tracking-wide">{opt.desc}</span>
                    </div>
                  </div>
                  {isWallet && showWalletBalance ? (
                    <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100">
                      <span className="text-amber-500 font-black text-sm">{coins}</span>
                      <span className="text-amber-400 font-bold text-[8px] uppercase">Coins</span>
                    </div>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6E54] group-hover:translate-x-1 transition-all" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="h-[1px] w-full bg-slate-100 my-2.5"></div>

          {/* Logout Button */}
          <button 
            onClick={() => {
              setUser(null);
              navigate('/login');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-[20px] hover:bg-rose-50/60 active:scale-[0.98] transition-all duration-300 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105 shadow-inner">
                <LogOut className="w-5 h-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-rose-500 font-sans tracking-wide block leading-tight">Log Out</span>
                <span className="text-[9px] text-slate-400 font-bold block mt-1 leading-none tracking-wide">Safely terminate session</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-rose-400 transition-colors" />
          </button>
        </div>
      </div>

      {/* 3. Snapchat-Style Interactive Avatar Creator Modal (BottomSheet) */}
      <AnimatePresence>
      {isModalOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#0a0927]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
        >
          {modalStep === 0 ? (
            /* Onboarding Screen (Centered) */
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[32px] w-[90%] sm:w-full max-w-sm overflow-hidden flex flex-col shadow-2xl border border-slate-100 p-6 space-y-5 text-center relative mb-8 sm:mb-0 mx-auto"
            >
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              <div className="w-full pt-3 flex justify-center">
                <div className="relative w-full rounded-[24px] overflow-hidden shadow-inner bg-slate-50 aspect-[4/3] flex items-center justify-center">
                  <img src={avtarImage} alt="Style Model" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>
              </div>

              <div className="space-y-2 px-2">
                <h3 className="text-xl font-black text-[#02006c] font-syne leading-tight uppercase tracking-wider">
                  Create your<br/><span className="text-[#FF6E54]">Perfect style</span>
                </h3>
                <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-[260px] mx-auto uppercase tracking-widest">
                  Every person has a unique style. We can help create your perfect 3D character.
                </p>
              </div>

              <div className="flex justify-center items-center gap-1.5 py-1">
                <span className="w-6 h-1.5 bg-slate-200 rounded-full"></span>
                <span className="w-6 h-1.5 bg-[#FF6E54] rounded-full"></span>
                <span className="w-6 h-1.5 bg-slate-200 rounded-full"></span>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setModalStep(1)}
                  className="w-full py-4 bg-[#FF6E54] hover:bg-orange-600 text-white text-[11px] font-black rounded-[20px] active:scale-[0.98] transition-all cursor-pointer uppercase tracking-widest shadow-lg shadow-[#FF6E54]/30"
                >
                  Get Started
                </button>
              </div>
            </motion.div>
          ) : (
            /* Creator Editor Screen (Bottom Sheet) */
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-white rounded-t-[40px] sm:rounded-[40px] w-full max-w-md overflow-hidden flex flex-col h-[90vh] sm:h-[85vh] shadow-[0_-10px_40px_rgb(0,0,0,0.15)] border-t border-x border-slate-100"
            >
              {/* Drag Handle (Visual) */}
              <div className="w-full flex justify-center pt-4 pb-2 bg-white relative z-20">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full"></div>
              </div>

              {/* Modal Header */}
              <div className="px-6 pb-4 pt-1 flex items-center justify-between bg-white z-20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center border border-orange-100/50">
                    <Sparkles className="w-4 h-4 text-[#FF6E54]" />
                  </div>
                  <h3 className="text-sm font-black text-[#02006c] uppercase tracking-wider font-syne">
                    Avatar Editor
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors cursor-pointer border border-slate-100"
                >
                  <X className="w-4.5 h-4.5 text-slate-500" />
                </button>
              </div>

              {/* Live Character Preview Window (Sticky) */}
              <div className="flex justify-center items-center py-6 bg-slate-50/80 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-xl">
                <div className="p-2.5 border border-slate-200/80 rounded-full bg-white shadow-xl shadow-[#FF6E54]/5 relative group">
                  <div className="absolute inset-0 rounded-full bg-[#FF6E54]/10 blur-xl group-hover:bg-[#FF6E54]/20 transition-colors"></div>
                  <DynamicAvatar config={tempConfig} size="w-32 h-32 relative z-10" />
                </div>
              </div>

              {/* Customization Options Panels */}
              <div className="flex-grow overflow-y-auto p-6 space-y-7 text-left bg-white pb-32">
                
                {/* Category: Skin Tone */}
                <div className="space-y-3.5">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6E54]"></span> Skin Tone
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {optionsPool.skinTones.map((skin) => (
                      <button
                        key={skin.value}
                        onClick={() => setTempConfig(prev => ({ ...prev, skinTone: skin.value }))}
                        className={`w-11 h-11 rounded-full transition-all active:scale-90 cursor-pointer relative ${
                          tempConfig.skinTone === skin.value ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-[#FF6E54]' : 'ring-1 ring-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: skin.value }}
                      >
                         {tempConfig.skinTone === skin.value && (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                           </div>
                         )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category: Hairstyle */}
                <div className="space-y-3.5">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#02006c]"></span> Hairstyle
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {optionsPool.hairStyles.map((hair) => (
                      <button
                        key={hair.id}
                        onClick={() => setTempConfig(prev => ({ ...prev, hairStyle: hair.id }))}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-[16px] transition-all active:scale-95 cursor-pointer text-center ${
                          tempConfig.hairStyle === hair.id 
                            ? 'bg-[#02006c] text-white shadow-lg shadow-[#02006c]/20 border-none' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {hair.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category: Hair Color */}
                <div className="space-y-3.5">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span> Hair Color
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {optionsPool.hairColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTempConfig(prev => ({ ...prev, hairColor: color.value }))}
                        className={`w-11 h-11 rounded-full transition-all active:scale-90 cursor-pointer relative ${
                          tempConfig.hairColor === color.value ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-slate-800' : 'ring-1 ring-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                      >
                        {tempConfig.hairColor === color.value && (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category: Outfit Color */}
                <div className="space-y-3.5">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Outfit Color
                  </label>
                  <div className="flex flex-wrap items-center gap-4">
                    {optionsPool.outfitColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTempConfig(prev => ({ ...prev, outfitColor: color.value }))}
                        className={`w-11 h-11 rounded-full transition-all active:scale-90 cursor-pointer relative ${
                          tempConfig.outfitColor === color.value ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-emerald-500' : 'ring-1 ring-slate-200 hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                      >
                        {tempConfig.outfitColor === color.value && (
                           <div className="absolute inset-0 flex items-center justify-center">
                             <div className="w-2.5 h-2.5 bg-white rounded-full opacity-90 shadow-sm"></div>
                           </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category: Accessories */}
                <div className="space-y-3.5">
                  <label className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span> Accessories
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {optionsPool.accessories.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setTempConfig(prev => ({ ...prev, accessory: acc.id }))}
                        className={`py-3 text-[10px] font-bold uppercase tracking-widest rounded-[16px] transition-all active:scale-95 cursor-pointer text-center ${
                          tempConfig.accessory === acc.id 
                            ? 'bg-[#FF6E54] text-white shadow-lg shadow-[#FF6E54]/20 border-none' 
                            : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Footer (Sticky Bottom) */}
              <div className="absolute bottom-0 left-0 right-0 p-5 bg-white border-t border-slate-100 shadow-[0_-15px_30px_rgba(0,0,0,0.03)] flex gap-3 z-20">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-black rounded-[20px] active:scale-95 transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  className="flex-grow py-4 bg-gradient-to-r from-[#FF6E54] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white text-[11px] font-black rounded-[20px] active:scale-[0.98] transition-all cursor-pointer text-center uppercase tracking-wider shadow-xl shadow-[#FF6E54]/25 flex justify-center items-center gap-2"
                >
                  Save & Equip <Sparkles className="w-4 h-4 fill-white" />
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

    </div>
  );
}
