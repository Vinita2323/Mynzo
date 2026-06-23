import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { CRAZY_DEALS } from '../data/mockData';
import toast from 'react-hot-toast';
import { requestFcmToken, messaging } from '../firebase';
import { onMessage } from 'firebase/messaging';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [coins, setCoins] = useState(560);
  const [location, setLocation] = useState("83 Kishan Pura Mataji Mandir, Sector 3, Mathura");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("home");
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [globalToast, setGlobalToast] = useState('');
  const [userReels, setUserReels] = useState(() => {
    const savedReels = sessionStorage.getItem('userReels');
    return savedReels ? JSON.parse(savedReels) : [];
  });
  const [orderReviews, setOrderReviews] = useState({});
  const [user, setUser] = useState(() => {
    const loggedIn = localStorage.getItem('isLoggedIn');
    const userInfo = localStorage.getItem('userInfo');
    if (loggedIn === 'true' && userInfo) {
      try {
        const info = JSON.parse(userInfo);
        return {
          id: info._id || info.id || null,
          name: info.name || 'User',
          phone: info.phone || '',
          email: info.email || null,
          gender: info.gender || null,
          dob: info.dob || null,
          joined: info.joinedAt
            ? `Member since ${new Date(info.joinedAt).toLocaleString('default', { month: 'long', year: 'numeric' })}`
            : 'Member since May 2026'
        };
      } catch { /* ignore */ }
    }
    if (loggedIn === 'true') {
      return {
        name: 'Vini',
        email: 'vini@mynzoworld.com',
        tier: 'Gold Tier Gifter',
        joined: 'Member since May 2026'
      };
    }
    return null;
  });

  const socketRef = useRef(null);
  const [isForceLoggedOut, setIsForceLoggedOut] = useState(() => {
    return localStorage.getItem('forceLogoutState') === 'true';
  });
  
  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const triggerForceLogoutUI = async () => {
    // Clear tokens immediately in background
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('fcmToken');
    localStorage.removeItem('isLoggedIn');
    setUser(null);
    // Show undismissable modal and persist it across reloads
    localStorage.setItem('forceLogoutState', 'true');
    setIsForceLoggedOut(true);
  };

  const logout = async () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('fcmToken');
    localStorage.removeItem('isLoggedIn');
    setUser(null);

    try {
      const token = localStorage.getItem('fcmToken');
      const userToken = localStorage.getItem('userToken');
      if (token && userToken) {
        await fetch(`${API_BASE}/auth/fcm-token`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ token, platform: 'web' })
        });
      }
    } catch (err) {
      console.error('Error deleting FCM token:', err);
    }
  };

  useEffect(() => {
    const registerFcm = async () => {
      if (user && user.id) {
        try {
          const token = await requestFcmToken();
          if (token) {
            localStorage.setItem('fcmToken', token);
            const userToken = localStorage.getItem('userToken');
            if (userToken) {
              await fetch(`${API_BASE}/auth/fcm-token`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ token, platform: 'web' })
              });
            }
          }
        } catch (err) {
          console.error('Error during FCM registration:', err);
        }
      }
    };
    registerFcm();
  }, [user]);

  useEffect(() => {
    if (user && user.id && messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Foreground message received:', payload);
        
        if (payload.data?.type === 'FORCE_LOGOUT') {
          triggerForceLogoutUI();
          return;
        }

        const title = payload.notification?.title || 'Notification';
        const body = payload.notification?.body || '';
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-[#02006c]">{title}</span>
            <span className="text-xs text-slate-600">{body}</span>
          </div>
        ), {
          icon: '🔔',
          duration: 6000
        });
      });

      const handleSwMessage = (event) => {
        if (event.data?.type === 'FORCE_LOGOUT') {
          triggerForceLogoutUI();
        }
      };

      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', handleSwMessage);
      }

      return () => {
        unsubscribe();
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.removeEventListener('message', handleSwMessage);
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (user && user.id) {
      const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const socketUrl = apiBase.replace('/api', '');
      const token = localStorage.getItem('userToken');
      const socket = io(socketUrl, {
        auth: {
          token: token
        }
      });
      socketRef.current = socket;

      socket.emit('join', user.id);
      socket.emit('get_wishlist');

      socket.on('wishlist_data', (products) => {
        const normalised = products.map((p) => ({
          id: p._id || p.id,
          name: p.name,
          desc: p.description || '',
          price: p.sellingPrice,
          originalPrice: p.mrp || p.sellingPrice,
          discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
          rating: p.rating || 0,
          type: (p.category || '').toLowerCase(),
          image: p.images && p.images[0] ? p.images[0] : '',
          brandName: p.brandName || 'Mynzo Originals',
          sales: p.sales || 0
        }));
        setWishlist(normalised);
      });

      socket.on('like_status', ({ productId, isLiked, product }) => {
        if (isLiked && product) {
          setWishlist((prev) => {
            const exists = prev.some((item) => item.id === productId);
            if (exists) return prev;
            
            const normalised = {
              id: product._id || product.id,
              name: product.name,
              desc: product.description || '',
              price: product.sellingPrice,
              originalPrice: product.mrp || product.sellingPrice,
              discount: product.discountLabel || (product.mrp ? `-${Math.round((1 - product.sellingPrice / product.mrp) * 100)}%` : '0%'),
              rating: product.rating || 0,
              type: (product.category || '').toLowerCase(),
              image: product.images && product.images[0] ? product.images[0] : '',
              brandName: product.brandName || 'Mynzo Originals',
              sales: product.sales || 0
            };
            return [...prev, normalised];
          });
        } else {
          setWishlist((prev) => prev.filter((item) => item.id !== productId));
        }
      });
//
      return () => {
        socket.disconnect();
        socketRef.current = null;
      };
    } else {
      setWishlist([]);
    }
  }, [user]);


  const prevUserRef = useRef(null);

  useEffect(() => {
    const syncAndFetchCart = async () => {
      // Merge guest cart to DB if user just logged in
      if (user && user.id && !prevUserRef.current) {
        const token = localStorage.getItem('userToken');
        if (token && cart.length > 0) {
          try {
            await Promise.all(cart.map(item =>
              fetch(`${API_BASE}/cart`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId: item.id, quantity: item.quantity })
              })
            ));
          } catch (syncErr) {
            console.error("Error merging guest cart on login:", syncErr);
          }
        }
      }
      prevUserRef.current = user;

      if (!user || !user.id) {
        return;
      }
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        const res = await fetch(`${API_BASE}/cart`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          triggerForceLogoutUI();
          return;
        }
        const data = await res.json();
        if (data.success && data.data && data.data.items) {
          const mapped = data.data.items.map(item => {
            const p = item.productId;
            if (!p) return null;
            return {
              id: p._id || p.id,
              name: p.name,
              desc: p.description || '',
              price: p.sellingPrice,
              originalPrice: p.mrp || p.sellingPrice,
              discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
              rating: p.rating || 0,
              type: (p.category || '').toLowerCase(),
              image: p.images && p.images[0] ? p.images[0] : '',
              brandName: p.brandName || 'Mynzo Originals',
              sales: p.sales || 0,
              quantity: item.quantity,
              weight: p.shippingSpecs?.weight || 0.5
            };
          }).filter(Boolean);
          setCart(mapped);
        }
      } catch (err) {
        console.error("Error fetching cart from DB:", err);
      }
    };

    syncAndFetchCart();
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !user.id) {
        setOrders([]);
        return;
      }
      try {
        const token = localStorage.getItem('userToken');
        if (!token) return;
        const res = await fetch(`${API_BASE}/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.status === 401) {
          triggerForceLogoutUI();
          return;
        }
        const data = await res.json();
        if (data.success && data.orders) {
          const mappedOrders = data.orders.map(o => ({
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
            deliveryAddress: o.deliveryAddress,
            deliveryCharge: o.deliveryCharge,
            etd: o.etd
          }));
          setOrders(mappedOrders);
        }
      } catch (err) {
        console.error("Error fetching orders from DB:", err);
      }
    };
    fetchOrders();
  }, [user]);

  // Address functions
  const fetchAddresses = async () => {
    if (!user || !user.id) {
      setAddresses([]);
      return;
    }
    try {
      setAddressesLoading(true);
      const token = localStorage.getItem('userToken');
      if (!token) return;
      const res = await fetch(`${API_BASE}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        triggerForceLogoutUI();
        return;
      }
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(data.data);
      }
    } catch (err) {
      console.error('Error fetching addresses:', err);
    } finally {
      setAddressesLoading(false);
    }
  };

  const addAddress = async (addressData) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(prev => [data.data, ...prev]);
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Error adding address:', err);
      return { success: false, message: 'Network error' };
    }
  };

  const updateAddress = async (id, addressData) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/addresses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAddresses(prev => prev.map(a => a._id === id ? data.data : a));
        return { success: true, data: data.data };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Error updating address:', err);
      return { success: false, message: 'Network error' };
    }
  };

  const deleteAddress = async (id) => {
    try {
      const token = localStorage.getItem('userToken');
      const res = await fetch(`${API_BASE}/addresses/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(prev => prev.filter(a => a._id !== id));
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      console.error('Error deleting address:', err);
      return { success: false, message: 'Network error' };
    }
  };

  useEffect(() => {
    if (user && user.id) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [user]);

  // Game Modals State
  const [activeGame, setActiveGame] = useState(null); // 'spin' | 'quiz' | 'scratch' | 'treasure' | null

  // Cart helper functions
  const addToCart = async (product) => {
    if (user && user.id) {
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_BASE}/cart`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId: product.id, quantity: 1 })
        });
        const data = await res.json();
        if (data.success && data.data && data.data.items) {
          const mapped = data.data.items.map(item => {
            const p = item.productId;
            if (!p) return null;
            return {
              id: p._id || p.id,
              name: p.name,
              desc: p.description || '',
              price: p.sellingPrice,
              originalPrice: p.mrp || p.sellingPrice,
              discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
              rating: p.rating || 0,
              type: (p.category || '').toLowerCase(),
              image: p.images && p.images[0] ? p.images[0] : '',
              brandName: p.brandName || 'Mynzo Originals',
              sales: p.sales || 0,
              quantity: item.quantity,
              weight: p.shippingSpecs?.weight || 0.5
            };
          }).filter(Boolean);
          setCart(mapped);
        }
      } catch (err) {
        console.error("Error adding to cart:", err);
      }
    } else {
      setCart((prevCart) => {
        const existingItem = prevCart.find((item) => item.id === product.id);
        if (existingItem) {
          return prevCart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [...prevCart, { ...product, quantity: 1, weight: product.shippingSpecs?.weight || 0.5 }];
      });
    }
  };

  const removeFromCart = async (productId) => {
    if (user && user.id) {
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_BASE}/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (data.success && data.data && data.data.items) {
          const mapped = data.data.items.map(item => {
            const p = item.productId;
            if (!p) return null;
            return {
              id: p._id || p.id,
              name: p.name,
              desc: p.description || '',
              price: p.sellingPrice,
              originalPrice: p.mrp || p.sellingPrice,
              discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
              rating: p.rating || 0,
              type: (p.category || '').toLowerCase(),
              image: p.images && p.images[0] ? p.images[0] : '',
              brandName: p.brandName || 'Mynzo Originals',
              sales: p.sales || 0,
              quantity: item.quantity,
              weight: p.shippingSpecs?.weight || 0.5
            };
          }).filter(Boolean);
          setCart(mapped);
        }
      } catch (err) {
        console.error("Error removing from cart:", err);
      }
    } else {
      setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
    }
  };

  const updateQuantity = async (productId, qty) => {
    if (user && user.id) {
      try {
        const token = localStorage.getItem('userToken');
        const res = await fetch(`${API_BASE}/cart`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId, quantity: qty })
        });
        const data = await res.json();
        if (data.success && data.data && data.data.items) {
          const mapped = data.data.items.map(item => {
            const p = item.productId;
            if (!p) return null;
            return {
              id: p._id || p.id,
              name: p.name,
              desc: p.description || '',
              price: p.sellingPrice,
              originalPrice: p.mrp || p.sellingPrice,
              discount: p.discountLabel || (p.mrp ? `-${Math.round((1 - p.sellingPrice / p.mrp) * 100)}%` : '0%'),
              rating: p.rating || 0,
              type: (p.category || '').toLowerCase(),
              image: p.images && p.images[0] ? p.images[0] : '',
              brandName: p.brandName || 'Mynzo Originals',
              sales: p.sales || 0,
              quantity: item.quantity,
              weight: p.shippingSpecs?.weight || 0.5
            };
          }).filter(Boolean);
          setCart(mapped);
        }
      } catch (err) {
        console.error("Error updating cart quantity:", err);
      }
    } else {
      setCart((prevCart) =>
        prevCart
          .map((item) => {
            if (item.id === productId) {
              return { ...item, quantity: qty };
            }
            return item;
          })
          .filter((item) => item.quantity > 0)
      );
    }
  };

  const clearCart = async () => {
    if (user && user.id) {
      try {
        const token = localStorage.getItem('userToken');
        await fetch(`${API_BASE}/cart`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCart([]);
      } catch (err) {
        console.error("Error clearing cart:", err);
      }
    } else {
      setCart([]);
    }
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const addCoins = (amount) => {
    setCoins((prev) => prev + amount);
  };

  const toggleWishlist = (product) => {
    if (!user || !user.id) {
      toast.error('Please log in first!');
      return;
    }
    if (socketRef.current) {
      socketRef.current.emit('toggle_like', { userId: user.id, productId: product.id });
    } else {
      toast.error('Real-time connection is offline. Please retry.');
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.id === productId);
  };

  const addOrder = (order) => {
    setOrders((prev) => [order, ...prev]);
  };

  const addStudioPost = (post) => {
    setUserReels((prev) => {
      const updated = [post, ...prev];
      sessionStorage.setItem('userReels', JSON.stringify(updated));
      return updated;
    });
  };

  const addOrderReview = (orderId, review) => {
    setOrderReviews((prev) => ({
      ...prev,
      [orderId]: review
    }));
  };

  const getOrderReview = (orderId) => {
    return orderReviews[orderId] || null;
  };

  return (
    <AppContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCartItems,
        totalCartPrice,
        coins,
        addCoins,
        wishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        addOrder,
        location,
        setLocation,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        isLocationModalOpen,
        setIsLocationModalOpen,
        activeGame,
        setActiveGame,
        globalToast,
        setGlobalToast,
        userReels,
        addStudioPost,
        orderReviews,
        addOrderReview,
        getOrderReview,
        user,
        setUser,
        logout,
        addresses,
        addressesLoading,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        socketRef
      }}
    >
      {children}
      {isForceLoggedOut && (
        <div className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl flex flex-col items-center text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">Session Expired</h2>
            <p className="text-sm text-slate-500 mb-8 font-medium">
              Your account has been logged out by the administrator for security reasons.
            </p>
            <button 
              onClick={() => {
                localStorage.removeItem('forceLogoutState');
                setIsForceLoggedOut(false);
                window.location.href = '/login';
              }}
              className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-200"
            >
              LOGOUT NOW
            </button>
          </div>
        </div>
      )}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
