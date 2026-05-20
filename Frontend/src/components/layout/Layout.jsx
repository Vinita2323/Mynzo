import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import MobileNav from './MobileNav';

export default function Layout({ children }) {
  const location = useLocation();
  const isLoginPage = location.pathname.toLowerCase().startsWith('/login');
  const hideNavbar = isLoginPage || 
                     location.pathname.toLowerCase().startsWith('/profile') || 
                     location.pathname.toLowerCase().startsWith('/categories') || 
                     location.pathname.toLowerCase().startsWith('/wishlist') ||
                     location.pathname.toLowerCase().startsWith('/cart');

  const hideMobileNav = isLoginPage || location.pathname.toLowerCase().startsWith('/profile');

  return (
    <div className="h-[100dvh] bg-slate-100 flex justify-center items-start text-slate-800 antialiased font-sans overflow-hidden">
      {/* Centered Mobile Phone Frame */}
      <div className={`w-full max-w-md h-full bg-white shadow-2xl flex flex-col relative border-x border-slate-100 ${hideMobileNav ? 'pb-0' : 'pb-16'}`}>
        {!hideNavbar && <Navbar />}
        <main className="flex-grow flex flex-col bg-white overflow-y-auto overflow-x-hidden">
          {children}
        </main>
        {!hideMobileNav && <MobileNav />}
      </div>
    </div>
  );
}
