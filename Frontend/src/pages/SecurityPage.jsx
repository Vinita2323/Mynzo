import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';

export default function SecurityPage() {
  const navigate = useNavigate();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

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
        <h1 className="text-[17px] font-bold text-[#02006c]">Security & Password</h1>
      </div>
      
      <div className="p-4 space-y-6">
        
        {/* Change Password Section */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 mb-3 px-1">Change Password</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-4">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 block">Current Password</label>
              <div className="relative">
                <input 
                  type={showCurrent ? "text" : "password"}
                  placeholder="Enter current password"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 block">New Password</label>
              <div className="relative">
                <input 
                  type={showNew ? "text" : "password"}
                  placeholder="Enter new password"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-[13px] font-semibold text-slate-700 block">Confirm Password</label>
              <div className="relative">
                <input 
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm new password"
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all"
                />
                <button 
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Update Button */}
            <button className="w-full bg-[#02006c] text-white font-bold text-[14px] py-3 rounded-lg mt-2 hover:bg-[#02006c]/90 active:scale-[0.98] transition-all shadow-sm">
              Update Password
            </button>
          </div>
        </div>

        {/* Two-Factor Authentication Section */}
        <div>
          <h2 className="text-[15px] font-bold text-slate-800 mb-3 px-1">Two-Factor Authentication</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
            <div className="pr-4">
              <p className="text-[14px] font-bold text-slate-800 mb-0.5">Enable 2FA</p>
              <p className="text-[12px] text-slate-500 leading-tight">Add an extra layer of security to your account.</p>
            </div>
            
            {/* Custom Toggle Switch */}
            <button 
              onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${twoFactorEnabled ? 'bg-[#FF6E54]' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full shadow-sm transition-transform duration-300 ${twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
