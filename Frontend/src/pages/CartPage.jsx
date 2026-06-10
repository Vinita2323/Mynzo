import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ShieldCheck, ChevronLeft, ChevronDown, Star, Truck, Bookmark, Zap, Percent, CheckCircle2, Info, MapPin, X, Plus } from 'lucide-react';
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

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [dbAddresses, setDbAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Add new address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrType, setNewAddrType] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [qtyModalItemId, setQtyModalItemId] = useState(null);
  const [customQtyInput, setCustomQtyInput] = useState('');

  // Fetch addresses from DB
  const fetchAddresses = async () => {
    if (user && user.id) {
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        const res = await fetch(`${API_BASE}/addresses`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success && data.data) {
          setDbAddresses(data.data);
          if (data.data.length > 0) {
            setSelectedAddressId(data.data[0]._id);
          }
        }
      } catch (err) {
        console.error("Error fetching addresses:", err);
      }
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const mockAddresses = [
    {
      _id: 'mock-1',
      type: 'WORK',
      name: 'Chirag Jeevanani',
      pincode: '452001',
      address: 'Corporate house, South Tukoganj, Jhabua Tower, Indore'
    },
    {
      _id: 'mock-2',
      type: 'HOME',
      name: 'Vini',
      pincode: '452012',
      address: 'AH-49, Kadambari Nagar, Near Maa Annapurna Ice And Cold Storage, Indore'
    },
    {
      _id: 'mock-3',
      type: 'OTHER',
      name: 'Chirag',
      pincode: '484001',
      address: 'Near shankar takies, front of ram khilawan oil mill, Shahdol'
    }
  ];

  const addressesList = (dbAddresses.length > 0) ? dbAddresses : mockAddresses;
  
  useEffect(() => {
    if (!selectedAddressId && addressesList.length > 0) {
      setSelectedAddressId(addressesList[0]._id || addressesList[0].id);
    }
  }, [addressesList, selectedAddressId]);

  const selectedAddress = addressesList.find(a => (a._id === selectedAddressId || a.id === selectedAddressId)) || addressesList[0] || mockAddresses[0];

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

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddrName || !newAddrText || !newAddrPincode) {
      alert("Please fill all required fields");
      return;
    }
    if (!user || !user.id) {
      alert("Please log in to save addresses");
      return;
    }
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: newAddrName,
          type: newAddrType,
          address: newAddrText,
          pincode: newAddrPincode
        })
      });
      const data = await res.json();
      if (data.success && data.data) {
        setDbAddresses(prev => [...prev, data.data]);
        setSelectedAddressId(data.data._id);
        setIsAddingAddress(false);
        setNewAddrName('');
        setNewAddrType('Home');
        setNewAddrText('');
        setNewAddrPincode('');
      } else {
        alert(data.message || "Failed to add address");
      }
    } catch (err) {
      console.error("Error adding address:", err);
      alert("Failed to add address due to server error");
    }
  };

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) {
      setPromoError('Please enter a coupon code.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/admin/promotions/coupons`);
      const data = await res.json();
      if (data.success && data.coupons) {
        const found = data.coupons.find(c => c.code.toUpperCase() === promoInput.trim().toUpperCase());
        if (!found) {
          setPromoError('Invalid coupon code.');
          setAppliedCoupon(null);
          setDiscountAmount(0);
          return;
        }
        if (found.status !== 'Active') {
          setPromoError('This coupon is no longer active.');
          return;
        }
        if (new Date(found.expiry) < new Date()) {
          setPromoError('This coupon has expired.');
          return;
        }
        if (totalCartPrice < found.minOrder) {
          setPromoError(`Minimum order amount of ₹${found.minOrder} required.`);
          return;
        }

        setAppliedCoupon(found);
        setPromoError('');
        let discount = 0;
        if (found.type === 'Percentage') {
          discount = Math.round((totalCartPrice * found.value) / 100);
        } else {
          discount = found.value;
        }
        setDiscountAmount(discount);
      } else {
        setPromoError('Failed to validate coupon.');
      }
    } catch (err) {
      console.error("Error applying promo:", err);
      setPromoError('Server error validating coupon.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoError('');
  };

  const mockSavings = 2458;
  const gstAmount = Math.round(Math.max(0, totalCartPrice - discountAmount) * 0.18);
  const platformCommission = 15;
  const finalTotal = Math.max(0, totalCartPrice - discountAmount + gstAmount + platformCommission);
  const mockOriginalTotal = totalCartPrice + mockSavings;

  return (
    <div className="flex-grow flex flex-col bg-slate-100 pb-40 relative font-sans">
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
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subtotal</span>
                <span className="text-xl font-black text-slate-800 tracking-tight leading-none">₹{totalCartPrice}</span>
              </div>
              <button 
                onClick={handleCheckout} 
                className="w-1/2 bg-[#ee4923] active:bg-[#d8401e] text-white py-3.5 rounded-lg font-black text-[15px] shadow-sm transition-all"
              >
                Checkout
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
                onClick={() => {
                  setIsAddressModalOpen(false);
                  setIsAddingAddress(false);
                }}
                className="p-1.5 bg-slate-50 rounded-full text-slate-500 hover:text-slate-800 transition-colors active:scale-95"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Modal Body / List */}
            <div className="overflow-y-auto p-4 flex flex-col gap-3 pb-safe">
              {!isAddingAddress ? (
                <>
                  {addressesList.map(addr => {
                    const idVal = addr._id || addr.id;
                    const isSelected = selectedAddressId === idVal;
                    return (
                      <div 
                        key={idVal}
                        onClick={() => {
                          setSelectedAddressId(idVal);
                          setIsAddressModalOpen(false);
                        }}
                        className={`border rounded-xl p-4 cursor-pointer transition-all ${
                          isSelected 
                            ? 'border-[#ee4923] bg-orange-50/30' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="pt-0.5">
                            <div className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                              isSelected ? 'border-[#ee4923]' : 'border-slate-300'
                            }`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#ee4923]" />}
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
                    );
                  })}

                  {user && (
                    <button 
                      onClick={() => setIsAddingAddress(true)}
                      className="mt-2 w-full border border-dashed border-[#02006c] hover:bg-slate-50 text-[#02006c] py-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add New Address
                    </button>
                  )}
                </>
              ) : (
                <form onSubmit={handleAddAddress} className="flex flex-col gap-3.5 p-1 animate-fade-in">
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Receiver Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Vini Sharma" 
                      value={newAddrName} 
                      onChange={(e) => setNewAddrName(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#ee4923]"
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Address Type</label>
                    <div className="flex gap-2 mt-1">
                      {['Home', 'Work', 'Other'].map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setNewAddrType(t)}
                          className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                            newAddrType === t 
                              ? 'border-[#ee4923] bg-orange-50/30 text-[#ee4923]' 
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Detailed Address</label>
                    <textarea 
                      placeholder="e.g. Flat/House No, Building, Street, Area" 
                      value={newAddrText} 
                      onChange={(e) => setNewAddrText(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#ee4923] min-h-[70px]"
                      required 
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Pincode</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 452001" 
                      value={newAddrPincode} 
                      onChange={(e) => setNewAddrPincode(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#ee4923]"
                      required 
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button 
                      type="button" 
                      onClick={() => setIsAddingAddress(false)}
                      className="flex-1 py-3 bg-slate-100 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors"
                    >
                      Back
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-[#ee4923] text-white text-xs font-black rounded-xl hover:bg-orange-600 transition-colors shadow-sm"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
