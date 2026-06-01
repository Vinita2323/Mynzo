import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ShieldCheck, ChevronLeft, ChevronDown, Star, Truck, Bookmark, Zap, Percent, CheckCircle2, Info, MapPin, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Lottie from 'lottie-react';
import addToCartAnimation from '../assets/Lotties/AddToCart.json';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, totalCartPrice, totalCartItems, setActiveTab, user } = useApp();

  const handleCheckout = () => {
    if (!user) {
      navigate('/login');
    } else {
      navigate('/review-order');
    }
  };

  // Mock addresses for selection
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

  const [selectedAddressId, setSelectedAddressId] = useState(1);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [couponApplied, setCouponApplied] = useState(false);
  
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [qtyModalItemId, setQtyModalItemId] = useState(null);
  const [customQtyInput, setCustomQtyInput] = useState('');

  const handleApplyCustomQty = () => {
    const qty = parseInt(customQtyInput);
    if (!isNaN(qty) && qty > 0) {
      updateQuantity(qtyModalItemId, qty);
      setIsQtyModalOpen(false);
      setCustomQtyInput('');
    } else {
      alert("Please enter a valid quantity greater than 0.");
    }
  };
  
  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];

  const mockSavings = 2458;
  const mockOriginalTotal = totalCartPrice + mockSavings;

  return (
    <div className="flex-grow flex flex-col bg-slate-100 min-h-[100dvh] pb-24 relative font-sans">
      {/* Header - Kept identical to original Mynzo theme per request */}
      <header className="sticky top-0 bg-orange-100 border-b border-orange-200/50 px-4 py-3 flex items-center justify-between z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-1.5 bg-white hover:bg-orange-50 border border-slate-200 rounded-full shadow-sm transition-colors active:scale-95 cursor-pointer text-[#02006c]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-1.5 -ml-1">
            <Lottie animationData={addToCartAnimation} loop={true} className="w-10 h-10" />
            <div className="flex flex-col justify-center">
              <h1 className="text-sm font-black text-[#02006c] tracking-wide uppercase font-sans flex items-center gap-1.5 leading-tight">
                Your Basket
                <ShoppingBag className="w-3.5 h-3.5 text-[#ee4923]" />
              </h1>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest font-sans leading-tight">
                Secure Checkout
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 bg-[#ee4923]/10 text-[#ee4923] px-2.5 py-0.5 rounded-full border border-[#ee4923]/15">
          <span className="text-[8.5px] font-bold uppercase tracking-wider">{totalCartItems} Items</span>
        </div>
      </header>

      {/* Main Page Content */}
      <div className="flex-grow animate-fade-in flex flex-col gap-2 pt-2">
        {cart.length > 0 ? (
          <>
            {/* Delivery Header */}
            <div className="bg-white px-4 py-3 flex items-center justify-between shadow-sm gap-3">
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5 text-xs leading-tight">
                  <span className="text-slate-500 whitespace-nowrap">Deliver to:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[140px]">{selectedAddress.name}, {selectedAddress.pincode}</span> 
                  <span className="bg-slate-100 text-[9px] px-1.5 py-0.5 rounded text-slate-600 font-bold align-middle uppercase">{selectedAddress.type}</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 truncate">{selectedAddress.address}</span>
              </div>
              <button 
                onClick={() => setIsAddressModalOpen(true)}
                className="text-[#02006c] font-bold text-xs border border-slate-200 px-3 py-1.5 rounded shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap flex-shrink-0"
              >
                Change
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex flex-col gap-2">
              {cart.map((item, index) => (
                <div key={item.id} className="bg-white shadow-sm pb-1 pt-4">
                  {/* Tag */}
                  <div className="px-4 mb-3">
                    {index === 0 ? (
                      <span className="bg-green-50 border border-green-100 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-sm">Hot Deal</span>
                    ) : (
                      <span className="text-rose-700 font-medium text-[10px]">Only few left</span>
                    )}
                  </div>
                  
                  <div className="flex gap-4 px-4">
                    {/* Left side: Image and Qty */}
                    <div className="flex flex-col gap-3 w-[84px] flex-shrink-0">
                      <div className="aspect-[4/5] bg-white border border-slate-200 p-1 rounded overflow-hidden">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div className="relative border border-slate-300 rounded flex items-center justify-between px-2 py-1 bg-white shadow-sm cursor-pointer hover:border-slate-400">
                        <span className="text-[11px] font-bold text-slate-800">Qty: {item.quantity}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                        <select 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          value={item.quantity > 3 ? "custom" : item.quantity}
                          onChange={(e) => {
                            if (e.target.value === "more") {
                              setQtyModalItemId(item.id);
                              setCustomQtyInput(item.quantity > 3 ? item.quantity.toString() : '');
                              setIsQtyModalOpen(true);
                            } else if (e.target.value !== "custom") {
                              updateQuantity(item.id, parseInt(e.target.value));
                            }
                          }}
                        >
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                          {item.quantity > 3 && <option value="custom" hidden>{item.quantity}</option>}
                          <option value="more">More</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Right side: Details */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-[13px] text-slate-800 leading-snug pr-2">{item.name}</h3>
                      <p className="text-[11px] text-slate-400 mt-1">{item.desc || "Pack of 1, Standard Fit"}</p>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center gap-0.5 bg-green-600 text-white px-1 py-[2px] rounded-sm text-[10px] font-bold leading-none">
                          4.5 <Star className="w-2.5 h-2.5 fill-white" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium">(408)</span>
                      </div>
                      
                      {/* Pricing */}
                      <div className="flex items-end gap-2 mt-2.5">
                        <span className="text-green-600 font-bold text-xs mb-0.5">↓{item.discount}</span>
                        <span className="text-slate-400 line-through text-xs mb-0.5">₹{item.originalPrice * item.quantity}</span>
                        <span className="text-slate-900 font-black text-lg tracking-tight leading-none">₹{item.price * item.quantity}</span>
                      </div>
                      
                      {/* Delivery */}
                      <div className="flex items-center gap-1.5 mt-3 text-[11px]">
                        <span className="text-slate-600">Delivery by tomorrow, 11 PM</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex border-t border-slate-100 mt-4 h-[42px]">
                    <button onClick={() => removeFromCart(item.id)} className="flex-1 flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-50 text-xs font-bold border-r border-slate-100 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                    <button 
                      onClick={handleCheckout} 
                      className="flex-1 flex items-center justify-center gap-1.5 text-[#ee4923] hover:bg-orange-50 text-xs font-bold transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5" /> Buy this now
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Apply Banner */}
            <div className="px-4 py-3 bg-white mt-0.5 shadow-sm">
              <div className="border border-slate-200 rounded-lg flex items-center justify-between p-3 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded bg-[#02006c]/10 text-[#02006c] flex items-center justify-center border border-[#02006c]/20">
                    <Percent className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-700 font-medium">Save extra <span className="font-bold">₹210</span> with Coupon</span>
                </div>
                <button 
                  onClick={() => setCouponApplied(!couponApplied)}
                  className={`font-black text-sm active:scale-95 transition-all ${
                    couponApplied ? 'text-emerald-600' : 'text-[#02006c]'
                  }`}
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </button>
              </div>
            </div>

            {/* Green Savings Banner */}
            <div className="bg-green-50 px-4 py-2.5 flex justify-center items-center gap-1.5 border-b border-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-600 fill-green-100" />
              <span className="text-xs text-green-700 font-medium">You'll save <span className="font-bold">₹{mockSavings}</span> on this order!</span>
            </div>
            
            {/* Safe seal */}
            <div className="flex items-center justify-center gap-2 py-6">
              <ShieldCheck className="w-5 h-5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-400 leading-tight uppercase tracking-widest">
                100% Secure Payments
              </span>
            </div>

            {/* Bottom sticky bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 z-50 flex items-center justify-between max-w-md mx-auto shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col justify-center">
                <span className="text-[11px] text-slate-400 line-through font-medium -mb-0.5">₹{mockOriginalTotal}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black text-slate-800 tracking-tight leading-none">₹{totalCartPrice}</span>
                  <Info className="w-3 h-3 text-slate-400 cursor-pointer" />
                </div>
              </div>
              <button 
                onClick={handleCheckout} 
                className="w-1/2 bg-[#ee4923] active:bg-[#d8401e] text-white py-3.5 rounded-lg font-black text-[15px] shadow-sm transition-all"
              >
                Place Order
              </button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="bg-white border-t border-slate-100 p-10 text-center flex flex-col items-center justify-center flex-grow">
            <div className="w-20 h-20 bg-orange-50 text-[#ee4923] rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
              <ShoppingBag className="w-10 h-10" />
            </div>
            <h4 className="text-base font-black text-[#0F172A] mb-2">Your Bag is Empty</h4>
            <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] mb-8">
              Looks like you haven't added any items to your shopping bag yet.
            </p>
            <button
              onClick={() => { navigate('/'); setActiveTab('home'); }}
              className="bg-[#ee4923] active:scale-95 text-white text-xs font-black px-8 py-3.5 rounded shadow-sm transition-all"
            >
              CONTINUE SHOPPING
            </button>
          </div>
        )}
      </div>

      {/* Custom Quantity Modal */}
      {isQtyModalOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-white rounded-2xl w-full max-w-[320px] p-5 shadow-2xl animate-scale-in">
            <h2 className="text-lg font-black text-[#02006c] mb-4 text-center">Enter Quantity</h2>
            
            <input 
              type="number" 
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-center text-lg font-bold text-slate-800 focus:outline-none focus:border-[#ee4923] focus:ring-2 focus:ring-orange-100 mb-6"
              value={customQtyInput}
              onChange={(e) => setCustomQtyInput(e.target.value)}
              placeholder="e.g. 4"
              min="1"
              autoFocus
            />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsQtyModalOpen(false)}
                className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleApplyCustomQty}
                className="flex-1 bg-[#ee4923] text-white font-bold py-3 rounded-xl hover:bg-orange-600 transition-colors shadow-sm shadow-orange-200"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address Selection Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-[60] flex flex-col justify-end bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          {/* Modal Content */}
          <div className="bg-white rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
              <h2 className="text-base font-black text-[#02006c]">Select Delivery Address</h2>
              <button 
                onClick={() => setIsAddressModalOpen(false)}
                className="p-1.5 bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body / List */}
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

    </div>
  );
}
