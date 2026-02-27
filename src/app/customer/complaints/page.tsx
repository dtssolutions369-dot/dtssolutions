"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  MessageSquare, Send, Phone,
  AlertCircle, ArrowLeft, Loader2,
  ShieldCheck, Headset, CheckCircle
} from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

export default function LodgeComplaint() {
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    user_name: "",
    user_phone: "",
    subject: "",
    description: "",
    category: "General",
    priority: "Medium"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.user_phone.length < 10) {
      toast.error("Enter a valid 10-digit phone number");
      return;
    }

    setLoading(true);
    const generatedTicket = `DTS-${Math.floor(100000 + Math.random() * 900000)}`;

    try {
      const { error } = await supabase
        .from("complaints")
        .insert([{
          ticket_id: generatedTicket,
          user_name: formData.user_name,
          user_email: formData.user_phone, 
          subject: formData.subject,
          description: formData.description,
          category: formData.category,
          priority: formData.priority,
          status: "Open"
        }]);

      if (error) throw error;

      // Custom Success Toast
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-2xl rounded-[1.5rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-emerald-500`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <CheckCircle className="h-10 w-10 text-emerald-500" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Ticket Raised Successfully</p>
                <p className="mt-1 text-xs font-bold text-slate-500">ID: <span className="text-[#ff3d00]">{generatedTicket}</span></p>
                <p className="mt-1 text-[10px] text-slate-400">Our team will contact you on {formData.user_phone}</p>
              </div>
            </div>
          </div>
        </div>
      ), { duration: 8000 });

      setFormData({
        user_name: "",
        user_phone: "",
        subject: "",
        description: "",
        category: "General",
        priority: "Medium"
      });

    } catch (error: any) {
      toast.error(error.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 selection:bg-[#ff3d00] selection:text-white">
      <Toaster position="bottom-right" reverseOrder={false} />
      
      {/* Hero Section with Mesh Gradient */}
      <div className="bg-[#0f172a] pt-24 pb-48 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff3d00]/10 blur-[120px] rounded-full -mr-40 -mt-40" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 blur-[100px] rounded-full -ml-20 -mb-20" />
        
        <div className="max-w-5xl mx-auto relative z-10 text-center md:text-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link href="/" className="inline-flex items-center gap-2 text-white/40 hover:text-[#ff3d00] text-[10px] font-black uppercase tracking-[0.2em] transition-all mb-8 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to marketplace
            </Link>
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6">
              Resolution<span className="text-[#ff3d00]">.</span>
            </h1>
            <p className="text-slate-400 font-bold text-sm md:text-base max-w-2xl leading-relaxed">
              Encountered an issue? Our priority support team is here to ensure your local shopping experience remains seamless. Lodge your ticket below.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 -mt-32 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar Info - Hidden on Mobile */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl shadow-slate-200/50 space-y-8">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-[#ff3d00]">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">Buyer Protection</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">Every transaction is monitored. If a seller defaults, we intervene immediately.</p>
              </div>

              <div className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Headset size={24} />
                </div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight">24/7 Monitoring</h3>
                <p className="text-xs text-slate-500 font-bold leading-relaxed">Tickets are reviewed by real humans within 24 hours of submission.</p>
              </div>
            </div>
          </div>

          {/* Form Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-8 bg-white rounded-[3rem] shadow-2xl shadow-slate-300/60 border border-slate-100 overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Name</label>
                  <input 
                    required
                    type="text"
                    placeholder="Full name"
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#ff3d00] focus:bg-white transition-all placeholder:text-slate-300"
                    value={formData.user_name}
                    onChange={(e) => setFormData({...formData, user_name: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">+91</span>
                    <input 
                      required
                      type="tel"
                      maxLength={10}
                      placeholder="Mobile number"
                      className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl pl-16 pr-6 py-4 text-sm font-bold focus:outline-none focus:border-[#ff3d00] focus:bg-white transition-all"
                      value={formData.user_phone}
                      onChange={(e) => setFormData({...formData, user_phone: e.target.value.replace(/\D/g,'')})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Category</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-[#ff3d00] appearance-none cursor-pointer"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option>General Inquiry</option>
                    <option>Delayed Delivery</option>
                    <option>Product Mismatch</option>
                    <option>Payment Issue</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Urgency Level</label>
                  <select 
                    className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:border-[#ff3d00] appearance-none cursor-pointer"
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value})}
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High (Requires Callback)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject</label>
                <input 
                  required
                  type="text"
                  placeholder="What is the problem about?"
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#ff3d00] transition-all"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Detailed Description</label>
                <textarea 
                  required
                  placeholder="Please describe your concern in detail..."
                  className="w-full bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 py-4 text-sm font-bold focus:outline-none focus:border-[#ff3d00] transition-all h-[180px] resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <button 
                disabled={loading}
                type="submit"
                className="w-full bg-[#ff3d00] text-white py-6 rounded-[1.5rem] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-4 hover:bg-slate-900 transition-all shadow-xl shadow-orange-500/20 group relative overflow-hidden"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Raise Ticket
                    <Send size={18} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                  </>
                )}
              </button>
            </form>

            <div className="bg-slate-50 px-12 py-6 flex items-center justify-between border-t border-slate-100">
               <div className="flex items-center gap-2 text-slate-400">
                 <ShieldCheck size={14} />
                 <span className="text-[9px] font-black uppercase tracking-widest">End-to-end Encrypted Submission</span>
               </div>
               <p className="text-[9px] font-black text-[#ff3d00] uppercase tracking-widest">DTS Support Team</p>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}