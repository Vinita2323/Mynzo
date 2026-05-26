import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Copy, Share2, Users, CheckCircle2 } from 'lucide-react';

export default function ReferEarnPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  
  const referralCode = "MYNZO2026";

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareText = `Hey! Join Mynzo using my referral code ${referralCode} and we both get 100 Mynzo Coins!`;

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Mynzo!',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        console.log('Sharing canceled or failed', err);
      }
    } else {
      // Fallback
      handleCopy();
      alert('Referral code copied to clipboard!');
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans pb-20">
      {/* Header */}
      <div className="bg-[#fff4f2] px-4 py-3 sticky top-0 z-50 shadow-sm flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-[#02006c]" />
        </button>
        <h1 className="text-[17px] font-bold text-[#02006c]">Refer & Earn</h1>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[#02006c] to-indigo-900 rounded-2xl p-6 text-white text-center shadow-lg relative overflow-hidden mb-6 mt-2">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6E54]/20 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#FF6E54]/20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-3 border border-white/30">
              <Users className="w-7 h-7 text-amber-300" />
            </div>
            <h2 className="text-2xl font-black mb-2 tracking-tight">Invite & Earn 100 MC!</h2>
            <p className="text-sm text-indigo-200 font-medium px-4 leading-snug">
              Get 100 Mynzo Coins when your friend signs up and makes their first purchase.
            </p>
          </div>
        </div>

        {/* Share Code Section */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 mb-6">
          <p className="text-[13px] font-bold text-slate-500 mb-3 text-center uppercase tracking-wider">Your Referral Code</p>
          
          <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-lg p-2 pl-4">
            <span className="text-xl font-black text-[#FF6E54] tracking-widest">{referralCode}</span>
            <button 
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-bold text-sm transition-all ${
                copied ? 'bg-emerald-500 text-white' : 'bg-[#02006c] text-white hover:bg-[#02006c]/90'
              }`}
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          
          <div className="mt-4 flex gap-3">
            <button 
              onClick={handleWhatsAppShare}
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366]/10 text-[#25D366] font-bold py-2.5 rounded-lg border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors cursor-pointer"
            >
              WhatsApp
            </button>
            <button 
              onClick={handleNativeShare}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 font-bold py-2.5 rounded-lg border border-slate-200 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-[15px] font-bold text-slate-800 mb-4">How it works</h3>
          
          <div className="space-y-4 relative">
            <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>
            
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#FF6E54]/10 border border-[#FF6E54]/30 flex items-center justify-center flex-shrink-0 text-[#FF6E54] font-black text-sm">
                1
              </div>
              <div className="pt-1.5">
                <p className="text-sm font-bold text-slate-800 leading-tight">Share your link</p>
                <p className="text-xs text-slate-500 mt-0.5">Send your referral code or link to friends.</p>
              </div>
            </div>
            
            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#FF6E54]/10 border border-[#FF6E54]/30 flex items-center justify-center flex-shrink-0 text-[#FF6E54] font-black text-sm">
                2
              </div>
              <div className="pt-1.5">
                <p className="text-sm font-bold text-slate-800 leading-tight">Friends sign up</p>
                <p className="text-xs text-slate-500 mt-0.5">They create an account using your code.</p>
              </div>
            </div>

            <div className="flex gap-4 relative z-10">
              <div className="w-8 h-8 rounded-full bg-[#FF6E54]/10 border border-[#FF6E54]/30 flex items-center justify-center flex-shrink-0 text-[#FF6E54] font-black text-sm">
                3
              </div>
              <div className="pt-1.5">
                <p className="text-sm font-bold text-slate-800 leading-tight">You both earn!</p>
                <p className="text-xs text-slate-500 mt-0.5">Both of you receive 100 Mynzo Coins.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
