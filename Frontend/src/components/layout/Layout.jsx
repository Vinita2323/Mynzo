import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';
import { useApp } from '../../context/AppContext';
import { useDeviceType } from '../../utils/useDeviceType';

export default function Layout({ children }) {
  const location = useLocation();
  const { globalToast } = useApp();
  const { isMobile } = useDeviceType();

  // Detect when mobile virtual keyboard is open (viewport height shrinks)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  useEffect(() => {
    const checkKeyboard = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        // If viewport is more than 150px shorter than window, keyboard is open
        setIsKeyboardOpen(windowHeight - viewportHeight > 150);
      }
    };
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboard);
      return () => window.visualViewport.removeEventListener('resize', checkKeyboard);
    }
  }, []);

  // Disable browser native scroll restoration so back/forward never restores old position
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  // NOTE: scroll-to-top is handled via key={location.pathname} on <main> below,
  // which forces React to unmount+remount the scroll container on every route change.

  const isLoginPage = location.pathname.toLowerCase().startsWith('/login');
  
  // Mobile-specific visibility logic
  const hideNavbarMobile = isLoginPage || 
                           location.pathname.toLowerCase().startsWith('/studio') ||
                           location.pathname.toLowerCase().startsWith('/profile') || 
                           location.pathname.toLowerCase().startsWith('/categories') || 
                           location.pathname.toLowerCase().startsWith('/wishlist') ||
                           location.pathname.toLowerCase().startsWith('/orders') ||
                           location.pathname.toLowerCase().startsWith('/cart') ||
                           location.pathname.toLowerCase().startsWith('/games') ||
                           location.pathname.toLowerCase().startsWith('/crazy-deals') ||
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

  const hideMobileNavMobile = isLoginPage || 
                              location.pathname.toLowerCase().startsWith('/studio') || 
                              location.pathname.toLowerCase().startsWith('/profile') || 
                              location.pathname.toLowerCase().startsWith('/review-order') || 
                              location.pathname.toLowerCase().startsWith('/product') || 
                              location.pathname.toLowerCase().startsWith('/account') || 
                              location.pathname.toLowerCase().startsWith('/security') || 
                              location.pathname.toLowerCase().startsWith('/settings') || 
                              location.pathname.toLowerCase().startsWith('/wallet') || 
                              location.pathname.toLowerCase().startsWith('/coupons') || 
                              location.pathname.toLowerCase().startsWith('/refer') || 
                              location.pathname.toLowerCase().startsWith('/track-order') || 
                              location.pathname.toLowerCase().startsWith('/order-details') || 
                              location.pathname.toLowerCase().startsWith('/saved-addresses') || 
                              location.pathname.toLowerCase().startsWith('/cart') || 
                              location.pathname.toLowerCase().startsWith('/support') || 
                              location.pathname.toLowerCase().startsWith('/privacy');

  // Desktop/Tablet overrides:
  // - Show Top Navbar on all pages except login
  // - Hide Bottom MobileNav on all pages
  const isStudioPage = location.pathname.toLowerCase().startsWith('/studio');
  const hideNavbar = isMobile ? hideNavbarMobile : (isLoginPage || isStudioPage);
  const hideMobileNav = isMobile ? hideMobileNavMobile : true;

  const isFixedLayoutPage = location.pathname.toLowerCase().startsWith('/studio') || location.pathname.toLowerCase().startsWith('/categories');

  return (
    <div className="min-h-screen md:h-auto bg-slate-100 md:bg-slate-50 flex justify-center md:block items-start text-slate-800 antialiased font-sans overflow-x-hidden">
      {/* Centered Mobile Phone Frame on mobile, full width on desktop */}
      <div className={`w-full max-w-md md:max-w-none ${isFixedLayoutPage ? 'h-[100dvh] md:h-[100dvh]' : 'h-[100dvh] md:h-auto md:min-h-screen'} bg-white md:bg-transparent shadow-2xl md:shadow-none flex flex-col relative ${(hideMobileNav || isKeyboardOpen) ? 'pb-0' : 'pb-16 md:pb-0'}`}>
        <main 
          key={location.pathname}
          id="main-scroll-container" 
          className={`flex-grow flex flex-col bg-white md:bg-transparent relative scrollbar-none ${isFixedLayoutPage ? 'overflow-hidden' : 'overflow-y-auto md:overflow-y-visible overflow-x-hidden'}`}
        >
          {!hideNavbar && <Navbar />}
          {children}
        </main>
        {!hideMobileNav && !isKeyboardOpen && <MobileNav />}

        {/* Global Toast Message */}
        {globalToast && (
          <div className="absolute bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[11px] font-bold px-4 py-2 rounded-full shadow-lg z-[100] animate-fade-in whitespace-nowrap">
            {globalToast}
          </div>
        )}
      </div>
    </div>
  );
}
