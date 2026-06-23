import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useApp } from '../../context/AppContext';

export default function Layout({ children }) {
  const location = useLocation();
  const { globalToast } = useApp();

  React.useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTop = 0;
    }
  }, [location.pathname]);

  const isLoginPage = location.pathname.toLowerCase().startsWith('/login');
  const hideNavbar = isLoginPage || 
                     location.pathname.toLowerCase().startsWith('/studio') ||
                     location.pathname.toLowerCase().startsWith('/profile') || 
                     location.pathname.toLowerCase().startsWith('/categories') || 
                     location.pathname.toLowerCase().startsWith('/wishlist') ||
                     location.pathname.toLowerCase().startsWith('/orders') ||
                     location.pathname.toLowerCase().startsWith('/cart') ||
                     location.pathname.toLowerCase().startsWith('/games') ||
                     location.pathname.toLowerCase().startsWith('/crazy-deals') ||
                     location.pathname.toLowerCase().startsWith('/checkout') ||
                     location.pathname.toLowerCase().startsWith('/product') ||
                     location.pathname.toLowerCase().startsWith('/similar-products') ||
                     location.pathname.toLowerCase().startsWith('/top-selection') ||
                     location.pathname.toLowerCase().startsWith('/help') ||
                     location.pathname.toLowerCase().startsWith('/support') ||
                     location.pathname.toLowerCase().startsWith('/privacy') ||
                     location.pathname.toLowerCase().startsWith('/account') ||
                     location.pathname.toLowerCase().startsWith('/security') ||
                     location.pathname.toLowerCase().startsWith('/settings') ||
                     location.pathname.toLowerCase().startsWith('/wallet') ||
                     location.pathname.toLowerCase().startsWith('/coupons') ||
                     location.pathname.toLowerCase().startsWith('/refer') ||
                     location.pathname.toLowerCase().startsWith('/track-order') ||
                     location.pathname.toLowerCase().startsWith('/order-details') ||
                     location.pathname.toLowerCase().startsWith('/saved-addresses') ||
                     location.pathname.toLowerCase().startsWith('/review-order');

  const hideMobileNav = isLoginPage || location.pathname.toLowerCase().startsWith('/studio') || location.pathname.toLowerCase().startsWith('/profile') || location.pathname.toLowerCase().startsWith('/checkout') || location.pathname.toLowerCase().startsWith('/review-order') || location.pathname.toLowerCase().startsWith('/product') || location.pathname.toLowerCase().startsWith('/account') || location.pathname.toLowerCase().startsWith('/security') || location.pathname.toLowerCase().startsWith('/settings') || location.pathname.toLowerCase().startsWith('/wallet') || location.pathname.toLowerCase().startsWith('/coupons') || location.pathname.toLowerCase().startsWith('/refer') || location.pathname.toLowerCase().startsWith('/track-order') || location.pathname.toLowerCase().startsWith('/order-details') || location.pathname.toLowerCase().startsWith('/saved-addresses') || location.pathname.toLowerCase().startsWith('/cart') || location.pathname.toLowerCase().startsWith('/support') || location.pathname.toLowerCase().startsWith('/privacy');

  const isStudio = location.pathname.toLowerCase().startsWith('/studio');

  return (
    <div className="h-[100dvh] bg-slate-100 flex justify-center items-start text-slate-800 antialiased font-sans overflow-hidden">
      {/* Centered Mobile Phone Frame */}
      <div className={`w-full max-w-md h-full bg-white shadow-2xl flex flex-col relative ${hideMobileNav ? 'pb-0' : 'pb-16'}`}>
        <main 
          id="main-scroll-container" 
          className={`flex-grow flex flex-col bg-white relative scrollbar-none ${isStudio ? 'overflow-hidden' : 'overflow-y-auto overflow-x-hidden'}`}
        >
          {!hideNavbar && <Navbar />}
          {children}
        </main>
        {!hideMobileNav && <MobileNav />}

        {/* Global Toast Message */}
        {globalToast && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg z-[100] animate-fade-in whitespace-nowrap">
            {globalToast}
          </div>
        )}
      </div>
    </div>
  );
}
