import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Mail, Phone, Calendar, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function AccountInfoPage() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const [formData, setFormData] = useState({
    name: user?.name || 'User_1544',
    email: user?.email || 'user1544@mynzo.com',
    phone: user?.phone || '+91 98765 43210',
    dob: '1995-08-15',
    gender: 'female'
  });

  const [uploadedImage, setUploadedImage] = useState(() => {
    return sessionStorage.getItem('userUploadedImage') || null;
  });
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setUploadedImage(base64String);
        sessionStorage.setItem('userUploadedImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (setUser) {
      setUser({ ...user, ...formData });
    }
    alert('Changes saved successfully!');
    navigate(-1);
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col font-sans pb-20">
      {/* Header */}
      <div className="bg-[#fff4f2] px-4 py-3 sticky top-0 z-50 shadow-sm flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-[#02006c]" />
        </button>
        <h1 className="text-[17px] font-bold text-[#02006c]">Account Information</h1>
      </div>
      
      <div className="p-4 space-y-6">
        
        {/* Profile Picture Upload */}
        <div className="flex flex-col items-center pt-2">
          <div className="relative">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-orange-50 overflow-hidden flex items-center justify-center">
              {uploadedImage ? (
                <img src={uploadedImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-10 h-10 text-orange-200" />
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current.click()}
              className="absolute bottom-0 right-0 p-2 bg-[#FF6E54] text-white rounded-full shadow-md hover:scale-105 transition-transform cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>
          <p className="mt-3 text-[13px] font-bold text-slate-800">Update Photo</p>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 space-y-5">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 block">Full Name</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 block">Email Address</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 block">Phone Number</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input 
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all"
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="space-y-1.5">
            <label className="text-[13px] font-bold text-slate-700 block">Date of Birth</label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input 
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:border-[#FF6E54] focus:ring-1 focus:ring-[#FF6E54]/20 transition-all"
              />
            </div>
          </div>

          {/* Gender */}
          <div className="space-y-2 pt-1">
            <label className="text-[13px] font-bold text-slate-700 block">Gender</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gender" 
                  value="male" 
                  checked={formData.gender === 'male'} 
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF6E54] border-slate-300 focus:ring-[#FF6E54]"
                />
                <span className="text-[13px] text-slate-700 group-hover:text-slate-900 font-medium">Male</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gender" 
                  value="female" 
                  checked={formData.gender === 'female'} 
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF6E54] border-slate-300 focus:ring-[#FF6E54]"
                />
                <span className="text-[13px] text-slate-700 group-hover:text-slate-900 font-medium">Female</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <input 
                  type="radio" 
                  name="gender" 
                  value="other" 
                  checked={formData.gender === 'other'} 
                  onChange={handleChange}
                  className="w-4 h-4 text-[#FF6E54] border-slate-300 focus:ring-[#FF6E54]"
                />
                <span className="text-[13px] text-slate-700 group-hover:text-slate-900 font-medium">Other</span>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <button onClick={handleSave} className="w-full bg-[#02006c] text-white font-bold text-[14px] py-3.5 rounded-lg mt-4 hover:bg-[#02006c]/90 active:scale-[0.98] transition-all shadow-sm cursor-pointer">
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
