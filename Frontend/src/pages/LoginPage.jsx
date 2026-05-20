import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import dollImage from '../assets/DollMynzo-removebg-preview.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useApp();

  // Page container references for smooth horizontal scrolling
  const welcomeRef = useRef(null);
  const signInRef = useRef(null);

  // Phone + OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [signInError, setSignInError] = useState("");
  const [signInSuccess, setSignInSuccess] = useState("");

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setSignInError("Please enter a valid 10-digit phone number");
      return;
    }
    
    setSignInError("");
    setOtpSent(true);
    setSignInSuccess("OTP Sent successfully! Enter '1234' to verify.");
  };

  const handleVerifyOtpAndLogin = (e) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setSignInError("Please enter the 4-digit OTP");
      return;
    }
    if (otpCode !== "1234") {
      setSignInError("Invalid OTP. For mock login, enter '1234'.");
      return;
    }

    // Set mock user session in global context and sessionStorage
    sessionStorage.setItem('isLoggedIn', 'true');
    if (setUser) {
      setUser({
        name: `User_${phoneNumber.slice(-4)}`,
        phone: `+91 ${phoneNumber}`,
        tier: "Gold Tier Gifter",
        joined: "Member since May 2026"
      });
    }

    navigate('/');
  };

  const scrollToSection = (elementRef) => {
    if (elementRef.current) {
      elementRef.current.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    }
  };

  // SVG Leaf Overlay background to repeat across slides
  const renderLeafOverlay = () => (
    <div className="absolute inset-0 opacity-15 pointer-events-none select-none z-0">
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M10,20 Q20,5 40,20 Q60,35 45,60 Q30,85 10,20 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M75,10 Q90,5 95,25 Q100,45 85,55 Q70,65 75,10 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M5,70 Q25,65 30,80 Q35,95 15,98 Q-5,100 5,70 Z" fill="rgba(255,255,255,0.3)" />
        <path d="M80,75 Q95,70 98,85 Q100,100 85,98 Q70,95 80,75 Z" fill="rgba(255,255,255,0.3)" />
      </svg>
    </div>
  );

  // Floating doll component — reused on both screens
  const FloatingDoll = () => (
    <>
      {/* CSS Keyframe animation injected once */}
      <style>{`
        @keyframes floatDoll {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-12px) scale(1.025); }
          100% { transform: translateY(0px) scale(1); }
        }
        .doll-float {
          animation: floatDoll 3.2s ease-in-out infinite;
          will-change: transform;
        }
      `}</style>

      {/* Soft ambient glow behind the doll */}
      <div
        className="absolute bottom-10 right-2 z-10 pointer-events-none"
        style={{
          width: '130px',
          height: '130px',
          background: 'radial-gradient(circle, rgba(255,110,84,0.22) 0%, rgba(255,142,77,0.10) 55%, transparent 80%)',
          filter: 'blur(18px)',
          borderRadius: '50%',
          transform: 'translateX(10px) translateY(20px)',
        }}
      />

      {/* Doll Image */}
      <img
        src={dollImage}
        alt="Mynzo Mascot"
        className="doll-float absolute bottom-4 right-2 z-10 pointer-events-none select-none"
        style={{
          width: '130px',
          opacity: 0.95,
          filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.13)) drop-shadow(0 2px 6px rgba(255,110,84,0.18))',
          objectFit: 'contain',
        }}
        draggable={false}
      />
    </>
  );

  return (
    <div className="h-screen w-full overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth bg-[#F8F9FD] flex flex-row">
      
      {/* ======================================= */}
      {/* PAGE 1: WELCOME SCREEN                  */}
      {/* ======================================= */}
      <section 
        ref={welcomeRef}
        className="h-full w-full flex-shrink-0 snap-start snap-always flex flex-col justify-between overflow-hidden relative bg-[#F8F9FD]"
      >
        {/* Peach Gradient Background Header */}
        <div className="relative h-[68%] bg-gradient-to-br from-orange-300 via-orange-400 to-[#FF8E4D] flex flex-col justify-center items-center gap-3">
          {renderLeafOverlay()}

          {/* Logo Container */}
          <div className="relative z-10 flex flex-col items-center gap-2 animate-fade-in">
            {/* Logo Circle with frosted glass ring */}
            <div className="w-28 h-28 bg-white/25 backdrop-blur-md rounded-full p-2 border-2 border-white/50 flex items-center justify-center shadow-2xl shadow-orange-900/20">
              <img 
                src="/Logo.jpg" 
                alt="Mynzo Logo" 
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Brand Name */}
            <div className="flex flex-col items-center gap-0.5">
              <span className="text-2xl font-black text-white tracking-[0.15em] uppercase drop-shadow-md" style={{ fontFamily: 'Syne, sans-serif' }}>
                Mynzo
              </span>
              <span className="text-[9px] font-extrabold text-white/75 tracking-[0.3em] uppercase">
                Gift · Discover · Reward
              </span>
            </div>
          </div>

          {/* Organic Wave Slant (With translate subpixel patch) */}
          <svg className="absolute bottom-0 left-0 right-0 w-full h-16 fill-[#F8F9FD] pointer-events-none translate-y-[1px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,240C1120,245,1280,203,1360,181.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Welcome Text Section */}
        <div className="bg-[#F8F9FD] px-8 pb-14 pt-4 flex flex-col justify-start text-left relative z-10 space-y-3">
          <h2 className="text-3xl font-extrabold text-[#02006c] tracking-tight leading-none">Welcome</h2>
          <p className="text-xs text-slate-400 font-bold leading-relaxed max-w-xs">
            Sign in and discover elegant collections, curated surprises, and rewards made for you.
          </p>
          <div className="w-8 h-1 bg-[#FF6E54] rounded-full mt-2"></div>

          {/* Swipe right to continue indicator */}
          <div 
            onClick={() => scrollToSection(signInRef)}
            className="flex items-center justify-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest pt-12 cursor-pointer transition-colors hover:text-[#FF6E54]"
          >
            <span>Swipe Right to Begin</span>
            <ChevronRight className="w-3.5 h-3.5 animate-pulse" />
          </div>
        </div>

        {/* Floating Doll Mascot — Welcome Screen */}
        <FloatingDoll />
      </section>

      {/* ======================================= */}
      {/* PAGE 2: SIGN IN SCREEN (Phone + OTP)    */}
      {/* ======================================= */}
      <section 
        ref={signInRef}
        className="h-full w-full flex-shrink-0 snap-start snap-always flex flex-col justify-between overflow-hidden relative bg-[#F8F9FD]"
      >
        {/* Curved Orange top banner */}
        <div className="relative h-[28%] bg-gradient-to-br from-orange-300 via-orange-400 to-[#FF8E4D]">
          {renderLeafOverlay()}
          
          {/* Back to welcome */}
          <button 
            onClick={() => scrollToSection(welcomeRef)}
            className="absolute top-6 left-4 w-9 h-9 bg-white/20 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all z-20 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          {/* Curved wave transition (With translate subpixel patch) */}
          <svg className="absolute bottom-0 left-0 right-0 w-full h-12 fill-[#F8F9FD] pointer-events-none translate-y-[1px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
            <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,240C1120,245,1280,203,1360,181.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
          </svg>
        </div>

        {/* Sign In Form layout */}
        <div className="bg-[#F8F9FD] px-8 pb-16 pt-2 flex-grow flex flex-col justify-start z-10 space-y-6">
          
          {/* Form Header */}
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-[#02006c]">Sign In</h2>
            <p className="text-[10px] text-slate-400 font-bold">Sign in to your Registered Account.</p>
            <div className="w-6 h-0.75 bg-[#FF6E54] rounded-full mt-1.5"></div>
          </div>

          <form onSubmit={otpSent ? handleVerifyOtpAndLogin : handleSendOtp} className="space-y-4 pt-2">
            
            {/* Phone Number Input */}
            <div className="space-y-0.5 text-left">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</label>
              <div className="flex gap-2 border-b border-slate-200 focus-within:border-[#FF6E54] transition-colors py-1.5">
                <span className="text-xs text-[#02006c] font-black pr-1.5 border-r border-slate-100 flex items-center select-none">+91</span>
                <input 
                  type="tel" 
                  disabled={otpSent}
                  placeholder="Enter 10-digit number"
                  value={phoneNumber}
                  onChange={(e) => {
                    setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                    setSignInError("");
                  }}
                  className={`w-full text-xs text-[#02006c] font-bold outline-none placeholder-slate-300 bg-transparent ${otpSent ? 'opacity-60' : ''}`}
                />
              </div>
            </div>

            {/* OTP Input (Rendered once OTP is simulated sent) */}
            {otpSent && (
              <div className="space-y-0.5 text-left animate-fade-in pt-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enter 4-Digit OTP</label>
                <input 
                  type="text" 
                  maxLength={4}
                  placeholder="••••"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setSignInError("");
                  }}
                  className="w-full border-b border-slate-200 py-1.5 text-xs text-[#02006c] font-black outline-none focus:border-[#FF6E54] placeholder-slate-300 bg-transparent tracking-widest"
                />
              </div>
            )}

            {/* Notifications and Alerts */}
            {signInError && (
              <p className="text-[9px] text-rose-500 font-extrabold px-1 pt-1">{signInError}</p>
            )}

            {signInSuccess && !signInError && (
              <p className="text-[9px] text-emerald-600 font-extrabold px-1 pt-1">{signInSuccess}</p>
            )}

            {/* Centered Filled Action Button */}
            <div className="pt-4">
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-orange-400 to-[#FF8E4D] hover:scale-[1.01] active:scale-95 text-white text-[10px] font-black py-3.5 rounded-full tracking-wider shadow-md shadow-orange-500/10 transition-all cursor-pointer text-center"
              >
                {otpSent ? 'VERIFY & SIGN IN' : 'SEND OTP'}
              </button>
            </div>

            {/* Resend Helper */}
            {otpSent && (
              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => {
                    setOtpCode("");
                    setSignInError("");
                    setSignInSuccess("New OTP sent successfully!");
                  }}
                  className="text-[9px] font-extrabold text-[#FF8E4D] hover:underline cursor-pointer"
                >
                  Resend Verification Code?
                </button>
              </div>
            )}

          </form>
        </div>

        {/* Floating Doll Mascot — Sign In Screen */}
        <FloatingDoll />
      </section>

    </div>
  );
}

