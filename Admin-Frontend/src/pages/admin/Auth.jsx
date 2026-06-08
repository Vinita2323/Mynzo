import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    // Mock login
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4 font-nunito">
      <div className="w-full max-w-md">
        {/* Admin Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img 
              src="/Logo (4).png" 
              alt="Cocio Logo" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="hidden w-12 h-12 bg-blue-600 rounded-xl items-center justify-center shadow-lg shadow-blue-100">
               <ShieldCheck size={24} className="text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight font-montserrat uppercase">
            Cocio<span className="text-blue-600">.</span> Admin
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[2px] text-[9px] mt-1">Verified Management Session</p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-slate-100 p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.04)]">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-500 text-[10px] font-bold p-3 rounded-xl text-center uppercase tracking-widest">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Admin Email</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@cocio.com"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-14 pr-6 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3.5 pl-14 pr-14 text-slate-900 font-bold placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-500 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] uppercase tracking-[2px] py-4 rounded-xl shadow-lg shadow-blue-100 active:scale-[0.98] transition-all mt-2"
            >
              Sign In to Dashboard
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-300">
            <button className="hover:text-blue-500 transition-colors">Recover Access</button>
            <span>v2.4.0-Stable</span>
          </div>
        </div>

        <p className="text-center text-slate-400 text-[10px] font-bold mt-8 uppercase tracking-widest">
          Not an admin? <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">Back to Storefront</button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
