import React, { useState, useEffect } from 'react';
import { ChevronLeft, PhoneCall, Mail, MessageSquare, Clock, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HelpSupportPage() {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [supportEmail, setSupportEmail] = useState('support@mynzo.com');
  const [supportPhone, setSupportPhone] = useState('+1 (800) 123-4567');

  const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fallbackFaqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by going to the 'Orders' section in your profile and clicking on the 'Track Order' button next to your recent purchase."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day hassle-free return policy. If you're not satisfied with your purchase, you can return it within 30 days of delivery for a full refund."
    },
    {
      question: "How do I use Mynzo Coins?",
      answer: "Mynzo Coins can be applied at checkout. 100 Mynzo Coins equals $1. You can select the option to 'Use Mynzo Coins' during the payment process."
    },
    {
      question: "Can I change my shipping address?",
      answer: "You can update your shipping address in the 'Saved Addresses' section of your Account Information. For active orders, please contact support immediately."
    }
  ];

  useEffect(() => {
    const fetchFaqsAndSettings = async () => {
      try {
        const res = await fetch(`${API_BASE}/admin/content/qna`);
        const data = await res.json();
        if (data.success && data.qnas && data.qnas.length > 0) {
          setFaqs(data.qnas);
        } else {
          setFaqs(fallbackFaqs);
        }
      } catch (err) {
        console.error("Error fetching FAQs:", err);
        setFaqs(fallbackFaqs);
      }

      try {
        const resSettings = await fetch(`${API_BASE}/admin/settings`);
        const dataSettings = await resSettings.json();
        if (dataSettings.success && dataSettings.settings) {
          if (dataSettings.settings.supportEmail) {
            setSupportEmail(dataSettings.settings.supportEmail);
          }
          if (dataSettings.settings.helpline) {
            setSupportPhone(dataSettings.settings.helpline);
          }
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
      }
    };
    fetchFaqsAndSettings();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };


  return (
    <div className="bg-slate-50 min-h-[100dvh] font-sans animate-fade-in flex flex-col">
      {/* Header */}
      <div className="bg-white px-4 py-4 shadow-sm z-10 sticky top-0 flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-[#02006c] hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-sm flex-shrink-0"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-[#02006c] text-[20px] font-black tracking-tight">Help & Support</h1>
      </div>

      <div className="p-5 flex-grow space-y-6">
        
        {/* Intro Banner */}
        <div className="bg-gradient-to-br from-orange-50 to-[#FFE4D6] rounded-2xl p-5 border border-orange-100 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-[#02006c] font-black text-lg mb-1">How can we help?</h2>
            <p className="text-slate-600 text-xs font-medium max-w-[80%]">Our customer service team is available 24/7 to assist you with any questions or concerns.</p>
          </div>
          <MessageSquare className="absolute -bottom-4 -right-4 w-24 h-24 text-orange-200/50 rotate-12" />
        </div>

        {/* Contact Options */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Contact Us</h3>
          
          <a href={`tel:${supportPhone}`} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-[#ee4923] hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#02006c]">Call Us</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{supportPhone}</p>
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> 24/7
            </div>
          </a>

          <a href={`mailto:${supportEmail}`} className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:border-[#ee4923] hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-sky-50 text-sky-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-[#02006c]">Email Us</h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{supportEmail}</p>
            </div>
            <div className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Fast
            </div>
          </a>
        </div>

        {/* FAQs Section */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Frequently Asked Questions</h3>
          
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border-b border-slate-100 last:border-0 ${
                  openFaqIndex === index ? 'bg-orange-50/30' : 'hover:bg-slate-50'
                } transition-colors`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className={`text-[13px] font-bold ${openFaqIndex === index ? 'text-[#ee4923]' : 'text-[#02006c]'}`}>
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-300 ${
                      openFaqIndex === index ? 'rotate-180 text-[#ee4923]' : ''
                    }`}
                  />
                </button>
                
                {/* Expandable Answer */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaqIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <p className="px-5 pb-4 text-[13px] text-slate-600 font-medium leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
