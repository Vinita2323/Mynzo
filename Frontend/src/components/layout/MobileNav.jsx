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
    { id: 'games', label: 'Toys', icon: Gamepad2, path: '/games' },
    { id: 'studio', label: 'Studio', icon: Camera, path: '/studio' },
    { id: 'cart', label: 'Cart', icon: ShoppingCart, path: '/cart', badge: true },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-3 py-1 shadow-2xl flex items-center justify-between max-w-md mx-auto">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => {
              if (item.id === 'profile' && !user) {
                navigate('/login');
              } else {
                navigate(item.path);
              }
            }}
            className="relative flex flex-col items-center justify-center py-1.5 px-1 min-w-[50px] transition-all duration-300 active:scale-90"
          >
            {/* Active Highlight Underlay */}
            {isActive && (
              <span className="absolute inset-x-2 top-0 h-1 bg-[#FF6E54] rounded-full animate-fade-in"></span>
            )}

            <div className={`p-1 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-[#FF6E54] scale-110' 
                : 'text-slate-400 hover:text-slate-600'
            }`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>

            <span className={`text-[10px] font-bold tracking-tight transition-all duration-300 ${
              isActive 
                ? 'text-[#FF6E54] font-extrabold' 
                : 'text-slate-400'
            }`}>
              {item.label}
            </span>

            {/* Red Badge for Cart */}
            {item.badge && totalCartItems > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-extrabold text-white ring-1 ring-white animate-bounce">
                {totalCartItems}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

