import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Coins, ArrowUpRight, ArrowDownLeft, Gift, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function WalletPage() {
  const navigate = useNavigate();
  const { coins = 560 } = useApp();

  const transactions = [
    { id: 2, type: 'spent', title: 'Discount on Order #1245', amount: 50, date: 'Yesterday, 04:30 PM', icon: ArrowUpRight },
    { id: 3, type: 'earned', title: 'Referral Bonus', amount: 100, date: 'May 20, 09:15 AM', icon: ArrowDownLeft },
    { id: 4, type: 'earned', title: 'Review Product', amount: 20, date: 'May 18, 02:40 PM', icon: Clock },
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
        <h1 className="text-[17px] font-bold text-[#02006c]">My Wallet</h1>
      </div>
      
      <div className="p-4 space-y-6">
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#02006c] to-indigo-900 rounded-[24px] p-6 text-white shadow-lg relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/20 rounded-full blur-xl -ml-10 -mb-10"></div>
          
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-3 backdrop-blur-md border border-white/30 shadow-inner">
              <Coins className="w-6 h-6 text-amber-300" />
            </div>
            <p className="text-indigo-100 text-sm font-medium tracking-wide uppercase mb-1">Total Mynzo Coins</p>
            <h2 className="text-4xl font-black tracking-tight flex items-baseline gap-1">
              {coins}
              <span className="text-lg text-indigo-200 font-bold">MC</span>
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <button className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 bg-[#FF6E54]/10 rounded-full flex items-center justify-center group-hover:bg-[#FF6E54]/20 transition-colors">
              <ArrowDownLeft className="w-5 h-5 text-[#FF6E54]" />
            </div>
            <span className="text-[13px] font-bold text-[#02006c]">Earn Coins</span>
          </button>
          
          <button className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all active:scale-95 group">
            <div className="w-10 h-10 bg-[#FF6E54]/10 rounded-full flex items-center justify-center group-hover:bg-[#FF6E54]/20 transition-colors">
              <Gift className="w-5 h-5 text-[#FF6E54]" />
            </div>
            <span className="text-[13px] font-bold text-[#02006c]">Redeem</span>
          </button>
        </div>

        {/* Transaction History */}
        <div>
          <h3 className="text-[15px] font-bold text-slate-800 px-1 mb-3">Recent Activity</h3>
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {transactions.map((tx, idx) => {
              const TxIcon = tx.icon;
              const isEarned = tx.type === 'earned';
              
              return (
                <div 
                  key={tx.id} 
                  className={`flex items-center justify-between p-4 ${idx !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarned ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-500'}`}>
                      <TxIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-slate-800 leading-tight mb-0.5">{tx.title}</p>
                      <p className="text-[11px] font-medium text-slate-400">{tx.date}</p>
                    </div>
                  </div>
                  <div className={`text-[14px] font-black ${isEarned ? 'text-emerald-500' : 'text-slate-800'}`}>
                    {isEarned ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
