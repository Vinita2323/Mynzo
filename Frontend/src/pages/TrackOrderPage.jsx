import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, CheckCircle2, Package, Truck, Home, MapPin, Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TrackOrderPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [liveTracking, setLiveTracking] = useState(null);

  useEffect(() => {
    const fetchOrderAndTracking = async () => {
      try {
        const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiBase}/orders/track/${orderId}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setOrder(data.order);
          
          // Fetch Live Tracking from Shiprocket if AWB exists
          if (data.order.awbCode) {
            try {
              const srRes = await fetch(`${apiBase}/api/shiprocket/track/${data.order.awbCode}`);
              const srData = await srRes.json();
              if (srRes.ok && srData.success) {
                // Shiprocket tracking response structure varies, usually in tracking_data.shipment_track
                const trackingData = srData.tracking?.tracking_data?.shipment_track || [];
                const trackingActivities = srData.tracking?.tracking_data?.shipment_track_activities || [];
                setLiveTracking({ track: trackingData[0], activities: trackingActivities });
              }
            } catch (e) {
              console.error('Error fetching live tracking:', e);
            }
          }
          
        } else {
          toast.error('Could not fetch order details');
        }
      } catch (error) {
        toast.error('Error fetching tracking info');
      } finally {
        setLoading(false);
      }
    };
    if (orderId) fetchOrderAndTracking();
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#02006c]" size={32} /></div>;
  }

  if (!order) {
    return <div className="min-h-screen flex flex-col gap-2 items-center justify-center font-bold text-slate-500">
      <AlertCircle size={40} className="text-slate-300" />
      <p>Order not found</p>
      <button onClick={() => navigate(-1)} className="text-[#02006c] underline mt-2 text-sm">Go Back</button>
    </div>;
  }

  const isDelivered = order.status === 'Delivered';
  const isCancelled = order.status === 'Cancelled';
  const trackingHistory = order.trackingHistory || [];

  // Dynamic tracking steps
  let steps = [];
  
  if (liveTracking && liveTracking.activities && liveTracking.activities.length > 0) {
    // Merge live tracking data
    steps = [
      { id: 'placed', title: 'Order Placed', desc: 'We have received your order', date: new Date(order.createdAt).toLocaleString(), icon: CheckCircle2, status: 'completed' },
      ...liveTracking.activities.map((history, idx) => ({
        id: `live_${idx}`,
        title: history.activity,
        desc: history.location || 'Update from courier',
        date: new Date(history.date).toLocaleString(),
        icon: history.activity.toUpperCase().includes('DELIVERED') ? Home : (history.activity.toUpperCase().includes('OUT FOR DELIVERY') ? MapPin : Truck),
        status: 'completed'
      }))
    ];
  } else if (trackingHistory.length > 0) {
    steps = [
      { id: 'placed', title: 'Order Placed', desc: 'We have received your order', date: new Date(order.createdAt).toLocaleString(), icon: CheckCircle2, status: 'completed' },
      ...trackingHistory.map((history, idx) => ({
        id: `hist_${idx}`,
        title: history.status,
        desc: history.activity || history.location || 'Update from courier',
        date: new Date(history.timestamp).toLocaleString(),
        icon: history.status.includes('DELIVERED') ? Home : (history.status.includes('OUT FOR DELIVERY') ? MapPin : Truck),
        status: 'completed'
      }))
    ];
  } else {
    steps = [
      { id: 1, title: 'Order Placed', desc: 'We have received your order', date: new Date(order.createdAt).toLocaleString(), icon: CheckCircle2, status: 'completed' },
      { id: 2, title: 'Order Processed', desc: 'Your order is being prepared', date: '', icon: Package, status: order.status !== 'Pending' ? 'completed' : 'pending' },
      { id: 3, title: 'Shipped', desc: 'Your item has been shipped', date: '', icon: Truck, status: ['Shipped', 'Out for Delivery', 'Delivered'].includes(order.status) ? 'completed' : (order.status === 'Processing' ? 'active' : 'pending') },
      { id: 4, title: 'Out for Delivery', desc: 'Delivery partner is on the way', date: '', icon: MapPin, status: isDelivered ? 'completed' : (order.status === 'Out for Delivery' ? 'active' : 'pending') },
      { id: 5, title: 'Delivered', desc: 'Package arrived', date: '', icon: Home, status: isDelivered ? 'completed' : 'pending' },
    ];
  }

  // Estimated delivery based on order ETD, live tracking, or fallback
  let estDeliveryDate = new Date(order.createdAt);
  estDeliveryDate.setDate(estDeliveryDate.getDate() + 4); // basic 4 days fallback
  
  if (order.etd) {
    estDeliveryDate = new Date(order.etd);
  }

  if (liveTracking?.track?.expected_date) {
    estDeliveryDate = new Date(liveTracking.track.expected_date);
  }

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
        
        {/* Estimated Delivery & Courier Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">Estimated Delivery</p>
              <p className="text-lg font-black text-[#02006c]">{estDeliveryDate.toDateString()}</p>
            </div>
            <div className="w-10 h-10 bg-[#ee4923]/10 rounded-full flex items-center justify-center">
              <Truck className="w-5 h-5 text-[#ee4923]" />
            </div>
          </div>
          
          {order.awbCode && (
            <div className="pt-3 border-t border-slate-50 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Courier</p>
                <p className="text-sm font-black text-slate-700">{order.courierName || 'Shiprocket Partner'}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracking Number</p>
                <p className="text-sm font-black text-blue-600">{order.awbCode}</p>
              </div>
            </div>
          )}
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
                        <div className="absolute -inset-1 rounded-full bg-[#ee4923]/20 animate-ping"></div>
                      )}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-white relative z-10 shadow-sm ${
                        isCompleted ? 'bg-[#02006c] text-white' : 
                        isActive ? 'bg-[#ee4923] text-white shadow-md shadow-[#ee4923]/30' : 
                        'bg-slate-100 text-slate-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>
                    
                    {/* Details */}
                    <div className="pt-1 flex-1">
                      <div className="flex justify-between items-start">
                        <p className={`text-[13px] font-bold leading-tight ${
                          isActive ? 'text-[#ee4923]' : (isCompleted ? 'text-slate-800' : 'text-slate-400')
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
