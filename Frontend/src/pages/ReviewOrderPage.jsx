import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Tag, Banknote, ShieldCheck, X, CheckCircle2, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import toast from 'react-hot-toast';
import OptimizedImage from '../components/ui/OptimizedImage';

export default function ReviewOrderPage() {
  const navigate = useNavigate();
  const { cart, totalCartPrice, user, clearCart, addOrder } = useApp();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);


  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [dbAddresses, setDbAddresses] = useState([]);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  
  // Add new address form state
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [newAddrName, setNewAddrName] = useState('');
  const [newAddrType, setNewAddrType] = useState('Home');
  const [newAddrText, setNewAddrText] = useState('');
  const [newAddrPhone, setNewAddrPhone] = useState('');
  const [newAddrPincode, setNewAddrPincode] = useState('');

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [feeInfoModal, setFeeInfoModal] = useState(null);
  
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'ONLINE'
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Shipping estimate states
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [etd, setEtd] = useState('');
  const [isEstimatingDelivery, setIsEstimatingDelivery] = useState(false);


  // Fetch addresses
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

  const addressesList = dbAddresses;
  
  useEffect(() => {
    if (!selectedAddressId && addressesList.length > 0) {
      setSelectedAddressId(addressesList[0]._id || addressesList[0].id);
    }
  }, [addressesList, selectedAddressId]);

  const selectedAddress = addressesList.find(a => (a._id === selectedAddressId || a.id === selectedAddressId)) || addressesList[0];

  useEffect(() => {
    if (selectedAddress && selectedAddress.pincode && cart.length > 0) {
      const estimateShipping = async () => {
        setIsEstimatingDelivery(true);
        try {
          const totalWeight = cart.reduce((total, item) => total + ((item.weight || 0.5) * item.quantity), 0);
          const res = await fetch(`${API_BASE}/api/shiprocket/estimate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              deliveryPincode: selectedAddress.pincode, 
              weight: totalWeight, 
              cod: paymentMethod === 'COD' ? 1 : 0 
            })
          });
          const data = await res.json();
          if (data.success) {
            setDeliveryCharge(data.deliveryCharge);
            setEtd(data.etd);
          } else {
            setDeliveryCharge(0);
            setEtd('');
          }
        } catch (err) {
          console.error("Error estimating shipping:", err);
          setDeliveryCharge(0);
          setEtd('');
        } finally {
          setIsEstimatingDelivery(false);
        }
      };
      estimateShipping();
    }
  }, [selectedAddress, paymentMethod, cart, API_BASE]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddrName || !newAddrText || !newAddrPincode || !newAddrPhone) {
      alert("Please fill all required fields");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(newAddrPhone)) {
      alert("Phone number must be exactly 10 digits");
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
          phone: newAddrPhone,
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
        setNewAddrPhone('');
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
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/admin/promotions/coupons/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({
          code: promoInput.trim(),
          orderAmount: totalCartPrice
        })
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        const found = data.coupon;
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
        setPromoError(data.message || 'Failed to validate coupon.');
        setAppliedCoupon(null);
        setDiscountAmount(0);
      }
    } catch (err) {
      console.error("Error applying promo:", err);
      setPromoError('Server error validating coupon.');
      setAppliedCoupon(null);
      setDiscountAmount(0);
    }
  };


  const handleRemovePromo = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoError('');
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    
    if (!selectedAddress) {
      toast.error("Please add a delivery address before placing order");
      return;
    }
    
    setIsPlacingOrder(true);
    
    if (paymentMethod === 'ONLINE') {
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Razorpay SDK failed to load. Are you offline?");
        setIsPlacingOrder(false);
        return;
      }
      
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_mockkey",
        amount: grandTotal * 100,
        currency: "INR",
        name: "Mynzo World",
        description: "Purchase Transaction",
        handler: function (response) {
          executeOrderPlacement("Online", response.razorpay_payment_id);
        },
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "customer@example.com",
          contact: user?.phone || ""
        },
        theme: {
          color: "#ee4923"
        },
        modal: {
          ondismiss: function() {
            setIsPlacingOrder(false);
          }
        }
      };
      
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      // Direct COD placement
      setTimeout(() => {
        executeOrderPlacement("COD");
      }, 1500);
    }
  };

  const executeOrderPlacement = async (method, paymentId = '') => {
    try {
      const token = localStorage.getItem('userToken');
      const orderItems = cart.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }));
      
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          total: grandTotal,
          deliveryAddress: {
            name: selectedAddress.name,
            type: selectedAddress.type,
            address: selectedAddress.address,
            pincode: selectedAddress.pincode
          },
          paymentMethod: method === 'Online' ? 'Online' : 'COD',
          paymentStatus: method === 'Online' ? 'Paid' : 'Pending',
          paymentId: paymentId,
          couponCode: appliedCoupon ? appliedCoupon.code : undefined,
          deliveryCharge: deliveryCharge,
          etd: etd
        })
      });
      
      const data = await res.json();
      
      if (data.success && data.order) {
        const o = data.order;
        const mappedOrder = {
          id: o._id || o.id,
          date: new Date(o.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
          items: o.items.map(item => ({
            id: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image
          })),
          total: o.total,
          status: o.status,
          paymentMethod: o.paymentMethod,
          paymentStatus: o.paymentStatus,
          deliveryCharge: o.deliveryCharge,
          etd: o.etd
        };
        
        addOrder(mappedOrder);
        clearCart();
        toast.success(`Order Placed Successfully via ${method}!`);
        navigate('/orders', { replace: true });
      } else {
        toast.error(data.message || "Failed to place order.");
      }
    } catch (err) {
      console.error("Order placement failed:", err);
      toast.error("Failed to place order due to server error.");
    } finally {
      setIsPlacingOrder(false);
    }
  };


  const mockSavings = 2458;
  const platformCommission = 15;
  
  const gstAmount = Math.round(Math.max(0, totalCartPrice - discountAmount) * 0.18);
  const grandTotal = Math.max(0, totalCartPrice - discountAmount + gstAmount + platformCommission + deliveryCharge);
  const mockOriginalTotal = totalCartPrice + mockSavings;

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
          <span className="text-[11px] font-bold text-emerald-600">You're saving ₹{mockSavings + discountAmount}</span>
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
            {selectedAddress ? (
              <>
                <p className="text-[13px] leading-snug text-slate-600 mb-3">
                  <span className="font-bold text-slate-800">{selectedAddress.name}</span> ({selectedAddress.type}) - {selectedAddress.address}, {selectedAddress.pincode}
                </p>
                <button 
                  onClick={() => setIsAddressModalOpen(true)}
                  className="text-[#ee4923] text-xs font-bold mb-4"
                >
                  Change Address <span className="ml-1">›</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-4 bg-orange-50/50 rounded-lg border border-orange-100 mb-4">
                <p className="text-sm font-bold text-slate-700 mb-2">Please add shipping info</p>
                <button 
                  onClick={() => {
                    setIsAddingAddress(true);
                    setIsAddressModalOpen(true);
                  }}
                  className="px-4 py-2 bg-[#ee4923] text-white text-xs font-bold rounded-lg shadow-sm hover:scale-105 transition-transform"
                >
                  Add New Address
                </button>
              </div>
            )}
            
            <div className="space-y-2 mt-2">
               {cart && cart.map((item, idx) => (
                <div key={item.id || idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  <div className="w-12 h-12 relative flex-shrink-0">
                    <OptimizedImage src={item.image} alt={item.name} type="product" className="absolute inset-0 rounded shadow-sm border border-slate-200" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#02006c]">₹{item.price * item.quantity}</span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500">Qty: {item.quantity}</span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 w-fit px-1.5 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3" />
                      {etd ? `Estimated Delivery: ${etd}` : 'Delivery Tomorrow'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Promo Code Input Block */}
        <div>
          <div className="flex items-center gap-2 mb-2 px-1 text-[#02006c]">
            <Tag className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-wide">Promo Code / Coupons</h2>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500">Apply Coupon</span>
              {appliedCoupon && (
                <span className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                  Active
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <input 
                  type="text" 
                  placeholder="Enter Coupon (e.g. FLAT50)" 
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                  className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-xs font-bold focus:outline-none focus:border-[#ee4923] uppercase"
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon && (
                  <button 
                    onClick={handleRemovePromo}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!appliedCoupon ? (
                <button 
                  onClick={handleApplyPromo}
                  className="bg-[#ee4923] hover:bg-[#d8401e] text-white px-4 py-2 rounded-lg text-xs font-black transition-all active:scale-95 shadow-sm"
                >
                  Apply
                </button>
              ) : (
                <button 
                  onClick={handleRemovePromo}
                  className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                </button>
              )}
            </div>
            {promoError && <p className="text-[10px] text-rose-500 font-bold">{promoError}</p>}
            {appliedCoupon && (
              <p className="text-[10px] text-green-600 font-bold">
                ✓ Coupon '{appliedCoupon.code}' applied successfully!
              </p>
            )}
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
              <span className="text-slate-600">Total MRP</span>
              <span className="text-slate-800">₹{mockOriginalTotal}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Product Discount</span>
              <span className="text-emerald-600 font-medium">- ₹{mockSavings}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-slate-600">Coupon Discount ({appliedCoupon.code})</span>
                <span className="text-emerald-600 font-medium">- ₹{discountAmount}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Product GST (18%)</span>
              <span className="text-slate-800">₹{gstAmount}</span>
            </div>
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">Platform Commission </span>
              <span className="text-slate-800">₹{platformCommission}</span>
            </div>
           
            <div className="flex justify-between items-center text-[13px]">
              <span className="text-slate-600">
                {paymentMethod === 'COD' ? 'Delivery Charges (COD)' : 'Delivery Charges (Prepaid)'} 
                <span className="text-[10px] text-slate-400 ml-1">(Cart Weight: {cart.reduce((total, item) => total + ((item.weight || 0.5) * item.quantity), 0)}kg)</span>
              </span>
              {isEstimatingDelivery ? (
                <span className="text-slate-400 font-medium">Calculating...</span>
              ) : (
                <span className={deliveryCharge > 0 ? "text-slate-800" : "text-emerald-600 font-medium"}>
                  {deliveryCharge > 0 ? `₹${deliveryCharge}` : 'FREE'}
                </span>
              )}
            </div>
            
            <div className="border-t border-slate-200 pt-3 mt-1 flex justify-between items-center">
              <span className="font-bold text-[#02006c] text-sm">Total Amount</span>
              <span className="font-black text-[#02006c] text-base tracking-tight">₹{grandTotal}</span>
            </div>
          </div>
        </div>
        
        {/* Payment Method Selected Tabs */}
        <div className="mt-4 bg-white rounded-xl shadow-sm border border-slate-100 p-4">
          <div className="flex items-center gap-2 mb-3 text-[#02006c]">
            <Banknote className="w-4 h-4" />
            <h2 className="text-xs font-black uppercase tracking-wide">Select Payment Method</h2>
          </div>
          <div className="flex gap-3">
            <button 
              type="button"
              onClick={() => setPaymentMethod('COD')}
              className={`flex-1 py-3 px-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                paymentMethod === 'COD' 
                  ? 'border-[#ee4923] bg-orange-50/20 text-[#ee4923] shadow-xs' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-black">Cash on Delivery</span>
            </button>
            <button 
              type="button"
              onClick={() => setPaymentMethod('ONLINE')}
              className={`flex-1 py-3 px-2 rounded-xl border transition-all text-center flex flex-col items-center justify-center ${
                paymentMethod === 'ONLINE' 
                  ? 'border-[#ee4923] bg-orange-50/20 text-[#ee4923] shadow-xs' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="text-xs font-black">Pay Online</span>
            </button>
          </div>
        </div>

        {/* Secure marker */}
        <div className="flex items-center justify-center gap-1.5 pt-6 opacity-50 pb-28">
           <ShieldCheck className="w-5 h-5 text-slate-500" />
           <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Safe and Secure Payments</span>
        </div>
      </div>

      {/* Full-screen Loading Overlay for Order Placement */}
      {isPlacingOrder && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
          <div className="w-16 h-16 border-4 border-t-[#ee4923] border-slate-200 rounded-full animate-spin mb-4"></div>
          <h3 className="text-lg font-bold text-[#02006c] animate-pulse">Processing your order securely...</h3>
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto z-40 bg-white">
        <div className="bg-white p-3 border-t border-slate-200 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] rounded-t-2xl relative">
          {/* Place Order Button */}
          <button 
            onClick={handlePlaceOrder}
            className="w-full bg-[#ee4923] active:bg-[#e05b43] text-white py-3.5 rounded-lg font-bold text-sm shadow-md transition-all active:scale-95"
          >
            Confirm & Place order ₹{grandTotal}
          </button>
        </div>
      </div>


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
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210" 
                      value={newAddrPhone} 
                      onChange={(e) => setNewAddrPhone(e.target.value)}
                      className="mt-1 w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-[#ee4923]"
                      required 
                      maxLength={10}
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
