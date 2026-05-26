import React, { createContext, useState, useContext, useEffect } from 'react';
import { CRAZY_DEALS } from '../data/mockData';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [cart, setCart] = useState([
    { ...CRAZY_DEALS[0], quantity: 1 },
    { ...CRAZY_DEALS[2], quantity: 2 },
  ]);
  const [wishlist, setWishlist] = useState([
    { ...CRAZY_DEALS[1] },
    { ...CRAZY_DEALS[3] }
  ]);
  const [orders, setOrders] = useState([]);
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
    const loggedIn = sessionStorage.getItem('isLoggedIn');
    if (loggedIn === 'true') {
      return {
        name: "Vini",
        email: "vini@mynzoworld.com",
        tier: "Gold Tier Gifter",
        joined: "Member since May 2026"
      };
    }
    return null;
  });
  
  // Game Modals State
  const [activeGame, setActiveGame] = useState(null); // 'spin' | 'quiz' | 'scratch' | 'treasure' | null

  // Cart helper functions
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === productId) {
            const newQty = item.quantity + amount;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);
  const totalCartPrice = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const addCoins = (amount) => {
    setCoins((prev) => prev + amount);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        return prev.filter((item) => item.id !== product.id);
      }
      setGlobalToast('your items is added on wishlist');
      setTimeout(() => setGlobalToast(''), 2500);
      return [...prev, product];
    });
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
      }}
    >
      {children}
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
