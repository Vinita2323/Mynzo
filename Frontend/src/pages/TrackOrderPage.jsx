import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Package, Truck, Home, MapPin } from 'lucide-react';

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const isDelivered = orderId !== 'ORD-8X92-K1';

  // Dynamic tracking steps
  const steps = [
    { id: 1, title: 'Order Placed', desc: 'We have received your order', date: 'May 20, 10:00 AM', icon: CheckCircle2, status: 'completed' },
    { id: 2, title: 'Order Processed', desc: 'Your order is being prepared', date: 'May 21, 09:30 AM', icon: Package, status: 'completed' },
    { id: 3, title: 'Shipped', desc: 'Your item has been shipped', date: 'May 22, 08:00 AM', icon: Truck, status: isDelivered ? 'completed' : 'active' },
    { id: 4, title: 'Out for Delivery', desc: 'Delivery partner is on the way', date: 'May 23, 11:15 AM', icon: MapPin, status: isDelivered ? 'completed' : 'pending' },
    { id: 5, title: 'Delivered', desc: 'Package arrived', date: 'May 24, 02:30 PM', icon: Home, status: isDelivered ? 'active' : 'pending' },
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
        <div className="flex flex-col">
          <h1 className="text-[17px] font-bold text-[#02006c] leading-tight">Track Order</h1>
          <span className="text-[11px] font-bold text-slate-500 tracking-wider">#{orderId || '123456789'}</span>
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        
        {/* Estimated Delivery Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Estimated Delivery</p>
            <p className="text-lg font-black text-[#02006c]">24 May, 2026</p>
          </div>
          <div className="w-10 h-10 bg-[#FF6E54]/10 rounded-full flex items-center justify-center">
            <Truck className="w-5 h-5 text-[#FF6E54]" />
          </div>
        </div>

        {/* Tracking Timeline */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <h3 className="text-[14px] font-bold text-slate-800 mb-4">Order Status</h3>
          
          <div className="relative">
            {/* Vertical Line */}
            <div className="absolute left-5 top-4 bottom-6 w-0.5 bg-slate-100"></div>

            <div className="space-y-5 relative z-10">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = step.status === 'completed';
                const isActive = step.status === 'active';
                const isPending = step.status === 'pending';
                
                return (
                  <div key={step.id} className="flex gap-3">
                    {/* Status Icon */}
                    <div className="relative">
                      {isActive && (
                        <div className="absolute -inset-1 rounded-full bg-[#FF6E54]/20 animate-ping"></div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-white relative z-10 shadow-sm ${
                        isCompleted ? 'bg-[#02006c] text-white' : 
                        isActive ? 'bg-[#FF6E54] text-white shadow-md shadow-[#FF6E54]/30' : 
                        'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="pt-1 flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-[13px] font-bold leading-tight ${
                          isActive ? 'text-[#FF6E54]' : (isCompleted ? 'text-slate-800' : 'text-slate-400')
                        }`}>
                          {step.title}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 whitespace-nowrap ml-2">
                          {step.date}
                        </p>
                      </div>
                      <p className={`text-[11px] mt-0.5 ${
                        isActive ? 'text-slate-600 font-medium' : 'text-slate-400'
                      }`}>
                        {step.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
