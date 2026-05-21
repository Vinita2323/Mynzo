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
      const protectedRoutes = ['/wishlist'];
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
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
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
