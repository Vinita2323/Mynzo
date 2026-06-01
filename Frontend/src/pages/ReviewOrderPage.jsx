import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, Banknote, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ReviewOrderPage() {
  const navigate = useNavigate();
  const { cart, totalCartPrice, user } = useApp();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [feeInfoModal, setFeeInfoModal] = useState(null);

  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  const addresses = [
    {
      id: 1,
      type: 'WORK',
      name: 'Chirag Jeevanani',
      pincode: '452001',
      address: 'Corporate house, South Tukoganj, Jhabua Tower, Indore'
    },
    {
      id: 2,
      type: 'HOME',
      name: 'Vini',
      pincode: '452012',
      address: 'AH-49, Kadambari Nagar, Near Maa Annapurna Ice And Cold Storage, Indore'
    },
    {
      id: 3,
      type: 'OTHER',
      name: 'Chirag',
      pincode: '484001',
      address: 'Near shankar takies, front of ram khilawan oil mill, Shahdol'
    }
  ];

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const availableCoupons = [
    { code: 'WELCOME50', discount: 210, desc: 'Save ₹210 on your first order' },
    { code: 'MYNZO10', discount: 150, desc: 'Flat ₹150 off on everything' }
  ];

  const mockSavings = 2458;
  const platformFee = 23;
  const codFee = 10;
  
  const couponDiscountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const grandTotal = totalCartPrice + platformFee + codFee - couponDiscountAmount;

  const firstItem = cart && cart.length > 0 ? cart[0] : null;

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-32 animate-fade-in">
      {/* Header */}
      <header className="bg-[#fff4f2] px-4 py-3 flex items-center gap-3 sticky top-0 z-50 shadow-sm border-b border-orange-100">
        <button onClick={() => navigate(-1)} className="p-1 hover:bg-white/50 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-[#02006c]" />
        </button>
        <div className="flex flex-col leading-tight">
          <h1 className="text-base font-black text-[#02006c] tracking-tight">Review Order</h1>
          <span className="text-[11px] font-bold text-emerald-600">You're saving ₹{mockSavings}</span>
        </div>
      </header>

      <div className="px-3 pt-4 space-y-5">
        
        {/* Delivery Details Section */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1 text-[#02006c]">
            <MapPin className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-wide">Delivery Details</h2>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-[13px] leading-snug text-slate-600 mb-3">
              <span className="font-bold text-slate-800">{selectedAddress.name}</span> {selectedAddress.address}, {selectedAddress.pincode}
            </p>
            <button 
              onClick={() => setIsAddressModalOpen(true)}
              className="text-[#ee4923] text-xs font-bold mb-4"
            >
              Change Address <span className="ml-1">›</span>
            </button>
            
            {firstItem && (
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <img src={firstItem.image} alt={firstItem.name} className="w-12 h-12 object-cover rounded shadow-sm border border-slate-200" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Delivery by Tomorrow</span>
                  <span className="text-[11px] text-slate-500 mt-0.5">Size: Standard</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Coupons & Bank Offers */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1 text-[#02006c]">
            <Tag className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-wide">Coupons & Bank Offers</h2>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            {appliedCoupon ? (
              <div className="flex justify-between items-center mb-3">
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-emerald-600">'{appliedCoupon.code}' applied</span>
                  <span className="text-[11px] text-slate-500">Savings: ₹{appliedCoupon.discount}</span>
                </div>
                <button onClick={() => setAppliedCoupon(null)} className="text-slate-400 text-xs font-bold hover:text-slate-600">Remove</button>
              </div>
            ) : (
              <p className="text-[13px] text-slate-600 mb-3">No best coupons available</p>
            )}
            <button 
              onClick={() => setIsCouponModalOpen(true)}
              className="text-[#ee4923] text-xs font-bold"
            >
              All Offers <span className="ml-1">›</span>
            </button>
          </div>
        </div>

        {/* Price Details */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1 text-[#02006c]">
            <Banknote className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-wide">Price Details</h2>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600 flex items-center gap-1">Total MRP <span className="text-[10px] text-slate-400 border border-slate-300 rounded-full w-3 h-3 flex items-center justify-center">?</span></span>
              <span className="text-slate-800">₹{totalCartPrice + mockSavings}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Discount on MRP</span>
              <span className="text-emerald-600 font-medium">- ₹{mockSavings}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Coupon Discount</span>
              {appliedCoupon ? (
                <span className="text-emerald-600 font-medium">- ₹{appliedCoupon.discount}</span>
              ) : (
                <button onClick={() => setIsCouponModalOpen(true)} className="text-[#ee4923] font-bold">Apply Coupon</button>
              )}
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Platform Fee <button onClick={() => setFeeInfoModal('platform')} className="text-[#ee4923] font-bold ml-1 text-[11px] hover:underline cursor-pointer">Know More</button></span>
              <span className="text-slate-800">₹{platformFee}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Cash/Pay on Delivery Fee <button onClick={() => setFeeInfoModal('cod')} className="text-[#ee4923] font-bold ml-1 text-[11px] hover:underline cursor-pointer">Know More</button></span>
              <span className="text-slate-800">₹{codFee}</span>
            </div>
            
            <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
              <span className="font-bold text-[#02006c] text-sm">Total Amount</span>
              <span className="font-black text-[#02006c] text-base tracking-tight">₹{grandTotal}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Method Selected Overlay */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-6 border border-slate-200 rounded flex items-center justify-center bg-slate-50">
               <Banknote className="w-4 h-4 text-[#02006c]" />
             </div>
             <div className="flex flex-col">
               <span className="text-[11px] font-bold text-[#02006c]">Cash on delivery(Cash/UPI)</span>
               <span className="text-[9px] text-slate-500">₹ 10 is applied extra for this option.</span>
             </div>
          </div>
          <button 
            onClick={() => navigate('/checkout')}
            className="text-[#ee4923] font-bold text-xs pr-1 active:scale-95 transition-transform"
          >
            Change
          </button>
        </div>

        {/* Secure marker */}
        <div className="flex items-center justify-center gap-1.5 pt-6 opacity-50 pb-28">
           <ShieldCheck className="w-5 h-5 text-slate-500" />
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Safe and Secure Payments</span>
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-40 bg-white">
        <div className="bg-white p-3 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-2xl relative">

          {/* Place Order Button */}
          <button 
            onClick={() => navigate('/checkout')}
            className="w-full bg-[#ee4923] active:bg-[#e05b43] text-white py-3.5 rounded-lg font-bold text-sm shadow-md transition-all"
          >
            Confirm & Place order ₹{grandTotal}
          </button>
        </div>
      </div>

      {/* Coupon Selection Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-base font-black text-[#02006c]">Apply Coupon</h2>
              <button 
                onClick={() => setIsCouponModalOpen(false)}
                className="p-1.5 bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex flex-col gap-4 pb-safe">
              {availableCoupons.map((coupon, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4 relative overflow-hidden bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-orange-50 text-[#ee4923] border border-orange-100 px-2 py-1 rounded text-xs font-black uppercase tracking-wider">{coupon.code}</span>
                    {appliedCoupon?.code === coupon.code ? (
                      <span className="text-emerald-600 font-bold text-xs flex items-center gap-1">Applied</span>
                    ) : (
                      <button 
                        onClick={() => {
                          setAppliedCoupon(coupon);
                          setIsCouponModalOpen(false);
                        }}
                        className="text-[#02006c] font-bold text-sm"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  <p className="text-sm font-bold text-slate-800">{coupon.desc}</p>
                  <p className="text-[11px] text-slate-500 mt-1">Applicable on your current cart value.</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-base font-black text-[#02006c]">Select Delivery Address</h2>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto p-4 flex flex-col gap-3 pb-safe">
              {addresses.map(addr => (
                <div 
                  key={addr.id}
                  onClick={() => {
                    setSelectedAddressId(addr.id);
                    setIsAddressModalOpen(false);
                  }}
                  className={`border rounded-xl p-4 cursor-pointer transition-all ${
                    selectedAddressId === addr.id 
                      ? 'border-[#ee4923] bg-orange-50/30' 
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5">
                      <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                        selectedAddressId === addr.id ? 'border-[#ee4923]' : 'border-slate-300'
                      }`}>
                        {selectedAddressId === addr.id && <div className="w-2 h-2 rounded-full bg-[#ee4923]" />}
                      </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[13px] font-bold text-slate-800">{addr.name}</span>
                        <span className="bg-slate-100 text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold uppercase">{addr.type}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 leading-snug">{addr.address}</span>
                      <span className="text-[11px] font-bold text-slate-600 mt-1">Pincode: {addr.pincode}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fee Info Modal */}
      {feeInfoModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in px-4">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-scale-up">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-[#02006c] text-lg">
                {feeInfoModal === 'platform' ? 'Platform Fee' : 'Cash on Delivery Fee'}
              </h3>
              <button onClick={() => setFeeInfoModal(null)} className="p-1 rounded-full bg-slate-100 hover:bg-slate-200">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              {feeInfoModal === 'platform' 
                ? 'This nominal fee helps us maintain the platform, ensure secure payments, and provide you with a seamless shopping experience.'
                : 'A small fee charged by our delivery partners for handling cash. Pay online to avoid this fee!'
              }
            </p>
            <button onClick={() => setFeeInfoModal(null)} className="w-full bg-[#EE4923] text-white py-3 rounded-xl font-bold active:scale-95 transition-transform">
              Understood
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
