import React from 'react';
import { Home, LayoutGrid, Camera, Gamepad2, ShoppingCart, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export default function MobileNav() {
  const { totalCartItems, user } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path.startsWith('/categories')) return 'categories';
    if (path.startsWith('/studio')) return 'studio';
    if (path.startsWith('/games')) return 'games';
    if (path.startsWith('/cart')) return 'cart';
    if (path.startsWith('/profile') || path.startsWith('/login')) return 'profile';
    return 'home';
  };

  const activeTab = getActiveTab();

  const navItems = [
    { id: 'home', label: 'Home', icon: Home, path: '/' },
    { id: 'categories', label: 'Categories', icon: LayoutGrid, path: '/categories' },
    { id: 'games', label: 'Fun', icon: Gamepad2, path: '/games' },
    { id: 'studio', label: 'Studio', icon: Camera, path: '/studio' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/cart', badge: true },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 z-50 w-full bg-white/90 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.08)] border-t border-white/60 rounded-t-[2rem]">
      <nav className="flex items-center justify-between px-2 py-2.5 w-full mx-auto pb-safe">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-col items-center justify-center flex-1 max-w-[64px] h-[54px] rounded-2xl outline-none focus:outline-none [-webkit-tap-highlight-color:transparent] transition-all duration-500 ease-out active:scale-95 ${
                isActive 
                  ? 'bg-[#d8421b]/35 backdrop-blur-md border border-white/80 shadow-[0_4px_15px_rgba(216,66,27,0.25)]' 
                  : 'bg-transparent border border-transparent'
              }`}
            >
              <div className={`transition-all duration-500 ${
                isActive 
                  ? 'text-[#d8421b] -translate-y-0.5 scale-110' 
                  : 'text-[#64748B] hover:text-[#0F172A]'
              }`}>
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
              </div>

              <span className={`text-[10px] tracking-wide transition-all duration-500 ${
                isActive 
                  ? 'text-[#d8421b] font-bold mt-0.5' 
                  : 'text-[#64748B] font-medium mt-1'
              }`}>
                {item.label}
              </span>

              {/* Red Badge for Cart */}
              {item.badge && totalCartItems > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-[16px] w-[16px] items-center justify-center rounded-full bg-[#d8421b] text-[9px] font-bold text-white ring-2 ring-white shadow-sm">
                  {totalCartItems}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

