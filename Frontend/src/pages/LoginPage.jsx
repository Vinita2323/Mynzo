import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ArrowLeft, Edit2 } from 'lucide-react';
import dollImage from '../assets/DollMynzo-removebg-preview.png';

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useApp();

  // Phone + OTP states
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  // 4-digit OTP state
  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  
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

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setSignInError("");

    // Move to next input if value is entered
    if (value !== "" && index < 3) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Move to previous input on backspace if current is empty
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtpAndLogin = (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    
    if (fullOtp.length < 4) {
      setSignInError("Please enter the complete 4-digit OTP");
      return;
    }
    if (fullOtp !== "1234") {
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

  // Floating doll component
  const FloatingDoll = () => (
    <>
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

      <img
        src={dollImage}
        alt="Mynzo Mascot"
        className="doll-float absolute bottom-6 right-0 z-10 pointer-events-none select-none"
        style={{
          width: '140px',
          opacity: 0.95,
          filter: 'drop-shadow(0 10px 22px rgba(0,0,0,0.13)) drop-shadow(0 2px 6px rgba(255,110,84,0.18))',
          objectFit: 'contain',
        }}
        draggable={false}
      />
    </>
  );

  return (
    <div className="h-[100dvh] w-full flex flex-col justify-between overflow-hidden relative bg-[#F8F9FD]">
      
      {/* Curved Orange top banner */}
      <div className="relative h-[28%] bg-gradient-to-br from-orange-300 via-orange-400 to-[#FF8E4D] flex flex-col items-center justify-center pt-4">
        {renderLeafOverlay()}
        
        {/* Back to Home or Back to Phone Input */}
        <button 
          onClick={() => {
            if (otpSent) {
              setOtpSent(false);
              setOtp(["", "", "", ""]);
              setSignInError("");
              setSignInSuccess("");
            } else {
              navigate('/');
            }
          }}
          className="absolute top-6 left-4 w-9 h-9 bg-white/20 backdrop-blur-sm border border-white/10 rounded-full flex items-center justify-center text-white active:scale-90 transition-all z-20 cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        {/* Logo Container */}
        <div className="relative z-10 w-24 h-24 bg-white/30 backdrop-blur-md rounded-full p-1.5 border-2 border-white/50 flex items-center justify-center shadow-xl shadow-orange-900/10 mb-2 animate-fade-in">
          <img 
            src="/Logo.jpg" 
            alt="Mynzo Logo" 
            className="w-full h-full object-cover rounded-full"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Curved wave transition */}
        <svg className="absolute bottom-0 left-0 right-0 w-full h-12 fill-[#F8F9FD] pointer-events-none translate-y-[1px]" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path d="M0,192L80,181.3C160,171,320,149,480,165.3C640,181,800,235,960,240C1120,245,1280,203,1360,181.3L1440,160L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
        </svg>
      </div>

      {/* Main Content Area */}
      <div className="bg-[#F8F9FD] px-8 pb-16 pt-4 flex-grow flex flex-col justify-start z-10 space-y-6">
        
        {!otpSent ? (
          /* ================================ */
          /* PHONE NUMBER INPUT SCREEN        */
          /* ================================ */
          <div className="space-y-6 animate-fade-in">
            {/* Form Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#02006c]">Sign In</h2>
              <p className="text-[10px] text-slate-400 font-bold">Sign in to your Registered Account.</p>
              <div className="w-6 h-0.75 bg-[#FF6E54] rounded-full mt-1.5"></div>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-4 pt-2">
              <div className="space-y-1 text-left">
                <label className="text-sm font-syne font-black text-slate-500 uppercase tracking-widest">Phone Number</label>
                <div className="flex gap-2 border-b-2 border-slate-200 focus-within:border-[#FF6E54] transition-colors py-2">
                  <span className="text-lg text-[#02006c] font-black pr-2 border-r-2 border-slate-100 flex items-center select-none">+91</span>
                  <input 
                    type="tel" 
                    placeholder="Enter 10-digit number"
                    value={phoneNumber}
                    onChange={(e) => {
                      setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10));
                      setSignInError("");
                    }}
                    className="w-full text-lg text-[#02006c] font-bold outline-none placeholder-slate-300 bg-transparent"
                  />
                </div>
              </div>

              {signInError && (
                <p className="text-[9px] text-rose-500 font-extrabold px-1 pt-1">{signInError}</p>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-[#FF8E4D] hover:scale-[1.01] active:scale-95 text-white text-[10px] font-black py-3.5 rounded-full tracking-wider shadow-md shadow-orange-500/10 transition-all cursor-pointer text-center uppercase"
                >
                  Send OTP
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ================================ */
          /* OTP VERIFICATION SCREEN          */
          /* ================================ */
          <div className="space-y-6 animate-fade-in">
            {/* Form Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-[#02006c]">Verify OTP</h2>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-slate-400 font-bold">Code sent to +91 {phoneNumber}</p>
                <button 
                  onClick={() => {
                    setOtpSent(false);
                    setOtp(["", "", "", ""]);
                    setSignInError("");
                  }}
                  className="p-1 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors text-slate-500"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </div>
              <div className="w-6 h-0.75 bg-[#FF6E54] rounded-full mt-1.5"></div>
            </div>

            <form onSubmit={handleVerifyOtpAndLogin} className="flex flex-col gap-2 pt-4">
              <div className="space-y-3 text-left">
                <label className="text-sm font-syne font-black text-slate-500 uppercase tracking-widest text-center block">
                  Enter 4-Digit OTP
                </label>
                
                {/* 4 Box OTP Input */}
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 rounded-xl border-2 border-slate-200 bg-white text-center text-xl font-black text-[#02006c] focus:border-[#FF6E54] focus:ring-2 focus:ring-orange-100 outline-none transition-all shadow-sm"
                    />
                  ))}
                </div>
              </div>

              {signInError && (
                <p className="text-[9px] text-rose-500 font-extrabold text-center px-1 pt-2">{signInError}</p>
              )}

              {signInSuccess && !signInError && (
                <p className="text-[9px] text-emerald-600 font-extrabold text-center px-1 pt-2">{signInSuccess}</p>
              )}

              <div className="mt-1">
                <button 
                  type="submit"
                  className="w-full bg-gradient-to-r from-orange-400 to-[#FF8E4D] hover:scale-[1.01] active:scale-95 text-white text-[10px] font-black py-3.5 rounded-full tracking-wider shadow-md shadow-orange-500/10 transition-all cursor-pointer text-center uppercase"
                >
                  Verify & Sign In
                </button>
              </div>

              <div className="text-center mt-1">
                <button 
                  type="button"
                  onClick={() => {
                    setOtp(["", "", "", ""]);
                    setSignInError("");
                    setSignInSuccess("New OTP sent successfully!");
                    otpRefs[0].current.focus();
                  }}
                  className="text-[10px] font-extrabold text-[#FF8E4D] hover:underline cursor-pointer tracking-wide"
                >
                  Resend Verification Code?
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Floating Doll Mascot */}
      <FloatingDoll />
    </div>
  );
}
