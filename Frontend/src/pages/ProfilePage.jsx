import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import avtarImage from '../assets/Avtar.jpg';
import { 
  ChevronLeft, User, Lock, Settings, Phone, LogOut, Camera, 
  ChevronRight, Coins, Gift, ShoppingBag, Sparkles, X 
} from 'lucide-react';

// Dynamic SVG Avatar Component
function DynamicAvatar({ config, size = "w-20 h-20" }) {
  const { skinTone, hairStyle, hairColor, outfitColor, accessory } = config;

  return (
    <svg viewBox="0 0 100 100" className={`${size} rounded-full shadow-inner bg-slate-100`}>
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
    { label: "Account Information", desc: "Manage your email, phone, and profile settings", icon: User, color: "bg-orange-100/50 text-[#FF6E54]" },
    { label: "Security & Password", desc: "Change password and secure credentials", icon: Lock, color: "bg-amber-100/50 text-amber-600" },
    { label: "System Settings", desc: "Configure app defaults and notifications", icon: Settings, color: "bg-indigo-100/50 text-[#02006c]" },
    { label: "Help & Support", desc: "Access 24/7 client care and FAQs", icon: Phone, color: "bg-emerald-100/50 text-emerald-600" }
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
    <div className="flex-grow flex flex-col bg-white relative pb-12">
      
      {/* 1. Dual Wavy SVG Background at Top */}
      <div className="absolute top-0 left-0 right-0 h-[290px] overflow-hidden z-0 pointer-events-none">
        <svg 
          viewBox="0 0 375 290" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="w-full h-full object-cover filter drop-shadow-md" 
          preserveAspectRatio="none"
        >
          {/* Secondary background wave for depth */}
          <path 
            d="M0 0 H375 V200 C280 250 160 120 80 180 C40 210 15 200 0 220 Z" 
            fill="#FF6E54" 
            opacity="0.15"
          />
          {/* Main front wave with gradient */}
          <defs>
            <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6E54" />
              <stop offset="100%" stopColor="#FF8B75" />
            </linearGradient>
          </defs>
          <path 
            d="M0 0 H375 V170 C280 220 180 130 95 190 C45 220 20 210 0 230 Z" 
            fill="url(#coralGrad)" 
          />
        </svg>
      </div>

      {/* 2. Page Content Overlaid */}
      <div className="relative z-10 p-5 space-y-5 flex-grow flex flex-col">
        
        {/* Navigation Bar */}
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-white/95 hover:text-white active:scale-95 transition-all text-xs font-bold font-syne select-none cursor-pointer uppercase tracking-wider"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
            <span>profile</span>
          </button>
        </div>

        {/* User Card: Avatar and Names */}
        <div className="flex flex-col items-center text-center pt-2 relative">
          {/* Avatar Container with Gradient Outer Ring */}
          <div 
            onClick={handleOpenCreator}
            className="relative group cursor-pointer"
          >
            <div className="p-1 bg-gradient-to-tr from-[#FF6E54] to-orange-300 rounded-full shadow-md transition-transform duration-300 group-hover:scale-105">
              <div className="w-18 h-18 rounded-full border-2 border-white overflow-hidden shadow-inner flex items-center justify-center">
                <DynamicAvatar config={avatarConfig} size="w-full h-full" />
              </div>
            </div>
            
            {/* Floating Camera Button */}
            <button className="absolute -bottom-1 -right-1 p-2 bg-[#FF6E54] border-2 border-white rounded-full shadow-md hover:bg-orange-600 hover:scale-110 active:scale-95 transition-all cursor-pointer">
              <Camera className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {/* User Names */}
          <h3 className="text-base font-extrabold text-[#02006c] mt-4 font-syne tracking-wide uppercase">
            {mockUser.name}
          </h3>
          <p className="text-[9px] text-[#FF6E54] font-black tracking-widest uppercase bg-orange-50 px-3 py-0.5 rounded-full mt-1.5 border border-orange-100/60 w-fit mx-auto">
            {mockUser.tier || 'Gold Tier Gifter'}
          </p>
        </div>

        {/* Snapchat-Style Avatar Creator Prompt Banner */}
        <div 
          onClick={handleOpenCreator}
          className="bg-gradient-to-r from-amber-300 via-amber-400 to-[#FF6E54] rounded-2xl p-4 text-slate-900 shadow-sm relative overflow-hidden flex items-center justify-between cursor-pointer active:scale-98 hover:scale-[1.01] transition-all duration-300"
        >
          {/* Subtle sparkle shape in bg */}
          <div className="absolute -right-2 -bottom-2 w-14 h-14 bg-white/10 rounded-full blur-xs"></div>
          
          <div className="space-y-0.5 relative z-10">
            <h4 className="text-[11px] font-black uppercase tracking-wider font-syne text-[#02006c] flex items-center gap-1.5">
              Create My Avatar
              <Sparkles className="w-3.5 h-3.5 text-[#FF6E54]" />
            </h4>
            <p className="text-[8px] font-bold text-slate-800 uppercase tracking-widest leading-none">
              Design & dress your Mynzo Character
            </p>
          </div>
          <div className="w-9 h-9 bg-white/25 hover:bg-white/40 rounded-full flex items-center justify-center text-[#02006c] shadow-xs relative z-10 transition-colors">
            <ChevronRight className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        {/* Horizontal Rewards Stats Grid */}
        <div className="grid grid-cols-3 gap-3 px-1 my-1">
          {/* Gift Coins */}
          <div className="bg-gradient-to-br from-orange-50/60 to-orange-100/30 border border-orange-100/50 rounded-2xl p-3 text-center shadow-3xs hover:scale-102 hover:border-orange-200 transition-all duration-300">
            <Coins className="w-5 h-5 text-amber-500 mx-auto mb-1 animate-bounce" />
            <span className="text-xs font-black text-[#02006c] block">{coins || 560}</span>
            <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">Gift Coins</span>
          </div>

          {/* Vouchers */}
          <div className="bg-gradient-to-br from-orange-50/60 to-orange-100/30 border border-orange-100/50 rounded-2xl p-3 text-center shadow-3xs hover:scale-102 hover:border-orange-200 transition-all duration-300">
            <Gift className="w-5 h-5 text-[#FF6E54] mx-auto mb-1" />
            <span className="text-xs font-black text-[#02006c] block">3 Active</span>
            <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">Vouchers</span>
          </div>

          {/* Orders */}
          <div className="bg-gradient-to-br from-orange-50/60 to-orange-100/30 border border-orange-100/50 rounded-2xl p-3 text-center shadow-3xs hover:scale-102 hover:border-orange-200 transition-all duration-300">
            <ShoppingBag className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
            <span className="text-xs font-black text-[#02006c] block">2 Orders</span>
            <span className="text-[7.5px] text-slate-400 font-extrabold uppercase tracking-wider block mt-0.5">In Transit</span>
          </div>
        </div>

        {/* Menu Options Stack */}
        <div className="space-y-3 pb-6 flex-grow">
          {menuOptions.map((opt, idx) => {
            const Icon = opt.icon;
            return (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-orange-50/30 hover:border-[#FF6E54]/20 active:scale-[0.99] transition-all duration-300 text-left cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 ${opt.color} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105`}>
                    <Icon className="w-4.5 h-4.5" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-extrabold text-slate-800 font-sans tracking-wide block leading-tight">{opt.label}</span>
                    <span className="text-[8.5px] text-slate-400 font-bold block truncate mt-0.5 leading-none">{opt.desc}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            );
          })}

          {/* Logout Button */}
          <button 
            onClick={() => {
              setUser(null);
              navigate('/login');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/30 border border-rose-100/50 hover:bg-rose-50 hover:border-rose-200 active:scale-[0.99] transition-all duration-300 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-rose-100/50 text-rose-500 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                <LogOut className="w-4.5 h-4.5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-rose-500 font-sans tracking-wide block leading-tight">Log Out</span>
                <span className="text-[8.5px] text-rose-400/80 font-bold block mt-0.5 leading-none">Safely terminate active session</span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-rose-500/50 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

      </div>

      {/* 3. Snapchat-Style Interactive Avatar Creator Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0a0927]/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          
          {modalStep === 0 ? (
            /* Onboarding Onboarding Screen */
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col shadow-2xl border border-slate-100 p-6 space-y-4 text-center relative animate-scale-up">
              {/* Close Button */}
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer z-10"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>

              {/* Hero Image */}
              <div className="w-full pt-2 flex justify-center">
                <img 
                  src={avtarImage} 
                  alt="Style Onboarding Model" 
                  className="w-full max-h-[220px] object-cover rounded-2xl shadow-sm"
                />
              </div>

              {/* Text Info */}
              <div className="space-y-1 px-2 pt-2">
                <h3 className="text-sm font-black text-[#02006c] font-syne leading-snug uppercase tracking-wide">
                  Let's Create your<br/>Perfect style
                </h3>
                <p className="text-[9px] text-slate-400 font-bold leading-normal max-w-[260px] mx-auto uppercase tracking-wider mt-1">
                  Every person has unique Style. We can help create your perfect own styles.
                </p>
              </div>

              {/* Pagination Dot Indicators */}
              <div className="flex justify-center items-center gap-1.5 py-2">
                <span className="w-6 h-1 bg-slate-100 rounded-full"></span>
                <span className="w-6 h-1 bg-slate-100 rounded-full"></span>
                <span className="w-6 h-1 bg-[#FF6E54] rounded-full"></span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => setModalStep(1)}
                  className="w-full py-3 bg-[#FF6E54] hover:bg-orange-600 text-white text-[10px] font-black rounded-2xl active:scale-95 transition-all cursor-pointer uppercase tracking-wider shadow-md shadow-orange-500/25"
                >
                  Get Started
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-1 text-[8px] font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Create an account
                </button>
              </div>
            </div>
          ) : (
            /* Creator Editor Screen */
            <div className="bg-white rounded-[32px] w-full max-w-sm overflow-hidden flex flex-col max-h-[85vh] shadow-2xl border border-slate-100 animate-scale-up">
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-orange-50/60">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-[#FF6E54]" />
                  <h3 className="text-xs font-black text-[#02006c] uppercase tracking-wider font-syne">
                    Avatar Creator
                  </h3>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Live Character Preview Window */}
              <div className="flex justify-center items-center py-6 bg-gradient-to-b from-orange-50/30 to-white border-b border-slate-50">
                <div className="p-2 border-2 border-dashed border-[#FF6E54]/30 rounded-full bg-white shadow-md">
                  <DynamicAvatar config={tempConfig} size="w-28 h-28" />
                </div>
              </div>

              {/* Customization Options Panels */}
              <div className="flex-grow overflow-y-auto p-5 space-y-4 text-left">
                
                {/* Category: Skin Tone */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Skin Tone</label>
                  <div className="flex items-center gap-3">
                    {optionsPool.skinTones.map((skin) => (
                      <button
                        key={skin.value}
                        onClick={() => setTempConfig(prev => ({ ...prev, skinTone: skin.value }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 cursor-pointer ${
                          tempConfig.skinTone === skin.value ? 'border-[#FF6E54] scale-105 shadow-sm' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: skin.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Category: Hairstyle */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hairstyle</label>
                  <div className="grid grid-cols-4 gap-2">
                    {optionsPool.hairStyles.map((hair) => (
                      <button
                        key={hair.id}
                        onClick={() => setTempConfig(prev => ({ ...prev, hairStyle: hair.id }))}
                        className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all active:scale-95 cursor-pointer text-center ${
                          tempConfig.hairStyle === hair.id 
                            ? 'bg-[#FF6E54] text-white border-[#FF6E54]' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {hair.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Category: Hair Color */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hair Color</label>
                  <div className="flex items-center gap-3">
                    {optionsPool.hairColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTempConfig(prev => ({ ...prev, hairColor: color.value }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 cursor-pointer ${
                          tempConfig.hairColor === color.value ? 'border-[#02006c] scale-105 shadow-sm' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Category: Outfit Color */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Outfit Color</label>
                  <div className="flex items-center gap-3">
                    {optionsPool.outfitColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setTempConfig(prev => ({ ...prev, outfitColor: color.value }))}
                        className={`w-8 h-8 rounded-full border-2 transition-all active:scale-90 cursor-pointer ${
                          tempConfig.outfitColor === color.value ? 'border-[#FF6E54] scale-105 shadow-sm' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: color.value }}
                      />
                    ))}
                  </div>
                </div>

                {/* Category: Accessories */}
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Accessories</label>
                  <div className="grid grid-cols-4 gap-2">
                    {optionsPool.accessories.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => setTempConfig(prev => ({ ...prev, accessory: acc.id }))}
                        className={`py-1.5 text-[9px] font-black uppercase tracking-wider rounded-xl border transition-all active:scale-95 cursor-pointer text-center ${
                          tempConfig.accessory === acc.id 
                            ? 'bg-[#FF6E54] text-white border-[#FF6E54]' 
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {acc.label}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Action Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 border border-slate-200 hover:bg-slate-100 text-slate-500 text-[10px] font-black rounded-2xl active:scale-95 transition-all cursor-pointer text-center uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  className="flex-grow py-3 bg-[#FF6E54] hover:bg-orange-600 text-white text-[10px] font-black rounded-2xl active:scale-95 transition-all cursor-pointer text-center uppercase tracking-wider shadow-md shadow-orange-500/20"
                >
                  Save & Update
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
