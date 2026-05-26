import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, MapPin, MoreHorizontal, Plus, Edit2, Trash2, X, Briefcase } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function SavedAddressesPage() {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', type: 'Home', openOnSaturday: false, openOnSunday: false });
  
  // Using some mock addresses to match the reference image
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      name: 'Chirag Jeevanani',
      address: 'AH-49, Kadambari Nagar, Near Maa Annapurna Ice And Cold Storage, Indore, 452012',
      phone: '9926894566'
    },
    {
      id: 2,
      type: 'Home',
      name: 'Chirag Jeevanani',
      address: 'Sr- 314, G-2, silicon city, Silicon City, Rau, Tulsi Parisar Phase 1, Indore, 452012',
      phone: '8225819420'
    },
    {
      id: 3,
      type: 'Location',
      name: 'Chirag',
      address: 'Near shankar takies,front of ram khilawan oil mill, Ganj road near shankar takies, Shahdol, 484001',
      phone: '8225819420'
      // ... other mock addresses
    }
  ]);

  const openAddModal = () => {
    setEditingAddressId(null);
    setFormData({ name: '', phone: '', address: '', type: 'Home', openOnSaturday: false, openOnSunday: false });
    setIsModalOpen(true);
  };

  const openEditModal = (addr) => {
    setActiveMenuId(null);
    setEditingAddressId(addr.id);
    setFormData({ ...addr, openOnSaturday: addr.openOnSaturday || false, openOnSunday: addr.openOnSunday || false });
    setIsModalOpen(true);
  };

  const saveAddress = () => {
    if (editingAddressId) {
      setAddresses(addresses.map(a => a.id === editingAddressId ? { ...formData, id: editingAddressId } : a));
    } else {
      setAddresses([...addresses, { ...formData, id: Date.now() }]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="bg-white min-h-[100dvh] font-sans pb-20 animate-fade-in relative">
      {/* Header */}
      <div className="bg-[#fff4f2] px-4 py-3 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-white/50 rounded-full transition-colors cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-[#02006c]" />
          </button>
          <h1 className="text-[17px] font-bold text-[#02006c]">Saved Addresses</h1>
        </div>
      </div>

      <div className="px-4 py-3 flex justify-end">
        <button onClick={openAddModal} className="flex items-center gap-1 text-[14px] font-bold text-[#FF6E54] hover:text-orange-600 cursor-pointer">
          <Plus className="w-4 h-4" /> Add New
        </button>
      </div>

      <div className="px-4 space-y-6 mt-2">
        {addresses.map((addr) => (
          <div key={addr.id} className="border-b border-slate-100 pb-5 last:border-0 relative">
            <div className="flex items-start gap-3">
              <div className="pt-0.5 text-slate-600">
                {addr.type === 'Home' ? (
                  <Home className="w-5 h-5" />
                ) : addr.type === 'Work' ? (
                  <Briefcase className="w-5 h-5" />
                ) : (
                  <MapPin className="w-5 h-5" />
                )}
              </div>
              <div className="flex-1 pr-8">
                <h3 className="text-[14px] font-bold text-slate-800 mb-1">{addr.name}</h3>
                <p className="text-[12px] text-slate-500 leading-relaxed mb-1.5">{addr.address}</p>
                <p className="text-[12px] font-bold text-slate-600">{addr.phone}</p>
              </div>
            </div>
            <button 
              onClick={() => setActiveMenuId(activeMenuId === addr.id ? null : addr.id)}
              className="absolute top-0 right-0 p-2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {activeMenuId === addr.id && (
              <div className="absolute top-8 right-2 bg-white rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-slate-100 py-1.5 min-w-[140px] z-10 animate-fade-in">
                <button 
                  onClick={() => openEditModal(addr)}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#02006c] transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button 
                  onClick={() => {
                    setAddresses(addresses.filter(a => a.id !== addr.id));
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Click outside to close menu overlay */}
      {activeMenuId && (
        <div 
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenuId(null)}
        />
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0a0927]/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[24px] w-full max-w-md shadow-2xl animate-slide-up sm:animate-fade-in overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-lg font-black text-[#02006c]">
                {editingAddressId ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-4 h-4 text-slate-600" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700">Full Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all"
                  placeholder="Enter full name"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700">Phone Number</label>
                <input 
                  type="tel" 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700">Address Details</label>
                <textarea 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all resize-none"
                  placeholder="House No, Building, Street, City, Pincode"
                />
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-[13px] font-bold text-slate-700 block">Address Type</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="type" 
                      value="Home" 
                      checked={formData.type === 'Home'} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-4 h-4 text-[#FF6E54] border-slate-300 focus:ring-[#FF6E54]"
                    />
                    <span className="text-[13px] text-slate-700 group-hover:text-slate-900 font-medium">Home</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="type" 
                      value="Work" 
                      checked={formData.type === 'Work'} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-4 h-4 text-[#FF6E54] border-slate-300 focus:ring-[#FF6E54]"
                    />
                    <span className="text-[13px] text-slate-700 group-hover:text-slate-900 font-medium">Work</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="type" 
                      value="Location" 
                      checked={formData.type === 'Location'} 
                      onChange={e => setFormData({...formData, type: e.target.value})}
                      className="w-4 h-4 text-[#FF6E54] border-slate-300 focus:ring-[#FF6E54]"
                    />
                    <span className="text-[13px] text-slate-700 group-hover:text-slate-900 font-medium">Other</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-slate-100 shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
              <button 
                onClick={saveAddress}
                className="w-full bg-[#02006c] hover:bg-[#02006c]/90 text-white font-bold py-3.5 rounded-lg active:scale-[0.98] transition-all shadow-md"
              >
                Save Address
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
