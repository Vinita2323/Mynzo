import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Wallet, ArrowUpRight, 
  Download, Landmark, Receipt, Coins, RefreshCw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const EarningStat = ({ title, value, sub, icon: Icon, color, bg }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
    <div className="flex justify-between items-start mb-6">
      <div className={`w-12 h-12 ${bg} ${color} rounded-2xl flex items-center justify-center shadow-inner`}>
        <Icon size={24} />
      </div>
      <div className="flex items-center gap-1 text-[11px] font-black text-green-500 uppercase tracking-widest">
        <ArrowUpRight size={14} />
        +12.4%
      </div>
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{title}</p>
    <h3 className="text-3xl font-black text-slate-900 font-roboto leading-none">{value}</h3>
    <p className="text-[11px] text-slate-400 font-medium mt-3">{sub}</p>
  </div>
);

const PlatformEarnings = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarningsData = async (isSilent = false) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiBase}/admin/analytics/earnings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setData(json.data);
        toast.success('Earnings data refreshed!');
      }
    } catch (err) {
      console.error('Error fetching earnings:', err);
      toast.error('Could not fetch earnings metrics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const salesTrend = data?.salesTrend || [
    { day: 'Mon', revenue: 0 },
    { day: 'Tue', revenue: 0 },
    { day: 'Wed', revenue: 0 },
    { day: 'Thu', revenue: 0 },
    { day: 'Fri', revenue: 0 },
    { day: 'Sat', revenue: 0 },
    { day: 'Sun', revenue: 0 },
  ];

  const categoryRevenue = data?.categoryRevenue || [
    { name: 'Fashion Sales', value: '₹0', percent: 0, color: 'bg-blue-500' },
    { name: 'Electronics Sales', value: '₹0', percent: 0, color: 'bg-green-500' }
  ];

  const transactions = data?.transactions || [];

  const handleDownloadSalesReport = () => {
    if (!data) return;
    let csvContent = "\uFEFF"; // Add BOM for Excel UTF-8 support
    
    // Header
    csvContent += "Mynzo Store Earnings & Sales Report\n";
    csvContent += `Generated At,${new Date().toLocaleString()}\n\n`;
    
    // Overview Metrics
    csvContent += "Metric,Value\n";
    csvContent += `Net Revenue,₹${data.netRevenue || 0}\n`;
    csvContent += `Gross Merchandise Value (GMV),₹${data.gmv || 0}\n`;
    csvContent += `Coins Redeemed,${data.coinsRedeemed || 0} Coins\n\n`;
    
    // Sales Trend
    csvContent += "Sales Trend (Last 7 Days)\n";
    csvContent += "Day,Revenue (₹)\n";
    salesTrend.forEach(item => {
      csvContent += `${item.day},${item.revenue}\n`;
    });
    csvContent += "\n";
    
    // Category sales
    csvContent += "Category Share\n";
    csvContent += "Category,Value,Percentage (%)\n";
    categoryRevenue.forEach(item => {
      csvContent += `"${item.name}",${item.value.replace(/₹/g, '').replace(/,/g, '')},${item.percent}%\n`;
    });
    csvContent += "\n";

    // Recent Transactions
    csvContent += "Recent Transactions Log\n";
    csvContent += "Ref ID,Source,Type,Gross Amt,Coins Discount,Status\n";
    transactions.forEach(txn => {
      csvContent += `${txn.id},${txn.source},${txn.type},${txn.gross.replace(/₹/g, '').replace(/,/g, '')},${txn.discount.replace(/₹/g, '').replace(/,/g, '')},${txn.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `mynzo_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight font-montserrat uppercase">Store Earnings</h1>
          <p className="text-slate-500 font-medium mt-1 font-raleway">Financial oversight of store sales, gross revenue, and customer discounts.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => fetchEarningsData(true)}
            className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 flex items-center gap-2 shadow-sm hover:bg-slate-50 transition-colors active:scale-95"
            disabled={refreshing}
          >
             <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
             <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Refresh Data</span>
          </button>
          <button 
            onClick={handleDownloadSalesReport}
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:scale-105 active:scale-95 transition-all"
          >
            <Download size={16} />
            Download Sales Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400 animate-pulse font-raleway font-bold">
           Loading financial analytics...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <EarningStat 
              title="Net Revenue" 
              value={`₹${(data?.netRevenue || 0).toLocaleString()}`} 
              sub="Total store earnings (Paid Orders)" 
              icon={Landmark} 
              color="text-blue-600" 
              bg="bg-blue-50" 
            />
            <EarningStat 
              title="Gross Merchandise Value" 
              value={`₹${(data?.gmv || 0).toLocaleString()}`} 
              sub="Total active sales value (excl. Cancelled)" 
              icon={DollarSign} 
              color="text-green-600" 
              bg="bg-green-50" 
            />
            <EarningStat 
              title="Coins Redeemed" 
              value={`${(data?.coinsRedeemed || 0).toLocaleString()} Coins`} 
              sub="Value of discounts claimed via gameplay" 
              icon={Coins} 
              color="text-amber-600" 
              bg="bg-amber-50" 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Earnings Chart */}
            <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight font-montserrat">Sales Trend</h3>
                <div className="flex gap-4">
                   <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Store Revenue (Daily)
                   </div>
                </div>
              </div>
              <div className="flex-1 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesTrend}>
                    <defs>
                      <linearGradient id="colorComm" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dx={-10} />
                    <Tooltip 
                       contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', fontWeight: 'bold'}}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fill="url(#colorComm)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col">
               <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-8 font-montserrat">Category Revenue</h3>
               <div className="space-y-6 flex-1">
                  {categoryRevenue.map((item, i) => (
                    <div key={i} className="space-y-2">
                       <div className="flex justify-between items-center">
                          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.name}</p>
                          <p className="text-xs font-black text-slate-900 font-roboto">{item.value}</p>
                       </div>
                       <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${item.percent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                       </div>
                    </div>
                  ))}
               </div>
               <div className="mt-10 p-5 bg-blue-500 rounded-3xl text-white relative overflow-hidden shadow-xl shadow-blue-100">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <Landmark size={80} />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Settled this month</p>
                  <h4 className="text-2xl font-black mt-1 font-roboto">₹{(data?.netRevenue || 0).toLocaleString()}</h4>
                  <button 
                    onClick={() => fetchEarningsData()}
                    className="mt-4 w-full py-2.5 bg-white/20 backdrop-blur-md rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/30 transition-all"
                  >
                     Recalculate
                  </button>
               </div>
            </div>
          </div>

          {/* Transaction Log */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
             <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight font-montserrat">Recent Transactions</h3>
                <button 
                  onClick={() => fetchEarningsData()}
                  className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline"
                >
                  Refresh Logs
                </button>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         <th className="px-8 py-4">Ref ID</th>
                         <th className="px-8 py-4">Source</th>
                         <th className="px-8 py-4">Type</th>
                         <th className="px-8 py-4">Gross Amt</th>
                         <th className="px-8 py-4">Coins Discount</th>
                         <th className="px-8 py-4">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50 text-[11px] font-bold text-slate-600">
                      {transactions.map((txn, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                           <td className="px-8 py-5 font-black text-blue-600 font-roboto">{txn.id}</td>
                           <td className="px-8 py-5 text-slate-900">{txn.source}</td>
                           <td className="px-8 py-5 uppercase tracking-tighter text-slate-400">{txn.type}</td>
                           <td className="px-8 py-5 font-black text-slate-900 font-roboto">{txn.gross}</td>
                           <td className="px-8 py-5 font-black text-amber-600 font-roboto">{txn.discount}</td>
                           <td className="px-8 py-5">
                              <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${
                                txn.status === 'Settled' ? 'bg-green-50 text-green-600' : txn.status === 'Pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                              }`}>
                                 {txn.status}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PlatformEarnings;
