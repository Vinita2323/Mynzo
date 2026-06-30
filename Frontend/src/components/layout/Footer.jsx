import React from 'react';
import { Gift, ShieldCheck, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#0F172A] text-slate-400 py-10 px-6 mt-10 border-t border-slate-800 text-sm mb-16">
      <div className="max-w-md mx-auto space-y-8">
        {/* Brand Block */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#ee4923] rounded-full flex items-center justify-center text-white">
              <Gift className="w-4 h-4" />
            </div>
            <span className="text-white font-extrabold text-lg tracking-tight">Mynzo <span className="text-[#ee4923]">World</span></span>
          </div>
          <p className="text-xs leading-relaxed">
            Mynzo World is your premium online gifting destination, offering beautifully curated teddy bears, RC cars, pendants, and customized gift bundles that surprise, delight, and express your deepest feelings.
          </p>
        </div>

        {/* Quick links Grid */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px]">Categories</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-[#ee4923] transition-colors">Gift Hampers</a></li>
              <li><a href="#" className="hover:text-[#ee4923] transition-colors">Teddy Bears & Plush</a></li>
              <li><a href="#" className="hover:text-[#ee4923] transition-colors">RC Toys & Gadgets</a></li>
              <li><a href="#" className="hover:text-[#ee4923] transition-colors">Sterling Pendants</a></li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-bold uppercase tracking-wider text-[10px]">Company</h4>
            <ul className="space-y-1.5">
              <li><a href="#" className="hover:text-[#ee4923] transition-colors">About Mynzo</a></li>
              <li><a href="#/privacy" className="hover:text-[#ee4923] transition-colors">Privacy Policy</a></li>
              <li><a href="#/terms" className="hover:text-[#ee4923] transition-colors">Terms of Service</a></li>
              <li><a href="#/support" className="hover:text-[#ee4923] transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        {/* Trust Stamp */}
        <div className="flex items-center gap-2 bg-slate-800/40 p-3 rounded-xl border border-slate-800">
          <ShieldCheck className="w-5 h-5 text-[#ee4923] flex-shrink-0" />
          <span className="text-[11px] leading-tight">
            100% Buyer Protection Guarantee. Payments processed using grade-A secure transaction gateways.
          </span>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-800 pt-6 text-center text-[10px] space-y-1">
          <p>© {new Date().getFullYear()} Mynzo World Private Limited.</p>
          <p className="flex items-center justify-center gap-1">
            Made with <Heart className="w-3 h-3 text-rose-500 fill-current animate-pulse" /> for special moments.
          </p>
        </div>
      </div>
    </footer>
  );
}

