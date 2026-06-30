import React, { useState, useEffect, lazy, Suspense } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/layout/Layout';

// Lazy-loaded pages — each becomes its own JS chunk (code splitting)
const Home               = lazy(() => import('./pages/Home'));
const CategoriesPage     = lazy(() => import('./pages/CategoriesPage'));
const StudioPage         = lazy(() => import('./pages/StudioPage'));
const GamesPage          = lazy(() => import('./pages/GamesPage'));
const CartPage           = lazy(() => import('./pages/CartPage'));
const ProfilePage        = lazy(() => import('./pages/ProfilePage'));
const LoginPage          = lazy(() => import('./pages/LoginPage'));
const WishlistPage       = lazy(() => import('./pages/WishlistPage'));
const OrdersPage         = lazy(() => import('./pages/OrdersPage'));
const CrazyDealsPage     = lazy(() => import('./pages/CrazyDealsPage'));
const ReviewOrderPage    = lazy(() => import('./pages/ReviewOrderPage'));
const ProductDetailsPage = lazy(() => import('./pages/ProductDetailsPage'));
const TopSelectionPage   = lazy(() => import('./pages/TopSelectionPage'));
const SimilarProductsPage= lazy(() => import('./pages/SimilarProductsPage'));
const HelpSupportPage    = lazy(() => import('./pages/HelpSupportPage'));
const PrivacyPage        = lazy(() => import('./pages/PrivacyPage'));
const TermsPage          = lazy(() => import('./pages/TermsPage'));
const AccountInfoPage    = lazy(() => import('./pages/AccountInfoPage'));
const SecurityPage       = lazy(() => import('./pages/SecurityPage'));
const SettingsPage       = lazy(() => import('./pages/SettingsPage'));
const WalletPage         = lazy(() => import('./pages/WalletPage'));
const CouponsPage        = lazy(() => import('./pages/CouponsPage'));
const ReferEarnPage      = lazy(() => import('./pages/ReferEarnPage'));
const SavedAddressesPage = lazy(() => import('./pages/SavedAddressesPage'));
const TrackOrderPage     = lazy(() => import('./pages/TrackOrderPage'));
const OrderDetailsPage   = lazy(() => import('./pages/OrderDetailsPage'));

// Minimal route-level loading skeleton (shown while a page chunk loads)
const PageSkeleton = () => (
  <div className="flex-grow flex items-center justify-center min-h-[60vh]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 rounded-full border-4 border-orange-100 border-t-[#ee4923] animate-spin" />
      <p className="text-[11px] text-slate-400 font-medium">Loading…</p>
    </div>
  </div>
);

import './App.css';
import analytics from './utils/analytics';


function AppContent() {
  const { user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize analytics on app mount
  useEffect(() => {
    analytics.init();
  }, []);

  // Track page views on route changes
  useEffect(() => {
    analytics.track('page_view', 'engagement', {
      path: location.pathname,
      search: location.search
    });
  }, [location.pathname, location.search]);

  // Only show splash screen when landing on the root path '/'.
  // If the user opens a direct link (e.g. /support), skip it immediately.
  const isPrivacyOrSupport = /privacy|terms|support/i.test(window.location.hash);
  const isRootPath = window.location.pathname === '/' && !isPrivacyOrSupport;
  const [showSplash, setShowSplash] = useState(isRootPath);
  const [isFading, setIsFading] = useState(false);

  const handleSplashEnd = () => {
    setIsFading(true);
    setTimeout(() => {
      setShowSplash(false);
    }, 500); // 500ms fade out transition
  };

  useEffect(() => {
    if (showSplash && !isFading) {
      // 12s safety timer to proceed even if video playback issues occur
      const timer = setTimeout(() => {
        handleSplashEnd();
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [showSplash, isFading]);

  useEffect(() => {
    // Once splash screen video completes, run hierarchical route matching
    if (!showSplash) {
      const protectedRoutes = ['/cart', '/wishlist', '/orders', '/games', '/refer', '/saved-addresses', '/wallet'];
      const isProtectedRoute = protectedRoutes.some(route => location.pathname.startsWith(route));

      if (!user && isProtectedRoute) {
        navigate('/login');
      } else if (user && location.pathname === '/login') {
        navigate('/');
      }
    }
  }, [showSplash, user, location.pathname, navigate]);

  return (
    <>
      {showSplash && (
        <div 
          className={`fixed inset-0 z-[9999] h-[100dvh] bg-slate-100 flex justify-center items-start text-slate-800 antialiased font-sans select-none pointer-events-none overflow-hidden transition-opacity duration-500 ease-in-out ${isFading ? 'opacity-0' : 'opacity-100'}`}
        >
          {/* Centered Mobile Phone Frame */}
          <div className="w-full max-w-md h-full bg-white relative flex items-center justify-center overflow-hidden shadow-2xl border-x border-slate-100">
            <video
              src="/FinalSpalshScreen.mp4"
              autoPlay
              muted
              playsInline
              webkit-playsinline="true"
              preload="auto"
              disablePictureInPicture
              controlsList="nodownload nofullscreen noremoteplayback"
              onEnded={handleSplashEnd}
              onContextMenu={(e) => e.preventDefault()}
              style={{ objectFit: 'cover', objectPosition: '40% center' }}
              className="absolute inset-0 w-full h-full origin-center pointer-events-none select-none"
            />
          </div>
        </div>
      )}
      
      <Toaster position="bottom-center" toastOptions={{ duration: 3000 }} />
      <Layout>
      <Suspense fallback={<PageSkeleton />}>
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
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/similar-products" element={<SimilarProductsPage />} />
        <Route path="/top-selection" element={<TopSelectionPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/help" element={<HelpSupportPage />} />
        <Route path="/support" element={<HelpSupportPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
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
      </Suspense>
    </Layout>
    </>
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
