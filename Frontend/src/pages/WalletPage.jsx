import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Coins, ArrowUpRight, ArrowDownLeft, Gift, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function WalletPage() {
  const navigate = useNavigate();
  const { user } = useApp();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWalletDetails = async () => {
    const token = localStorage.getItem('userToken');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/wallet`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.coins);
        setTransactions(data.transactions);
      } else {
        toast.error(data.message || 'Failed to load wallet');
      }
    } catch (err) {
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletDetails();
  }, [user]);

  const formatTxDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <h1 className="text-[17px] font-bold text-[#02006c]">My Wallet</h1>
      </div>
      
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-20 gap-2">
          <div className="w-8 h-8 border-4 border-[#ee4923] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-slate-400">Loading wallet details...</span>
        </div>
      ) : (
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
                {balance}
                <span className="text-lg text-indigo-200 font-bold">MC</span>
              </h2>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => navigate('/games')}
              className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 bg-[#ee4923]/10 rounded-full flex items-center justify-center group-hover:bg-[#ee4923]/20 transition-colors">
                <ArrowDownLeft className="w-5 h-5 text-[#ee4923]" />
              </div>
              <span className="text-[13px] font-bold text-[#02006c]">Earn Coins</span>
            </button>
            
            <button 
              onClick={() => navigate('/coupons')}
              className="bg-white rounded-xl p-4 flex flex-col items-center justify-center gap-2 shadow-sm border border-slate-100 hover:border-orange-200 hover:shadow-md transition-all active:scale-95 group"
            >
              <div className="w-10 h-10 bg-[#ee4923]/10 rounded-full flex items-center justify-center group-hover:bg-[#ee4923]/20 transition-colors">
                <Gift className="w-5 h-5 text-[#ee4923]" />
              </div>
              <span className="text-[13px] font-bold text-[#02006c]">Redeem</span>
            </button>
          </div>

          {/* Transaction History */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 px-1 mb-3">Recent Activity</h3>
            
            {transactions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center text-slate-400">
                <Clock className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                <p className="text-xs font-bold">No recent coin activity.</p>
                <p className="text-[10px] text-slate-300 mt-1">Play playground games to start earning Mynzo Coins!</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                {transactions.map((tx, idx) => {
                  const isEarned = tx.type === 'earned';
                  const TxIcon = isEarned ? ArrowDownLeft : ArrowUpRight;
                  
                  return (
                    <div 
                      key={tx.id} 
                      className={`flex items-center justify-between p-4 ${idx !== transactions.length - 1 ? 'border-b border-slate-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isEarned ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                          <TxIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-[13px] font-bold text-slate-800 leading-tight mb-0.5">{tx.title}</p>
                          <p className="text-[11px] font-medium text-slate-400">{formatTxDate(tx.createdAt)}</p>
                        </div>
                      </div>
                      <div className={`text-[14px] font-black ${isEarned ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isEarned ? '+' : '-'}{tx.amount}
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
  );
}
