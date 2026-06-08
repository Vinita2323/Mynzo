import React, { useState } from 'react';
import { 
  MessageSquare, Star, Search, Filter, MoreVertical, 
  CheckCircle2, XCircle, AlertCircle, Trash2, 
  User, ShoppingBag, Calendar, ThumbsUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MOCK_REVIEWS = [
  { id: 1, user: 'Rahul Sharma', product: 'Premium Leather Satchel', rating: 5, comment: 'Amazing quality! The leather feels very premium and the stitching is perfect.', date: '2026-05-10', status: 'Pending' },
  { id: 2, user: 'Priyanka Das', product: 'Biotique Face Wash', rating: 4, comment: 'Good product, but the delivery was a bit slow.', date: '2026-05-09', status: 'Approved' },
  { id: 3, user: 'Amit Verma', product: 'Wireless Earbuds Pro', rating: 1, comment: 'Worst experience. The left earbud stopped working after 2 days.', date: '2026-05-08', status: 'Flagged' },
  { id: 4, user: 'Sneha Kapur', product: 'Summer Floral Dress', rating: 5, comment: 'Perfect fit and beautiful design. Highly recommended!', date: '2026-05-08', status: 'Pending' },
];

const ReviewModeration = () => {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [activeTab, setActiveTab] = useState('Pending');

  const tabs = ['Pending', 'Approved', 'Flagged', 'All'];

  const StatusBadge = ({ status }) => {
    const styles = {
      'Pending': 'bg-amber-50 text-amber-600 border-amber-100',
      'Approved': 'bg-green-50 text-green-600 border-green-100',
      'Flagged': 'bg-red-50 text-red-600 border-red-100',
    };
    return (
      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-semibold text-slate-900 tracking-tight font-montserrat uppercase">Review Moderation</h1>
          <p className="text-slate-500 font-medium mt-1 font-raleway">Monitor and approve customer feedback to maintain platform quality.</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 space-y-4">
           <div className="flex flex-wrap gap-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                  : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by product or user..."
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-12 pr-6 text-sm font-bold focus:ring-4 focus:ring-blue-50 transition-all outline-none text-slate-900"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-50">
          {reviews.filter(r => activeTab === 'All' || r.status === activeTab).map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-slate-50/50 transition-colors flex gap-6"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 flex-shrink-0">
                 <User size={24} />
              </div>
              <div className="flex-1 space-y-3">
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-3">
                          <h4 className="font-black text-slate-900 font-montserrat uppercase tracking-tight">{review.user}</h4>
                          <StatusBadge status={review.status} />
                       </div>
                       <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <ShoppingBag size={12} />
                          {review.product}
                          <span className="mx-1">•</span>
                          <Calendar size={12} />
                          {review.date}
                       </div>
                    </div>
                    <div className="flex gap-1">
                       {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                       ))}
                    </div>
                 </div>
                 <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                    "{review.comment}"
                 </p>
                 <div className="flex justify-between items-center pt-2">
                    <div className="flex gap-4">
                       <button className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-500 transition-all">
                          <ThumbsUp size={14} />
                          Helpful (0)
                       </button>
                    </div>
                    <div className="flex gap-2">
                       {review.status !== 'Approved' && (
                         <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all">
                            <CheckCircle2 size={14} />
                            Approve
                         </button>
                       )}
                       {review.status !== 'Flagged' && (
                         <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-500 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">
                            <AlertCircle size={14} />
                            Flag
                         </button>
                       )}
                       <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-200 transition-all">
                          <Trash2 size={16} />
                       </button>
                    </div>
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewModeration;
