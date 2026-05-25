import React, { useState, useRef } from 'react';
import { Bell, Heart, ShoppingCart, MapPin, ChevronDown, Search, Camera, Mic, Scan, X, Crosshair, MoreHorizontal, Home, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { NOTIFICATIONS } from '../../data/mockData';

export default function Navbar() {
  const navigate = useNavigate();
  const {
    user,
    totalCartItems,
    wishlist,
    location,
    setLocation,
    searchQuery,
    setSearchQuery,
    isLocationModalOpen,
    setIsLocationModalOpen
  } = useApp();

  const [tempLocation, setTempLocation] = useState(location);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [savedAddresses, setSavedAddresses] = useState([
    { id: 1, name: 'Mukesh Jinodiya', type: 'Home', address: '83 kishan pura mataji mandir, sector no. 5 new harsud...', pincode: '450001' },
    { id: 2, name: 'Vini Jinodiya', type: 'Home', address: '36, narmada kirana store abhinandan nagar mr10 ind...', pincode: '452010' }
  ]);

  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddressForm, setNewAddressForm] = useState({ name: '', address: '', pincode: '' });

  const filteredAddresses = savedAddresses.filter(addr => 
    addr.name.toLowerCase().includes(addressSearchQuery.toLowerCase()) || 
    addr.address.toLowerCase().includes(addressSearchQuery.toLowerCase())
  );

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        if (window.location.pathname !== '/categories') {
          navigate('/categories');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        alert('Could not start voice search.');
      };

      recognition.start();
    } else {
      alert("Your browser doesn't support voice search.");
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSearchQuery("Camera search result");
      if (window.location.pathname !== '/categories') {
        navigate('/categories');
      }
      alert("Image captured! In a real app, this would perform a visual search.");
    }
  };

  const handleSaveLocation = (loc) => {
    setLocation(loc);
    setIsLocationModalOpen(false);
  };

  return (
    <>
      <header className="bg-orange-50 transition-all duration-300">
        {/* Compact Main top header */}
        <div className="flex items-center justify-between px-2.5 py-1 bg-transparent">
          <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => navigate('/')}>
            {/* Logo image */}
            <img
              src="/Logo.jpg"
              alt="Mynzo Logo"
              className="h-14 object-contain rounded-lg hover:scale-102 transition-transform duration-300"
              onError={(e) => {
                e.target.alt = "Mynzo World";
              }}
            />
          </div>

          {/* Color theme with #02006c */}
          <div className="flex items-center gap-3 text-[#02006c]">
            <button 
              onClick={() => setIsNotificationModalOpen(true)}
              className="relative p-1 hover:bg-orange-100/40 rounded-full transition-colors"
            >
              <Bell className="w-5.5 h-5.5 stroke-[1.8]" />
              <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-[#FF6E54] border-2 border-white rounded-full"></span>
            </button>
            <button 
              onClick={() => navigate('/wishlist')}
              className="relative p-1 hover:bg-orange-100/40 rounded-full transition-colors"
            >
              <Heart className="w-5.5 h-5.5 stroke-[1.8]" />
              {user && wishlist && wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#FF6E54] border border-white rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative p-1 hover:bg-orange-100/40 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5.5 h-5.5 stroke-[1.8]" />
              {user && totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#FF6E54] text-[8.5px] font-black text-white ring-1.5 ring-white animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Location selector bar with INCREASED WIDTH (px-1.5) and DECREASED BORDER RADIUS (rounded-lg) */}
        <div className="px-1.5 py-1 bg-transparent">
          <div
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-[#FF6E54] text-white flex items-center justify-between px-4 py-2.5 rounded-lg text-[10.5px] font-black cursor-pointer hover:bg-[#e64c33] shadow-md shadow-orange-500/15 active:scale-[0.99] transition-all duration-300"
          >
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-4 h-4 text-white flex-shrink-0" />
              <span className="truncate tracking-wide">
                HOME &nbsp;<span className="font-normal text-orange-50/90">| &nbsp;{location}</span>
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-white flex-shrink-0" />
          </div>
        </div>

      </header>

      {/* Search bar row - Now Sticky at the top! */}
      <div className="sticky top-0 z-40 px-2 py-2 bg-orange-50 border-b border-orange-100/40 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2">
          {/* Search Input Bar (Symmetrical rounded-lg and increased height with py-2) */}
          <div className="flex-1 relative flex items-center bg-white/95 rounded-lg px-3.5 py-2 border border-slate-200/50 focus-within:border-[#FF6E54] focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-100 transition-all duration-300 shadow-3xs">
            <Search className="w-4 h-4 text-slate-400 mr-2.5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full bg-transparent text-xs text-[#02006c] outline-none placeholder-slate-400 font-semibold"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && window.location.pathname !== '/categories') {
                  navigate('/categories');
                }
              }}
            />
            {/* Voice search Mic option added next to Camera inside input capsule */}
            <div className="flex items-center gap-1.5 ml-2.5">
              <Camera 
                onClick={handleCameraClick}
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-[#FF6E54] transition-colors" 
              />
              <Mic 
                onClick={handleVoiceSearch}
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-[#FF6E54] transition-colors" 
              />
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleImageCapture} 
              />
            </div>
          </div>

          {/* Barcode/QR Scanner button (Symmetrical rounded-lg and balanced w-9 h-9) */}
          <button className="bg-white/95 border border-slate-200/50 hover:bg-white active:scale-95 text-[#FF6E54] rounded-lg shadow-3xs transition-all duration-300 w-9 h-9 flex items-center justify-center flex-shrink-0">
            <Scan className="w-4.5 h-4.5 stroke-[2.2]" />
          </button>
        </div>
      </div>

      {/* Delivery Address Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-[17px] font-bold text-[#02006c]">Select delivery address</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto scrollbar-none pb-4 flex-grow space-y-5">
              {/* Search Bar */}
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-3xs focus-within:border-[#FF6E54] focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                <Search className="w-4 h-4 text-slate-400 mr-2.5" />
                <input
                  type="text"
                  placeholder="Search by area, street name, pin code"
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder-slate-400 font-medium"
                  value={addressSearchQuery}
                  onChange={(e) => setAddressSearchQuery(e.target.value)}
                />
              </div>

              {/* Use Current Location */}
              <button 
                onClick={() => handleSaveLocation("Current Location")}
                className="flex items-center gap-3 w-full py-1 text-[#FF6E54] hover:opacity-80 transition-opacity"
              >
                <Crosshair className="w-5 h-5" />
                <span className="text-sm font-bold">Use my current location</span>
              </button>

              <div className="border-t border-dashed border-slate-200 my-2" />

              {/* Saved Addresses Header */}
              <div className="flex items-center justify-between mt-2 mb-3">
                <h4 className="text-[13px] font-bold text-[#0F172A]">Saved addresses</h4>
                <button 
                  onClick={() => {
                    if (isAddingNewAddress) {
                      setIsAddingNewAddress(false);
                      setEditingAddressId(null);
                      setNewAddressForm({ name: '', address: '', pincode: '' });
                    } else {
                      setIsAddingNewAddress(true);
                      setEditingAddressId(null);
                      setNewAddressForm({ name: '', address: '', pincode: '' });
                    }
                  }}
                  className="text-[#FF6E54] text-xs font-bold flex items-center gap-1 hover:underline"
                >
                  {isAddingNewAddress ? "Cancel" : <><Plus className="w-3.5 h-3.5" /> Add New</>}
                </button>
              </div>

              {/* Address List */}
              <div className="space-y-5">
                {isAddingNewAddress ? (
                  <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100 space-y-3 animate-fade-in">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Name</label>
                      <input 
                        type="text" 
                        value={newAddressForm.name}
                        onChange={(e) => setNewAddressForm({...newAddressForm, name: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#FF6E54] focus:outline-none bg-white" 
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Pin Code <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={newAddressForm.pincode}
                        onChange={(e) => setNewAddressForm({...newAddressForm, pincode: e.target.value.replace(/[^0-9]/g, '')})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#FF6E54] focus:outline-none bg-white" 
                        placeholder="e.g. 452010"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Full Address</label>
                      <textarea 
                        value={newAddressForm.address}
                        onChange={(e) => setNewAddressForm({...newAddressForm, address: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#FF6E54] focus:outline-none bg-white min-h-[80px]" 
                        placeholder="e.g. 123 Main St, Apartment 4B..."
                      />
                    </div>
                    <button 
                      onClick={() => {
                        if(newAddressForm.name && newAddressForm.address && newAddressForm.pincode) {
                          if (editingAddressId) {
                            setSavedAddresses(savedAddresses.map(a => 
                              a.id === editingAddressId 
                                ? { ...a, name: newAddressForm.name, address: newAddressForm.address, pincode: newAddressForm.pincode }
                                : a
                            ));
                          } else {
                            setSavedAddresses([
                              ...savedAddresses, 
                              { id: Date.now(), name: newAddressForm.name, type: 'Home', address: newAddressForm.address, pincode: newAddressForm.pincode }
                            ]);
                          }
                          setIsAddingNewAddress(false);
                          setEditingAddressId(null);
                          setNewAddressForm({ name: '', address: '', pincode: '' });
                        } else {
                          alert("Please fill in all mandatory fields, including the Pin Code.");
                        }
                      }}
                      className="w-full bg-[#FF6E54] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      {editingAddressId ? "Update Address" : "Save Address"}
                    </button>
                  </div>
                ) : (
                  filteredAddresses.map((addr) => {
                    // Simple mock selection logic
                    const isSelected = location === addr.address || (location === "Delhi, India" && addr.id === 1);
                    return (
                      <div key={addr.id} className="flex items-start gap-3 w-full group animate-fade-in">
                        <Home className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-[#FF6E54]' : 'text-slate-500'}`} />
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleSaveLocation(addr.address)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-[#0F172A]">{addr.name}</span>
                            {isSelected && (
                              <span className="bg-orange-100 text-[#FF6E54] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug pr-4 font-medium">{addr.address}</p>
                        </div>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingAddressId(addr.id);
                            setNewAddressForm({
                              name: addr.name,
                              address: addr.address,
                              pincode: addr.pincode || ''
                            });
                            setIsAddingNewAddress(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreHorizontal className="w-5 h-5" />
                        </button>
                      </div>
                    );
                  })
                )}
                {!isAddingNewAddress && filteredAddresses.length === 0 && (
                  <div className="text-center py-4 text-slate-400 text-sm font-medium animate-fade-in">
                    No addresses found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Notification Modal */}
      {isNotificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-6 shadow-2xl animate-slide-up max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 flex-shrink-0">
              <h3 className="text-base font-bold text-[#02006c]">Notifications</h3>
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pb-4 scrollbar-none">
              {NOTIFICATIONS.map((notif) => (
                <div key={notif.id} className={`p-3 rounded-xl border ${notif.read ? 'bg-white border-slate-100' : 'bg-orange-50/50 border-orange-200'}`}>
                  <div className="flex items-start justify-between">
                    <h4 className={`text-sm font-bold ${notif.read ? 'text-slate-700' : 'text-[#02006c]'}`}>{notif.title}</h4>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-[#FF6E54] flex-shrink-0 mt-1.5"></span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.message}</p>
                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

