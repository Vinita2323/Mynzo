import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Gift, Copy, CheckCircle2 } from 'lucide-react';

export default function CouponsPage() {
  const navigate = useNavigate();
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const coupons = [
    { id: 1, code: 'WELCOME50', discount: '50% OFF', desc: 'On your first order above ₹999', validTill: 'Valid till 31 Dec' },
    { id: 2, code: 'FESTIVE20', discount: '20% OFF', desc: 'On all ethnic wear', validTill: 'Valid till 15 Nov' },
    { id: 3, code: 'FREESHIP', discount: 'Free Shipping', desc: 'On orders above ₹499', validTill: 'Valid till 30 Nov' },
  ];

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
        <h1 className="text-[17px] font-bold text-[#02006c]">My Coupons</h1>
      </div>
      
      <div className="p-4 space-y-4">
        {coupons.map((coupon) => (
          <div key={coupon.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden flex">
            {/* Left Tag */}
            <div className="bg-gradient-to-br from-[#02006c] to-indigo-900 w-24 flex flex-col items-center justify-center p-3 text-white border-r border-dashed border-slate-300 relative">
              <div className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-slate-50"></div>
              <div className="absolute -bottom-2 -right-2 w-4 h-4 rounded-full bg-slate-50"></div>
              <Gift className="w-6 h-6 mb-1 text-[#FF6E54]" />
              <span className="text-xs font-bold text-center leading-tight">{coupon.discount}</span>
            </div>
            
            {/* Right Info */}
            <div className="flex-1 p-3.5 flex flex-col justify-between">
              <div>
                <p className="text-[13px] font-medium text-slate-600 mb-1 leading-tight">{coupon.desc}</p>
                <div className="flex items-center gap-2">
                  <span className="bg-orange-50 text-[#FF6E54] border border-orange-100 px-2 py-0.5 rounded font-bold tracking-wide text-[13px]">{coupon.code}</span>
                  <button 
                    onClick={() => handleCopy(coupon.code)}
                    className={`transition-colors cursor-pointer ${
                      copiedCode === coupon.code ? 'text-emerald-500' : 'text-slate-400 hover:text-[#02006c]'
                    }`}
                  >
                    {copiedCode === coupon.code ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-3 tracking-wider">{coupon.validTill}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
