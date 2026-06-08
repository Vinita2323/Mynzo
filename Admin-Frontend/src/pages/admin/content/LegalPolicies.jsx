import React, { useState } from 'react';
import { FileText, Save, RotateCcw, AlertCircle, CheckCircle2, Edit3, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LegalPolicies = () => {
  const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' or 'terms'
  const [isEditing, setIsEditing] = useState(false);
  
  const [privacyPolicy, setPrivacyPolicy] = useState(`Privacy Policy for Cocio

Last Updated: May 2026

At Cocio, we take your privacy seriously. This policy describes how we collect, use, and protect your personal data when you use our B2B marketplace.

1. DATA COLLECTION
We collect information that you provide when creating an account, such as your business name, email address, and contact details.

2. HOW WE USE DATA
We use your information to facilitate transactions, provide customer support, and improve our services.

3. DATA PROTECTION
We implement industry-standard security measures to ensure the safety of your personal information.`);

  const [termsConditions, setTermsConditions] = useState(`Terms & Conditions for Cocio

1. ACCEPTANCE OF TERMS
By accessing and using the Cocio platform, you agree to comply with these terms.

2. VENDOR OBLIGATIONS
Vendors must provide accurate product information and maintain professional standards of service.

3. PAYMENTS & COMMISSIONS
All transactions are subject to platform commissions as defined in the Finance section.`);

  const [isSaving, setIsSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Mock API call
    setTimeout(() => {
      setIsSaving(false);
      setIsEditing(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  const handleDiscard = () => {
    setIsEditing(false);
    // In a real app, you would reset the state to the original fetched data
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Legal & Policies</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your platform's Privacy Policy and Terms of Use</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-100 text-sm font-semibold"
            >
              <Edit3 size={18} />
              <span>Edit Content</span>
            </button>
          ) : (
            <>
              <button 
                onClick={handleDiscard}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all text-sm font-semibold"
              >
                <XCircle size={18} />
                <span>Discard</span>
              </button>
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-green-100 text-sm font-semibold disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save size={18} />
                )}
                <span>{isSaving ? 'Saving...' : 'Publish Changes'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-slate-50">
          <button 
            disabled={isEditing}
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 py-5 text-sm font-bold transition-all relative ${activeTab === 'privacy' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Privacy Policy
            {activeTab === 'privacy' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
          <button 
            disabled={isEditing}
            onClick={() => setActiveTab('terms')}
            className={`flex-1 py-5 text-sm font-bold transition-all relative ${activeTab === 'terms' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'} ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Terms & Conditions
            {activeTab === 'terms' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />}
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence>
            {isEditing && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                  <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Editor Mode Active</p>
                    <p className="text-xs text-amber-600 mt-1 leading-relaxed">
                      You are currently editing the <strong>{activeTab === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}</strong>. 
                      Remember to save your changes to push them live to the platform.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">
                {activeTab === 'privacy' ? 'Privacy Policy Content' : 'Terms & Conditions Content'}
              </label>
              {!isEditing && (
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">Read-Only Mode</span>
              )}
            </div>
            <textarea
              readOnly={!isEditing}
              value={activeTab === 'privacy' ? privacyPolicy : termsConditions}
              onChange={(e) => activeTab === 'privacy' ? setPrivacyPolicy(e.target.value) : setTermsConditions(e.target.value)}
              className={`w-full h-[500px] border rounded-2xl p-8 text-slate-700 font-medium leading-relaxed transition-all resize-none outline-none ${isEditing 
                ? 'bg-slate-50 border-blue-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-400' 
                : 'bg-slate-50/30 border-slate-100 cursor-not-allowed'}`}
              placeholder="Start typing your policy content..."
            />
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-[60]"
        >
          <CheckCircle2 className="text-green-400" size={20} />
          <span className="text-sm font-bold uppercase tracking-widest">Changes Published Successfully</span>
        </motion.div>
      )}
    </div>
  );
};

export default LegalPolicies;
