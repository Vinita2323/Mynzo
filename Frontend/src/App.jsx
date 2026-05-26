import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';

// Pages
import Home from './pages/Home';
import CategoriesPage from './pages/CategoriesPage';
import StudioPage from './pages/StudioPage';
import GamesPage from './pages/GamesPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import WishlistPage from './pages/WishlistPage';
import OrdersPage from './pages/OrdersPage';
import CrazyDealsPage from './pages/CrazyDealsPage';
import CheckoutPage from './pages/CheckoutPage';
import ReviewOrderPage from './pages/ReviewOrderPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import TopSelectionPage from './pages/TopSelectionPage';
import SimilarProductsPage from './pages/SimilarProductsPage';
import HelpSupportPage from './pages/HelpSupportPage';
import AccountInfoPage from './pages/AccountInfoPage';
import SecurityPage from './pages/SecurityPage';
import SettingsPage from './pages/SettingsPage';
import WalletPage from './pages/WalletPage';
import CouponsPage from './pages/CouponsPage';
import ReferEarnPage from './pages/ReferEarnPage';
import SavedAddressesPage from './pages/SavedAddressesPage';
import TrackOrderPage from './pages/TrackOrderPage';
import OrderDetailsPage from './pages/OrderDetailsPage';

import './App.css';

function AppContent() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Show splash screen video on initial app load/open
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashEnd = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    if (showSplash) {
      // 5.5s safety timer to proceed even if video playback issues occur
      const timer = setTimeout(() => {
        handleSplashEnd();
      }, 5500);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  useEffect(() => {
    // Once splash screen video completes, run hierarchical route matching
    if (!showSplash) {
      const protectedRoutes = ['/wishlist', '/orders'];
      const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

      if (!user && isProtectedRoute) {
        navigate('/login');
      } else if (user && location.pathname === '/login') {
        navigate('/');
      }
    }
  }, [showSplash, user, location.pathname, navigate]);

  if (showSplash) {
    return (
      <div className="h-[100dvh] bg-slate-100 flex justify-center items-start text-slate-800 antialiased font-sans select-none pointer-events-none overflow-hidden">
        {/* Centered Mobile Phone Frame */}
        <div className="w-full max-w-md h-full bg-black relative flex items-center justify-center overflow-hidden shadow-2xl border-x border-slate-100">
          <video
            src="/SplashScreen.mp4"
            autoPlay
            muted
            playsInline
            webkit-playsinline="true"
            preload="auto"
            disablePictureInPicture
            controlsList="nodownload nofullscreen noremoteplayback"
            onEnded={handleSplashEnd}
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-full object-cover pointer-events-none select-none"
          />
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/studio" element={<StudioPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/crazy-deals" element={<CrazyDealsPage />} />
        <Route path="/review-order" element={<ReviewOrderPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/similar-products" element={<SimilarProductsPage />} />
        <Route path="/top-selection" element={<TopSelectionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/account" element={<AccountInfoPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/coupons" element={<CouponsPage />} />
        <Route path="/refer" element={<ReferEarnPage />} />
        <Route path="/saved-addresses" element={<SavedAddressesPage />} />
        <Route path="/track-order/:orderId" element={<TrackOrderPage />} />
        <Route path="/order-details/:orderId" element={<OrderDetailsPage />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
