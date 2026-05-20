import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import avtarImage from '../assets/Avtar.jpg';
import { 
  ChevronLeft, User, Lock, Settings, Phone, LogOut, Camera, 
  ChevronRight, Coins, Gift, ShoppingBag, Sparkles, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamic SVG Avatar Component
function DynamicAvatar({ config, size = "w-20 h-20" }) {
  const { skinTone, hairStyle, hairColor, outfitColor, accessory } = config;

  return (
    <svg viewBox="0 0 100 100" className={`${size} rounded-full shadow-inner bg-slate-50`}>
      {/* Background fill */}
      <circle cx="50" cy="50" r="50" fill="#F8FAFC" />

      {/* Outfit / Collar */}
      <path d="M 20 92 Q 50 68 80 92 Z" fill={outfitColor} />
      <path d="M 40 76 Q 50 84 60 76 Z" fill={skinTone} />

      {/* Face Base */}
      <circle cx="50" cy="48" r="28" fill={skinTone} />

      {/* Eyes */}
      <circle cx="41" cy="45" r="3" fill="#1E293B" />
      <circle cx="59" cy="45" r="3" fill="#1E293B" />
      <circle cx="42" cy="44" r="0.8" fill="#FFFFFF" />
      <circle cx="60" cy="44" r="0.8" fill="#FFFFFF" />

      {/* Cheek blush */}
      <circle cx="35" cy="52" r="3" fill="#FF6E54" opacity="0.35" />
      <circle cx="65" cy="52" r="3" fill="#FF6E54" opacity="0.35" />

      {/* Mouth (cute smile) */}
      <path d="M 44 56 Q 50 64 56 56" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Hair Styles */}
      {hairStyle === 'crop' && (
        <path d="M 22 36 Q 50 12 78 36 C 73 26 27 26 22 36 Z" fill={hairColor} />
      )}
      {hairStyle === 'curly' && (
        <g fill={hairColor}>
          <circle cx="30" cy="26" r="9" />
          <circle cx="50" cy="18" r="11" />
          <circle cx="70" cy="26" r="9" />
          <circle cx="40" cy="20" r="10" />
          <circle cx="60" cy="20" r="10" />
          <circle cx="24" cy="35" r="7" />
          <circle cx="76" cy="35" r="7" />
        </g>
      )}
      {hairStyle === 'long' && (
        <g fill={hairColor}>
          <path d="M 22 36 Q 50 10 78 36 Q 81 60 77 75 Q 71 75 71 65 Q 71 36 29 36 Q 29 65 29 75 Q 23 75 22 36 Z" />
        </g>
      )}
      {hairStyle === 'spiky' && (
        <path d="M 22 35 L 30 18 L 40 24 L 50 12 L 60 24 L 70 18 L 78 35 Q 50 22 22 35 Z" fill={hairColor} />
      )}

      {/* Accessories */}
      {accessory === 'glasses' && (
        <g stroke="#1E293B" strokeWidth="2" fill="none">
          <circle cx="41" cy="45" r="8" />
          <circle cx="59" cy="45" r="8" />
          <line x1="49" y1="45" x2="51" y2="45" />
          <line x1="33" y1="45" x2="26" y2="42" />
          <line x1="67" y1="45" x2="74" y2="42" />
        </g>
      )}
      {accessory === 'headphones' && (
        <g>
          {/* Headband */}
          <path d="M 24 45 A 28 28 0 0 1 76 45" stroke="#02006c" strokeWidth="4" fill="none" />
          {/* Earpads */}
          <rect x="18" y="38" width="7" height="16" rx="3.5" fill="#02006c" />
          <rect x="75" y="38" width="7" height="16" rx="3.5" fill="#02006c" />
        </g>
      )}
      {accessory === 'crown' && (
        <path d="M 33 26 L 38 10 L 50 19 L 62 10 L 67 26 Z" fill="#FBBF24" stroke="#D97706" strokeWidth="1" />
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
      hairColor: "#1A1A1A",
      outfitColor: "#FF6E54",
      accessory: "none"
    };
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tempConfig, setTempConfig] = useState({ ...avatarConfig });
  const [modalStep, setModalStep] = useState(0); // 0 = Welcome onboarding, 1 = Creator editor

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const mockUser = user || {
    name: "Vini",
    email: "vini@mynzoworld.com",
    tier: "Gold Tier Gifter",
    joined: "Member since May 2026"
  };

  const menuOptions = [
    { label: "Account Information", desc: "Manage your email, phone, and profile settings", icon: User, color: "bg-orange-100/60 text-[#FF6E54]" },
    { label: "Security & Password", desc: "Change password and secure credentials", icon: Lock, color: "bg-amber-100/60 text-amber-600" },
    { label: "System Settings", desc: "Configure app defaults and notifications", icon: Settings, color: "bg-indigo-100/60 text-[#02006c]" },
    { label: "Help & Support", desc: "Access 24/7 client care and FAQs", icon: Phone, color: "bg-emerald-100/60 text-emerald-600" }
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
      { name: "Dark", value: "#1A1A1A" },
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
    setTempConfig({ ...avatarConfig });
    setModalStep(0);
    setIsModalOpen(true);
  };

  const handleSaveAvatar = () => {
    setAvatarConfig(tempConfig);
    sessionStorage.setItem('userAvatar', JSON.stringify(tempConfig));
    setIsModalOpen(false);
  };

  return (
    <div className="bg-slate-50 relative pb-24 w-full min-h-full font-sans overflow-x-hidden selection:bg-[#FF6E54]/20 animate-fade-in">
      
      {/* 1. Hero Animated Gradient Background */}
      <div className="absolute top-0 left-0 right-0 h-[380px] z-0 pointer-events-none overflow-hidden rounded-b-[48px] shadow-sm">
        {/* Animated mesh gradient / vibrant colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF6E54] via-orange-400 to-[#02006c] opacity-90"></div>
        {/* Soft glowing orbs for a glassmorphic effect */}
        <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/20 blur-3xl rounded-full"></div>
        <div className="absolute top-40 -right-20 w-80 h-80 bg-amber-300/30 blur-3xl rounded-full"></div>
        
        {/* Wavy bottom divider (white overlay) */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto drop-shadow-sm transform translate-y-1">
            <path d="M0 100 V60 C320 20 520 80 720 80 C920 80 1120 20 1440 60 V100 Z" fill="#f8fafc" />
          </svg>
        </div>
      </div>

      {/* 2. Page Content Overlaid */}
      <div className="relative z-10 pt-5 px-5 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          
          <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer shadow-sm">
             <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* User Card: Avatar and Names (Redesigned) */}
        <div className="flex flex-col items-center text-center pt-2 relative">
          {/* Avatar Container with Glowing Pulse */}
          <div 
            onClick={handleOpenCreator}
            className="relative group cursor-pointer"
          >
            {/* Animated Pulse Ring */}
            <div className="absolute -inset-1.5 rounded-full bg-white/30 animate-ping opacity-60 blur-sm"></div>
            
            <div className="relative p-1.5 bg-white/20 backdrop-blur-md rounded-full shadow-2xl border border-white/40 transition-transform duration-300 group-hover:scale-105">
              <div className="w-24 h-24 rounded-full border-[3px] border-white overflow-hidden bg-slate-50 flex items-center justify-center relative">
                <DynamicAvatar config={avatarConfig} size="w-full h-full object-cover" />
              </div>
              
              {/* Floating Camera Button (Glassmorphic) */}
              <div className="absolute -bottom-1 -right-1 p-2.5 bg-white/90 backdrop-blur-md border border-white/80 rounded-full shadow-lg text-[#FF6E54] group-hover:text-orange-600 transition-colors">
                <Camera className="w-4 h-4 fill-current drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* User Names */}
          <h3 className="text-2xl font-black text-white mt-5 font-syne tracking-wide drop-shadow-md">
            {mockUser.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 bg-white/20 backdrop-blur-md border border-white/30 px-3.5 py-1 rounded-full shadow-sm">
            <Sparkles className="w-3 h-3 text-amber-200 fill-amber-200" />
            <span className="text-[10px] text-white font-bold tracking-widest uppercase text-shadow-sm">
              {mockUser.tier || 'Gold Tier Gifter'}
            </span>
          </div>
        </div>

        {/* Horizontal Rewards Stats Grid (Glassmorphism) */}
        <div className="grid grid-cols-3 gap-3 px-1 pt-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-[24px] p-4 text-center shadow-sm border border-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
            <div className="w-10 h-10 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
              <Coins className="w-5 h-5 text-amber-500 animate-bounce" />
            </div>
            <span className="text-[13px] font-black text-[#02006c] block leading-none">{coins || 560}</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mt-1.5">Mynzo Coins</span>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[24px] p-4 text-center shadow-sm border border-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
            <div className="w-10 h-10 mx-auto bg-orange-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-orange-100 transition-colors">
              <Gift className="w-5 h-5 text-[#FF6E54]" />
            </div>
            <span className="text-[13px] font-black text-[#02006c] block leading-none">3 Active</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mt-1.5">Vouchers</span>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-[24px] p-4 text-center shadow-sm border border-white hover:-translate-y-1 transition-transform duration-300 cursor-pointer group">
            <div className="w-10 h-10 mx-auto bg-emerald-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-emerald-100 transition-colors">
              <ShoppingBag className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-[13px] font-black text-[#02006c] block leading-none">2 Orders</span>
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest block mt-1.5">In Transit</span>
          </div>
        </div>

        {/* Snapchat-Style Avatar Creator Prompt Banner */}
        <div 
          onClick={handleOpenCreator}
          className="relative overflow-hidden rounded-[24px] p-5 shadow-[0_8px_30px_rgb(255,110,84,0.2)] bg-gradient-to-r from-[#FF6E54] via-orange-500 to-amber-500 cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
        >
          {/* Decorative shapes */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
          <div className="absolute right-12 bottom-0 w-24 h-24 bg-amber-300/40 rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="text-sm font-black uppercase tracking-wider font-syne text-white flex items-center gap-1.5 drop-shadow-sm">
                Create My Avatar
                <Sparkles className="w-4 h-4 text-amber-200 fill-amber-200" />
              </h4>
              <p className="text-[9px] font-extrabold text-white/90 uppercase tracking-widest leading-none">
                Design & dress your character
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/40 group-hover:bg-white/30 transition-colors shadow-sm">
              <ChevronRight className="w-5 h-5 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>

        {/* Menu Options Stack (Sleek List) */}
        <div className="bg-white rounded-[28px] p-2.5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-100/60">
          <div className="space-y-1">
            {menuOptions.map((opt, idx) => {
              const Icon = opt.icon;
              return (
                <button
                  key={idx}
                  className="w-full flex items-center justify-between p-3.5 rounded-[20px] hover:bg-slate-50 active:scale-[0.98] transition-all duration-300 text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-11 h-11 ${opt.color} rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:rotate-6 group-hover:scale-105 shadow-inner`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-sm font-bold text-[#02006c] font-sans tracking-wide block leading-tight">{opt.label}</span>
                      <span className="text-[9px] text-slate-400 font-bold block truncate mt-1 leading-none tracking-wide">{opt.desc}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#FF6E54] group-hover:translate-x-1 transition-all" />
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
