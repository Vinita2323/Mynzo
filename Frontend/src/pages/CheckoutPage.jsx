import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Lock, ChevronDown, ChevronUp, CreditCard, Banknote, Gift, CalendarOff, ArrowRight, CheckCircle2, Smile, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getImageUrl } from '../utils/imageHelper';
import analytics from '../utils/analytics';
import Lottie from 'lottie-react';
import orderProcessingAnimation from '../assets/Lotties/OrderProcessing.json';
import paytmLogo from '../assets/UPI/Paytm-removebg-preview.webp';
import phonepeLogo from '../assets/UPI/PhonePay-removebg-preview.webp';
import upiLogo from '../assets/UPI/UPI-removebg-preview.webp';
import cardsLogo from '../assets/UPI/Cards-removebg-preview.webp';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalCartPrice, clearCart, addOrder, user } = useApp();

  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  React.useEffect(() => {
    if (cart.length > 0) {
      analytics.trackCheckoutStarted(cart, totalCartPrice);
    }
  }, []);

  React.useEffect(() => {
    if (expandedSection && ['UPI', 'CARDS', 'COD'].includes(expandedSection)) {
      analytics.trackPaymentSelected(expandedSection);
    }
  }, [expandedSection]);
  
  // Calculate total with static GST/delivery matching CartPage
  const deliveryFee = 0;
  const gst = Math.round(totalCartPrice * 0.05);
  
  const [expandedSection, setExpandedSection] = useState('UPI');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  
  // Interactive Form State
  const [selectedUpiOption, setSelectedUpiOption] = useState('Paytm');
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '' });
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardApplied, setGiftCardApplied] = useState(false);
  const giftCardDiscount = giftCardApplied ? 100 : 0; // Mock 100 rs discount

  const grandTotal = Math.max((totalCartPrice + deliveryFee + gst) - giftCardDiscount, 0) || 481; // fallback to 481 if empty
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOrder = () => {
    setIsProcessing(true);
    // Simulate network request
    setTimeout(() => {
      setIsProcessing(false);
      
      // Save the order
      const newOrder = {
        id: 'ORD' + Math.floor(Math.random() * 1000000),
        date: new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }),
        items: [...cart],
        total: grandTotal,
        status: 'Processing'
      };
      addOrder(newOrder);

      clearCart(); // Clear the cart successfully
      
      // Show Success Modal
      setShowSuccessModal(true);
      
      // Navigate to orders page after showing modal
      setTimeout(() => {
        navigate('/orders', { replace: true });
      }, 2000);
    }, 2000); // Reduced delay to 2 seconds for better UX
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? '' : section);
  };

  const applyGiftCard = () => {
    if (giftCardCode.length > 3) {
      setGiftCardApplied(true);
    } else {
      alert('Invalid Gift Card Code');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-serif overflow-hidden relative">
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-[300] flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[320px] flex flex-col items-center text-center shadow-2xl scale-100 transition-transform">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-[20px] font-black text-[#02006c] mb-2 tracking-tight">Order Placed Successfully!</h3>
            <p className="text-[13px] text-slate-500 mb-2">Your payment was securely processed.</p>
            <div className="flex items-center justify-center gap-2 mt-4 text-[#ee4923] font-bold text-[11px] uppercase tracking-widest">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Redirecting...</span>
            </div>
          </div>
        </div>
      )}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-[200] flex flex-col items-center justify-center">
          <Lottie animationData={orderProcessingAnimation} loop={true} className="w-32 h-32 mb-2" />
          <h3 className="text-lg font-bold text-[#02006c] animate-pulse font-sans">Processing Payment securely...</h3>
        </div>
      )}

      {/* Header */}
      <header className="bg-orange-50 px-4 py-3 flex items-center justify-between border-b border-orange-100 shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 hover:bg-white rounded-full transition-colors cursor-pointer text-[#02006c]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-sans leading-tight">Step 3 of 3</span>
            <h1 className="text-lg font-black text-[#02006c] tracking-wide leading-tight" style={{ fontFamily: "'Times New Roman', Times, serif" }}>Checkout</h1>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-orange-100 shadow-xs">
          <Lock className="w-3 h-3 text-[#ee4923]" />
          <span className="text-[9px] font-bold text-slate-700 font-sans uppercase tracking-wider">100% Secure</span>
        </div>
      </header>

      {/* Scrollable Content */}
      <div className="flex-grow overflow-y-auto pb-8">
        
        {/* Total Amount Summary */}
        <div 
          onClick={() => setShowSummaryModal(true)}
          className="bg-blue-50/70 p-4 m-3 rounded-xl border border-blue-100 flex items-center justify-between cursor-pointer hover:bg-blue-50 active:scale-[0.98] transition-all"
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[#02006c]">Total Amount</span>
              <ChevronDown className="w-4 h-4 text-[#02006c]" />
            </div>
            {giftCardApplied && <span className="text-[10px] text-emerald-600 font-bold font-sans">₹100 Gift Card Applied!</span>}
          </div>
          <span className="text-lg font-black text-[#02006c]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>₹{grandTotal}</span>
        </div>

        {/* Cashback Banner */}
        <div className="bg-emerald-50 p-4 mx-3 mb-4 rounded-xl border border-emerald-100 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-sm font-bold text-emerald-700">5% Cashback</span>
            <span className="text-[11px] text-emerald-600 mt-0.5 font-sans">Claim now with payment offers</span>
          </div>
          <div className="flex items-center -space-x-2">
            <div className="w-6 h-6 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-[8px] font-black text-orange-500 z-30 font-sans">P</div>
            <div className="w-6 h-6 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-[8px] font-black text-blue-600 z-20 font-sans">S</div>
            <div className="w-6 h-6 rounded-full bg-white border border-emerald-100 shadow-sm flex items-center justify-center text-[8px] font-black text-red-600 z-10 font-sans">A</div>
          </div>
        </div>

        {/* Payment Accordions */}
        <div className="bg-white border-y border-slate-200 divide-y divide-slate-100 shadow-sm font-sans">
          
          {/* UPI Section */}
          <div className="flex flex-col">
            <button 
              onClick={() => toggleSection('UPI')}
              className="p-4 flex items-center justify-between w-full text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img src={upiLogo} alt="UPI" className="w-10 h-auto object-contain drop-shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">UPI</span>
                  {expandedSection !== 'UPI' && <span className="text-[10px] text-emerald-600 mt-0.5">Get upto ₹50 cashback • 2 offers available</span>}
                </div>
              </div>
              {expandedSection === 'UPI' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            
            {expandedSection === 'UPI' && (
              <div className="px-4 pb-4 pt-1 bg-slate-50/50">
                <p className="text-xs text-slate-500 mb-4 px-1">Pay by any UPI app</p>
                
                {/* Paytm Option */}
                <div 
                  onClick={() => setSelectedUpiOption('Paytm')}
                  className={`bg-white border rounded-xl p-3 mb-3 transition-all relative overflow-hidden cursor-pointer shadow-xs
                    ${selectedUpiOption === 'Paytm' ? 'border-[#ee4923]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {selectedUpiOption === 'Paytm' && <div className="absolute top-0 left-0 w-1 h-full bg-[#ee4923]"></div>}
                  <div className="flex items-center justify-between mb-2 pl-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border
                        ${selectedUpiOption === 'Paytm' ? 'border-transparent' : 'border-slate-300'}`}>
                        {selectedUpiOption === 'Paytm' && <CheckCircle2 className="w-5 h-5 text-[#ee4923] fill-[#ee4923]/20" />}
                      </div>
                      <span className="text-sm font-bold text-slate-800">Paytm</span>
                    </div>
                    <img src={paytmLogo} alt="Paytm" className="h-6 w-auto object-contain pr-1" />
                  </div>
                  
                  {selectedUpiOption === 'Paytm' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOrder(); }}
                      className="w-full bg-[#ee4923] hover:bg-[#e05b43] active:scale-95 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-3"
                    >
                      <span>Pay ₹{grandTotal}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* PhonePe Option */}
                <div 
                  onClick={() => setSelectedUpiOption('PhonePe')}
                  className={`bg-white border rounded-xl p-3 transition-all relative overflow-hidden cursor-pointer shadow-xs mb-3
                    ${selectedUpiOption === 'PhonePe' ? 'border-[#ee4923]' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {selectedUpiOption === 'PhonePe' && <div className="absolute top-0 left-0 w-1 h-full bg-[#ee4923]"></div>}
                  <div className="flex items-center justify-between mb-2 pl-2">
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border
                        ${selectedUpiOption === 'PhonePe' ? 'border-transparent' : 'border-slate-300'}`}>
                        {selectedUpiOption === 'PhonePe' && <CheckCircle2 className="w-5 h-5 text-[#ee4923] fill-[#ee4923]/20" />}
                      </div>
                      <span className="text-sm font-bold text-slate-800">PhonePe</span>
                    </div>
                    <img src={phonepeLogo} alt="PhonePe" className="h-6 w-auto object-contain pr-1" />
                  </div>

                  {selectedUpiOption === 'PhonePe' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleOrder(); }}
                      className="w-full bg-[#ee4923] hover:bg-[#e05b43] active:scale-95 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-3"
                    >
                      <span>Pay ₹{grandTotal}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            )}
          </div>

          {/* Cards Section */}
          <div className="flex flex-col">
            <button 
              onClick={() => toggleSection('CARDS')}
              className="p-4 flex items-center justify-between w-full text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <img src={cardsLogo} alt="Cards" className="w-10 h-auto object-contain drop-shadow-sm" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-800">Credit / Debit / ATM Card</span>
                  <span className="text-[10px] text-slate-500 mt-0.5">Add and secure cards as per RBI guidelines</span>
                  {expandedSection !== 'CARDS' && <span className="text-[10px] text-emerald-600 mt-0.5">Get upto 5% cashback • 2 offers available</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedSection === 'CARDS' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </div>
            </button>
            {expandedSection === 'CARDS' && (
              <div className="px-4 pb-4 pt-2 bg-slate-50/50">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
                  <input 
                    type="text" 
                    placeholder="Card Number" 
                    maxLength={16}
                    value={cardDetails.number}
                    onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#ee4923]"
                  />
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      placeholder="MM/YY" 
                      maxLength={5}
                      value={cardDetails.expiry}
                      onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})}
                      className="w-1/2 bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#ee4923]"
                    />
                    <input 
                      type="password" 
                      placeholder="CVV" 
                      maxLength={3}
                      value={cardDetails.cvv}
                      onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                      className="w-1/2 bg-slate-50 border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#ee4923]"
                    />
                  </div>
                  <button 
                    onClick={handleOrder}
                    disabled={cardDetails.number.length < 16 || cardDetails.cvv.length < 3}
                    className="w-full bg-[#ee4923] disabled:bg-slate-300 hover:bg-[#e05b43] active:scale-95 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Pay ₹{grandTotal}</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* COD Section */}
          <div className="flex flex-col">
            <button 
              onClick={() => toggleSection('COD')}
              className="p-4 flex items-center justify-between w-full text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Banknote className="w-6 h-6 text-slate-600" />
                <span className="text-sm font-bold text-slate-800">Cash on Delivery</span>
              </div>
              {expandedSection === 'COD' ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
            </button>
            {expandedSection === 'COD' && (
              <div className="px-4 pb-4 pt-1 bg-slate-50/50">
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    Due to handling costs, a nominal fee of ₹9 will be charged for orders placed using this option. Avoid this fee by paying online now.
                  </p>
                  <button 
                    onClick={handleOrder}
                    className="w-full bg-[#ee4923] hover:bg-[#e05b43] active:scale-95 text-white py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Place Order (₹{grandTotal + 9})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Gift Card Section */}
          <div className="flex flex-col">
            <button 
              onClick={() => !giftCardApplied && toggleSection('GIFT')}
              className="p-4 flex items-center justify-between w-full text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-6 h-6 text-slate-600" />
                <span className="text-sm font-bold text-slate-800">Have a Mynzo Gift Card?</span>
              </div>
              {giftCardApplied ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Applied</span>
              ) : (
                <span className="text-xs font-bold text-[#02006c]">{expandedSection === 'GIFT' ? 'Close' : 'Add'}</span>
              )}
            </button>
            {expandedSection === 'GIFT' && !giftCardApplied && (
              <div className="px-4 pb-4 pt-1 bg-slate-50/50">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Code (e.g., SAVE100)" 
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    className="flex-grow bg-white border border-slate-200 p-3 rounded-lg text-sm outline-none focus:border-[#02006c] uppercase"
                  />
                  <button 
                    onClick={applyGiftCard}
                    className="bg-[#02006c] hover:bg-[#03004a] text-white px-5 rounded-lg font-bold text-sm transition-colors shadow-sm"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* EMI Section */}
          <div className="flex flex-col">
            <div className="p-4 flex items-center justify-between w-full text-left bg-slate-50 opacity-60">
              <div className="flex items-center gap-3">
                <CalendarOff className="w-6 h-6 text-slate-500" />
                <span className="text-sm font-bold text-slate-600">EMI</span>
              </div>
              <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                Unavailable
                <div className="w-3 h-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">?</div>
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex flex-col items-center justify-center mt-12 pb-8 text-slate-400 gap-2 opacity-80">
          <span className="text-xs font-bold text-center px-8" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
            35 Crore happy customers and counting!
          </span>
          <Smile className="w-6 h-6" />
        </div>

      </div>

      {/* Order Summary Modal */}
      {showSummaryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-end justify-center animate-fade-in" onClick={() => setShowSummaryModal(false)}>
          <div className="bg-white w-full max-w-md rounded-t-3xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-orange-50/50">
              <h3 className="font-bold text-[#02006c] font-sans">Order Summary</h3>
              <button onClick={() => setShowSummaryModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-slate-600 shadow-sm transition-colors font-sans">✕</button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3 font-sans">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <img src={getImageUrl(item.image)} alt={item.name} className="w-10 h-10 object-cover rounded-md shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 bg-white rounded-md shadow-xs border border-slate-100 flex items-center justify-center text-[8px] text-slate-400">Image</div>
                    )}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800 line-clamp-1">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold mt-0.5">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="text-sm font-black text-[#ee4923] whitespace-nowrap">₹{item.price * item.quantity}</span>
                </div>
              ))}
              {cart.length === 0 && (
                <div className="text-center p-4 text-slate-500 text-xs font-medium">Your cart is empty.</div>
              )}
              {giftCardApplied && (
                <div className="flex justify-between items-center px-1 text-emerald-600 font-bold text-sm">
                  <span>Gift Card Applied</span>
                  <span>- ₹100</span>
                </div>
              )}
              <div className="border-t border-slate-200 pt-4 mt-4 flex justify-between items-center px-1">
                <span className="text-sm font-bold text-slate-600">Total (incl. GST)</span>
                <span className="text-xl font-black text-[#02006c]" style={{ fontFamily: "'Times New Roman', Times, serif" }}>₹{grandTotal}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
