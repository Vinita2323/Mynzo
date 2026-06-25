import React, { useState, useRef, useEffect } from 'react';
import { Bell, Heart, ShoppingCart, MapPin, ChevronDown, Search, Camera, Mic, Scan, X, Crosshair, MoreHorizontal, Home, Plus, Gamepad2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import toast from 'react-hot-toast';
import { NOTIFICATIONS } from '../../data/mockData';
import analytics from '../../utils/analytics';

export default function Navbar() {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const isHome = routerLocation.pathname === '/';

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (!scrollContainer) return;

    const handleScroll = (e) => {
      setIsScrolled(e.target.scrollTop > 20);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const shouldHideTopSections = isHome && isScrolled;
  const {
    user,
    totalCartItems,
    wishlist,
    location,
    setLocation,
    searchQuery,
    setSearchQuery,
    isLocationModalOpen,
    setIsLocationModalOpen,
    logout
  } = useApp();

  const [tempLocation, setTempLocation] = useState(location);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const fileInputRef = useRef(null);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const [savedAddresses, setSavedAddresses] = useState([
    { id: 1, name: 'Mukesh Jinodiya', type: 'Home', address: '83 kishan pura mataji mandir, sector no. 5 new harsud...', pincode: '450001' },
    { id: 2, name: 'Vini Jinodiya', type: 'Home', address: '36, narmada kirana store abhinandan nagar mr10 ind...', pincode: '452010' }
  ]);

  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [newAddressForm, setNewAddressForm] = useState({ name: '', address: '', pincode: '' });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!user) {
        setSavedAddresses([
          { id: 1, name: 'Mukesh Jinodiya', type: 'Home', address: '83 kishan pura mataji mandir, sector no. 5 new harsud...', pincode: '450001' },
          { id: 2, name: 'Vini Jinodiya', type: 'Home', address: '36, narmada kirana store abhinandan nagar mr10 ind...', pincode: '452010' }
        ]);
        return;
      }
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        const res = await fetch(`${API_BASE}/addresses`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.status === 401) {
          logout();
          toast.error("Session expired. Please log in again.");
          return;
        }
        const data = await res.json();
        if (data.success) {
          const mapped = data.data.map(addr => ({
            id: addr._id,
            name: addr.name,
            type: addr.type,
            address: addr.address,
            pincode: addr.pincode
          }));
          setSavedAddresses(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };

    if (isLocationModalOpen) {
      fetchAddresses();
    }
  }, [user, isLocationModalOpen]);

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
        analytics.trackSearch(transcript);
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
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size cannot exceed 10MB!');
        return;
      }
      setSearchQuery("Camera search result");
      analytics.trackSearch("Camera visual search");
      if (window.location.pathname !== '/categories') {
        navigate('/categories');
      }
      toast.success("Image captured! Performing visual search...");
    }
  };

  const handleSaveLocation = (loc) => {
    setLocation(loc);
    setIsLocationModalOpen(false);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoadingNotifications(true);
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/notifications/my`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const markNotificationsAsRead = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('userToken');
      await fetch(`${API_BASE}/notifications/read-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // Update local read status
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking notifications as read:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else {
      setNotifications([]);
    }
  }, [user]);

  useEffect(() => {
    if (isNotificationModalOpen) {
      fetchNotifications();
      const timer = setTimeout(() => {
        markNotificationsAsRead();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isNotificationModalOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#EE4923] shadow-sm transition-all duration-300 pb-2">
        {/* Compact Main top header */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${shouldHideTopSections ? 'max-h-0 opacity-0' : 'max-h-[100px] opacity-100'}`}>
          <div className="flex items-center justify-between px-2.5 py-1 bg-transparent">
            <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => navigate('/')}>
            {/* Logo image */}
            <img
              src="/HopeFinal.webp"
              alt="Mynzo Logo"
              className="h-12 bg-white p-1 rounded-lg shadow-sm object-contain hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.target.alt = "Mynzo World";
              }}
            />
          </div>

          {/* Color theme updated to white for dark bg */}
          <div className="flex items-center gap-3 text-white">
            <button 
              onClick={() => {
                if (!user) {
                  navigate('/login');
                } else {
                  setIsNotificationModalOpen(true);
                }
              }}
              className="relative p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <Bell className="w-5.5 h-5.5 stroke-[1.8]" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-white border-2 border-[#EE4923] rounded-full"></span>
              )}
            </button>
            <button 
              onClick={() => navigate('/wishlist')}
              className="relative p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <Heart className="w-5.5 h-5.5 stroke-[1.8]" />
              {user && wishlist && wishlist.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-white border border-[#EE4923] rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => navigate('/cart')}
              className="relative p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <ShoppingCart className="w-5.5 h-5.5 stroke-[1.8]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[8.5px] font-black text-[#EE4923] ring-1.5 ring-[#EE4923] animate-pulse">
                  {totalCartItems}
                </span>
              )}
            </button>
          </div>
          </div>
        </div>

        {/* Location selector bar with INCREASED WIDTH (px-1.5) and DECREASED BORDER RADIUS (rounded-lg) */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${shouldHideTopSections ? 'max-h-0 opacity-0' : 'max-h-[100px] opacity-100'}`}>
          <div className="px-2 py-1 bg-transparent">
            <div
            onClick={() => setIsLocationModalOpen(true)}
            className="bg-white/20 border border-white/30 text-white flex items-center justify-between px-4 py-2.5 rounded-lg text-[10.5px] font-black cursor-pointer hover:bg-white/30 shadow-md shadow-black/5 active:scale-[0.99] transition-all duration-300"
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
        </div>

        {/* Search bar row */}
        <div className="px-2 pt-1.5">
          <div className="flex items-center gap-2">
            {/* Search Input Bar (Symmetrical rounded-lg and increased height with py-2) */}
            <div className="flex-1 relative flex items-center bg-white rounded-lg px-3.5 py-2.5 focus-within:ring-2 focus-within:ring-white/50 transition-all duration-300 shadow-3xs">
              <Search className="w-4.5 h-4.5 text-slate-400 mr-2.5" />
              <input
                type="text"
                placeholder="Search products..."
                className="w-full bg-transparent text-sm text-[#02006c] outline-none placeholder-slate-400 font-semibold"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (searchQuery.trim() !== '') {
                      analytics.trackSearch(searchQuery);
                    }
                    if (window.location.pathname !== '/categories') {
                      navigate('/categories');
                    }
                  }
                }}
              />
              {/* Voice search Mic option inside input capsule */}
              <div className="flex items-center gap-2 ml-2.5">
                <Mic 
                  onClick={handleVoiceSearch}
                  className="w-4.5 h-4.5 text-slate-400 cursor-pointer hover:text-[#EE4923] transition-colors" 
                />
              </div>
            </div>

            {/* Fun Zone / Games button highlight */}
            <button 
              onClick={() => navigate('/games')}
              className="relative overflow-hidden group active:scale-95 text-white rounded-lg shadow-md transition-all duration-300 w-[42px] h-[42px] flex items-center justify-center flex-shrink-0 bg-white/20 backdrop-blur-md border border-white/40 hover:bg-white/30"
            >
              <Gamepad2 className="w-5 h-5 drop-shadow-sm" />
              {/* Little ping animation to highlight it */}
              <span className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white shadow-sm"></span>
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Delivery Address Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity duration-300">
          <div className="w-full max-w-md bg-white rounded-t-3xl p-5 shadow-2xl animate-slide-up max-h-[90vh] flex flex-col">
            {/* Drag Handle */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            
            <div className="flex items-center justify-between mb-4 flex-shrink-0">
              <h3 className="text-[17px] font-bold text-[#02006c] nunito-heading">Select delivery address</h3>
              <button
                onClick={() => setIsLocationModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="overflow-y-auto scrollbar-none pb-24 flex-grow space-y-5">
              {/* Search Bar */}
              <div className="relative flex items-center bg-white rounded-xl border border-slate-200 px-3 py-2.5 shadow-3xs focus-within:border-[#ee4923] focus-within:ring-2 focus-within:ring-orange-100 transition-all">
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
                className="flex items-center gap-3 w-full py-1 text-[#ee4923] hover:opacity-80 transition-opacity"
              >
                <Crosshair className="w-5 h-5" />
                <span className="text-sm font-bold">Use my current location</span>
              </button>

              <div className="border-t border-dashed border-slate-200 my-2" />

              {/* Saved Addresses Header */}
              <div className="flex items-center justify-between mt-2 mb-3">
                <h4 className="text-[13px] font-bold text-[#0F172A] nunito-heading">Saved addresses</h4>
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
                  className="text-[#ee4923] text-xs font-bold flex items-center gap-1 hover:underline"
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
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ee4923] focus:outline-none bg-white" 
                        placeholder="e.g. John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Pin Code <span className="text-red-500">*</span></label>
                      <input 
                        type="text" 
                        value={newAddressForm.pincode}
                        onChange={(e) => setNewAddressForm({...newAddressForm, pincode: e.target.value.replace(/[^0-9]/g, '')})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ee4923] focus:outline-none bg-white" 
                        placeholder="e.g. 452010"
                        maxLength={6}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Full Address</label>
                      <textarea 
                        value={newAddressForm.address}
                        onChange={(e) => setNewAddressForm({...newAddressForm, address: e.target.value})}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-[#ee4923] focus:outline-none bg-white min-h-[80px]" 
                        placeholder="e.g. 123 Main St, Apartment 4B..."
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        if (!newAddressForm.name || !newAddressForm.address || !newAddressForm.pincode) {
                          toast.error("Please fill in all mandatory fields, including the Pin Code.");
                          return;
                        }
                        if (!user) {
                          toast.error("Please login to save addresses.");
                          return;
                        }
                        try {
                          const token = localStorage.getItem('userToken');
                          const url = editingAddressId 
                            ? `${API_BASE}/addresses/${editingAddressId}`
                            : `${API_BASE}/addresses`;
                          const method = editingAddressId ? 'PUT' : 'POST';

                          const res = await fetch(url, {
                            method,
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify({
                              name: newAddressForm.name,
                              type: 'Home',
                              address: newAddressForm.address,
                              pincode: newAddressForm.pincode
                            })
                          });
                          const data = await res.json();
                          if (data.success) {
                            toast.success(editingAddressId ? "Address updated!" : "Address saved!");
                            // Refresh addresses
                            const updatedRes = await fetch(`${API_BASE}/addresses`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            const updatedData = await updatedRes.json();
                            if (updatedData.success) {
                              setSavedAddresses(updatedData.data.map(addr => ({
                                id: addr._id,
                                name: addr.name,
                                type: addr.type,
                                address: addr.address,
                                pincode: addr.pincode
                              })));
                            }
                            setIsAddingNewAddress(false);
                            setEditingAddressId(null);
                            setNewAddressForm({ name: '', address: '', pincode: '' });
                          } else {
                            toast.error(data.message || "Failed to save address");
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error("Failed to save address.");
                        }
                      }}
                      className="w-full bg-[#ee4923] text-white text-sm font-bold py-2.5 rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      {editingAddressId ? "Update Address" : "Save Address"}
                    </button>
                    {editingAddressId && (
                      <button
                        onClick={async () => {
                          if (!user) return;
                          if (!confirm("Are you sure you want to delete this address?")) return;
                          try {
                            const token = localStorage.getItem('userToken');
                            const res = await fetch(`${API_BASE}/addresses/${editingAddressId}`, {
                              method: 'DELETE',
                              headers: {
                                'Authorization': `Bearer ${token}`
                              }
                            });
                            const data = await res.json();
                            if (data.success) {
                              toast.success("Address deleted!");
                              setSavedAddresses(prev => prev.filter(a => a.id !== editingAddressId));
                              setIsAddingNewAddress(false);
                              setEditingAddressId(null);
                              setNewAddressForm({ name: '', address: '', pincode: '' });
                            } else {
                              toast.error(data.message || "Failed to delete address");
                            }
                          } catch (err) {
                            console.error(err);
                            toast.error("Failed to delete address");
                          }
                        }}
                        className="w-full bg-red-500 text-white text-sm font-bold py-2.5 rounded-lg hover:bg-red-600 transition-colors mt-2"
                      >
                        Delete Address
                      </button>
                    )}
                  </div>
                ) : (
                  filteredAddresses.map((addr) => {
                    // Simple mock selection logic
                    const isSelected = location === addr.address || (location === "Delhi, India" && addr.id === 1);
                    return (
                      <div key={addr.id} className="flex items-start gap-3 w-full group animate-fade-in">
                        <Home className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isSelected ? 'text-[#ee4923]' : 'text-slate-500'}`} />
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleSaveLocation(addr.address)}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[13px] font-bold text-[#0F172A]">{addr.name}</span>
                            {isSelected && (
                              <span className="bg-orange-100 text-[#ee4923] text-[9px] font-bold px-1.5 py-0.5 rounded">
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
              <h3 className="text-base font-bold text-[#02006c] nunito-heading">Notifications</h3>
              <button
                onClick={() => setIsNotificationModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-3 overflow-y-auto pb-24 scrollbar-none">
              {loadingNotifications ? (
                <div className="text-center py-8 text-slate-400 text-xs font-medium">
                  Loading notifications...
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif._id} className={`p-3 rounded-xl border ${notif.read ? 'bg-white border-slate-100' : 'bg-orange-50/50 border-orange-200'}`}>
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-bold nunito-heading ${notif.read ? 'text-slate-700' : 'text-[#02006c]'}`}>{notif.title}</h4>
                      {!notif.read && <span className="w-2 h-2 rounded-full bg-[#ee4923] flex-shrink-0 mt-1.5"></span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.body}</p>
                    <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm font-medium">
                  No notifications yet!
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

