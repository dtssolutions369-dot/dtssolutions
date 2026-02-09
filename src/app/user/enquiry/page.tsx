"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, Phone, Send, Loader2, User, ShieldCheck, 
  CheckCircle, Bell, Lock, Sparkles, Plus, 
  MessageSquare, Zap, Target, Search, MousePointer2
} from "lucide-react";

export default function EnquiryPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasSubscription, setHasSubscription] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const initializePage = async () => {
      await Promise.all([checkSubscriptionStatus(), fetchEnquiries()]);
      setLoading(false);
    };
    initializePage();
  }, []);

  const checkSubscriptionStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: vendor } = await supabase.from("vendor_register")
      .select("subscription_expiry")
      .eq("user_id", user.id)
      .maybeSingle();
    
    const isActive = vendor?.subscription_expiry && new Date(vendor.subscription_expiry) > new Date();
    setHasSubscription(!!isActive);
  };

  const fetchEnquiries = async () => {
    const { data } = await supabase.from("enquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    if (data) setEnquiries(data);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.message) return;

    setFormLoading(true);
    const { error } = await supabase.from("enquiries").insert([formData]);
    
    if (!error) {
      setFormData({ name: "", email: "", phone: "", message: "" });
      setShowToast(true);
      fetchEnquiries();
      setTimeout(() => setShowToast(false), 4000);
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-32 font-sans">
      
      {/* --- CENTERED PREMIUM HERO --- */}
      <header className="relative pt-24 pb-44 overflow-hidden">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] left-[10%] w-[400px] h-[400px] bg-[#74cb01]/10 rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-[#00AEEF]/10 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F26522] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F26522]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Live Trade Network</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Direct <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#74cb01] to-[#00AEEF]">Sourcing.</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Skip the middlemen. Post your requirement globally and connect with <br className="hidden md:block" /> 
              verified local vendors in seconds.
            </p>
          </motion.div>
        </div>
      </header>

      {/* --- MAIN INTERFACE (Floating Grid) --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: ENQUIRY FORM (Bento Style) */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-5 bg-white/80 backdrop-blur-2xl p-8 md:p-12 rounded-[3.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-white sticky top-10"
          >
            <div className="flex items-center gap-5 mb-12">
              <div className="h-14 w-14 bg-gradient-to-br from-[#74cb01] to-[#5ea501] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#74cb01]/20">
                <Plus size={28} strokeWidth={3} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">Post Lead</h2>
                <p className="text-[10px] text-[#74cb01] font-black tracking-[0.2em] uppercase">Verified Broadcast</p>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <DTSInput label="Full Name" icon={<User size={18}/>} value={formData.name} placeholder="Who should we contact?"
                onChange={(v: string) => setFormData({...formData, name: v})} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DTSInput label="Email Address" icon={<Mail size={16}/>} value={formData.email} placeholder="mail@company.com"
                  onChange={(v: string) => setFormData({...formData, email: v})} />
                <DTSInput label="Phone Number" icon={<Phone size={16}/>} value={formData.phone} placeholder="10-digit mobile"
                  onChange={(v: string) => setFormData({...formData, phone: v})} />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">Requirements</label>
                <textarea 
                  rows={4} 
                  required
                  className="w-full p-6 rounded-[2rem] bg-slate-100/50 border-none outline-none focus:ring-4 focus:ring-[#74cb01]/10 text-sm font-semibold transition-all placeholder:text-slate-400"
                  placeholder="Tell us what you need, quantity, and timeline..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <button 
                disabled={formLoading}
                className="group w-full bg-slate-900 hover:bg-[#74cb01] text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all duration-500 flex items-center justify-center gap-3 shadow-2xl active:scale-95 overflow-hidden relative"
              >
                <span className="relative z-10 flex items-center gap-2">
                   {formLoading ? <Loader2 className="animate-spin" /> : <>Blast Lead Now <Send size={16} /></>}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#74cb01] to-[#00AEEF] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </form>
          </motion.div>

          {/* RIGHT: LIVE FEED */}
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="h-2.5 w-2.5 bg-[#00AEEF] rounded-full animate-pulse shadow-[0_0_10px_#00AEEF]" />
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-slate-400">Opportunities Hub</h3>
              </div>
              <Bell size={18} className="text-slate-300" />
            </div>

            <div className="space-y-6">
              <AnimatePresence mode="popLayout">
                {enquiries.map((enq, idx) => (
                  <EnquiryCard 
                    key={enq.id} 
                    enquiry={enq} 
                    idx={idx} 
                    isLocked={!hasSubscription} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, scale: 0.9, x: "-50%" }}
            className="fixed bottom-10 left-1/2 z-[100] bg-slate-900 text-white px-10 py-5 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4"
          >
            <CheckCircle className="text-[#74cb01]" size={24} />
            <span className="text-[11px] font-black uppercase tracking-[0.2em]">Requirement Broadcasted Successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- REFINED SUBCOMPONENTS ---

function EnquiryCard({ enquiry, idx, isLocked }: any) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: idx * 0.05 }}
      className="group bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-[#00AEEF]/20 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-3xl bg-slate-100 flex items-center justify-center font-black text-2xl text-slate-400 group-hover:bg-[#00AEEF] group-hover:text-white transition-all duration-500">
            {enquiry.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-black text-xl tracking-tighter uppercase">{enquiry.name}</h4>
            <div className="flex items-center gap-3 mt-1">
               <span className="text-[10px] font-black text-[#74cb01] uppercase tracking-widest">Verified Trade</span>
               <span className="h-1 w-1 bg-slate-200 rounded-full" />
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(enquiry.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
           <Zap size={12} className="text-[#F26522] fill-[#F26522]" />
           <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Hot Lead</span>
        </div>
      </div>

      <div className="bg-slate-50/80 p-6 rounded-[2rem] mb-8 border border-slate-100 group-hover:bg-white group-hover:border-[#00AEEF]/10 transition-colors">
        <p className="text-slate-600 text-[15px] leading-relaxed font-medium">
          {enquiry.message}
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div className={`flex flex-wrap gap-8 transition-all duration-1000 ${isLocked ? 'blur-md pointer-events-none opacity-30 select-none' : ''}`}>
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-tight">
            <Mail size={16} className="text-[#00AEEF]" /> {enquiry.email}
          </div>
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 uppercase tracking-tight">
            <Phone size={16} className="text-[#74cb01]" /> {enquiry.phone || '+91 0000 0000'}
          </div>
        </div>

        {isLocked && (
          <button className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#F26522] transition-all shadow-lg active:scale-95">
            <Lock size={14} /> Unlock Contact
          </button>
        )}
      </div>
    </motion.div>
  );
}

function DTSInput({ label, icon, value, onChange, placeholder }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-2">{label}</label>
      <div className="relative group">
        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#74cb01] group-focus-within:scale-110 transition-all duration-300">
          {icon}
        </div>
        <input 
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-16 pr-6 py-5 rounded-[1.8rem] bg-slate-100/50 border-none outline-none focus:ring-4 focus:ring-[#74cb01]/10 text-sm font-bold transition-all placeholder:text-slate-300"
        />
      </div>
    </div>
  );
}