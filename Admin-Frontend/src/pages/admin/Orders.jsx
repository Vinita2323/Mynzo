import React, { useState } from 'react';
import { 
  Search, Filter, ChevronRight, Eye, 
  Package, Truck, CheckCircle2, Clock, 
  XCircle, AlertCircle, MoreVertical,
  Download, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_ORDERS = [
  { id: 'OD87459', customer: 'Rahul Sharma', email: 'rahul@example.com', total: 4500, status: 'Pending', date: '2026-05-09 10:30 AM', items: 3, payment: 'Paid' },
  { id: 'OD87460', customer: 'Priyanka Das', email: 'priyanka@example.com', total: 1250, status: 'Processing', date: '2026-05-09 11:15 AM', items: 1, payment: 'COD' },
  { id: 'OD87461', customer: 'Amit Verma', email: 'amit@example.com', total: 8900, status: 'Delivered', date: '2026-05-08 04:20 PM', items: 5, payment: 'Paid' },
  { id: 'OD87462', customer: 'Sneha Kapur', email: 'sneha@example.com', total: 2300, status: 'Cancelled', date: '2026-05-08 02:10 PM', items: 2, payment: 'Refunded' },
  { id: 'OD87463', customer: 'Vikram Singh', email: 'vikram@example.com', total: 15600, status: 'Pending', date: '2026-05-08 01:45 PM', items: 8, payment: 'Paid' },
  { id: 'OD87464', customer: 'Anjali Gupta', email: 'anjali@example.com', total: 3200, status: 'Processing', date: '2026-05-08 12:30 PM', items: 2, payment: 'Paid' },
];

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
    'Confirmed': 'bg-blue-50 text-blue-600 border-blue-100',
    'Packed': 'bg-indigo-50 text-indigo-600 border-indigo-100',
    'Shipped': 'bg-violet-50 text-violet-600 border-violet-100',
    'Out for Delivery': 'bg-purple-50 text-purple-600 border-purple-100',
    'Delivered': 'bg-green-50 text-green-600 border-green-100',
    'Returned': 'bg-orange-50 text-orange-600 border-orange-100',
    'Refunded': 'bg-teal-50 text-teal-600 border-teal-100',
    'Cancelled': 'bg-red-50 text-red-600 border-red-100',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
      {status}
    </span>
  );
};

const Orders = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['All', 'Pending', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Returned', 'Refunded', 'Cancelled'];

  const filteredOrders = MOCK_ORDERS.filter(order => {
    const matchesTab = activeTab === 'All' || order.status === activeTab;
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight font-montserrat uppercase">Orders Hub</h1>
          <p className="text-slate-500 font-medium mt-1 font-raleway">Centralized tracking and lifecycle management for platform sales.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Sales', value: '₹1.2M', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'New Orders', value: '24', icon: ShoppingBag, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Transit', value: '12', icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Cancelled', value: '4', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center shadow-inner`}>
              {React.createElement(stat.icon || Package, { size: 24 })}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
              <p className="text-xl font-black text-slate-900 font-roboto">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search by Order ID or Customer Name..."
                className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-900 placeholder:text-slate-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="px-6 bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm flex items-center gap-2 font-black text-[10px] uppercase tracking-widest">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Order ID</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Total</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Payment</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredOrders.map((order, i) => (
                  <motion.tr 
                    key={order.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-5">
                      <span className="text-xs font-black text-blue-600 font-roboto">{order.id}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{order.customer}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="text-sm font-black text-slate-900 font-roboto">₹{order.total.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{order.items} Items</p>
                    </td>
                    <td className="px-6 py-5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-6 py-5">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${order.payment === 'Paid' ? 'text-green-500' : 'text-slate-400'}`}>
                        {order.payment}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold">
                        <Calendar size={12} className="text-slate-300" />
                        {order.date}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-blue-50 hover:text-blue-500 transition-all">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 hover:text-slate-900 transition-all">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Import needed icons that might be missing from list but used
const DollarSign = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const ShoppingBag = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>;

export default Orders;
