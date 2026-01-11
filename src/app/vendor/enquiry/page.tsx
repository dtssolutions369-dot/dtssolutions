"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Loader, 
  ShieldAlert, 
  Sparkles,
  Zap,
  HeadphonesIcon,
  Globe,
  Clock,
  CheckCircle2,
  FileText,
  BadgeCheck,
  MessageSquareText
} from "lucide-react";

export default function VendorEnquiryPage() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendorEmail, setVendorEmail] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setVendorEmail(user.email);
        const { data } = await supabase
          .from("vendor_register")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();
        if (data) setVendorId(data.id);
      }
    };
    fetchVendor();
  }, []);

  const handleFormSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("vendor_enquiries").insert([
      { vendor_id: vendorId, vendor_email: vendorEmail, subject, message },
    ]);

    if (error) {
      setFormError("Submission failed. Please try again.");
    } else {
      setFormSuccess("Ticket successfully transmitted to Admin.");
      setSubject("");
      setMessage("");
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-900 pb-20 font-sans">
      {/* HERO SECTION */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-24 px-4 sm:px-6 relative overflow-hidden border-b border-yellow-200">
        {/* Dot Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tighter text-gray-900 leading-tight uppercase mb-4"
            >
              Admin <br />
              <span className="text-red-600 italic">Connect</span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-600 text-sm sm:text-base max-w-md font-medium leading-relaxed mx-auto md:mx-0"
            >
              Instant communication channel for verified partners. Our technical team monitors this feed 24/7.
            </motion.p>
          </div>

          {/* Decorative Icon Card - hide on mobile */}
          <motion.div 
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -3, scale: 1 }}
            className="hidden lg:block bg-white p-6 rounded-3xl shadow-xl border border-yellow-100 relative"
          >
            <div className="absolute -top-2 -left-2 bg-green-500 text-white px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Live 24/7
            </div>
            <MessageSquareText size={50} className="text-yellow-600" />
          </motion.div>
        </div>
      </div>

      {/* FORM + SIDE PANEL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* MAIN FORM */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-8 bg-white shadow-lg rounded-3xl p-6 sm:p-10 border border-slate-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#D80000] rounded-2xl flex items-center justify-center shadow-lg">
                  <Zap className="text-[#FFD700] fill-[#FFD700]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Open Support Ticket</h2>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Average Response: 15 Minutes</p>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {formError && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-[#D80000] p-4 rounded-2xl text-sm font-bold mb-6 border-l-4 border-[#D80000] flex items-center gap-2">
                  <ShieldAlert size={18} /> {formError}
                </motion.div>
              )}
              {formSuccess && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-emerald-50 text-emerald-700 p-4 rounded-2xl text-sm font-bold mb-6 border-l-4 border-emerald-500 flex items-center gap-2">
                  <Sparkles size={18} className="text-emerald-500" /> {formSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <FileText size={12} className="text-[#D80000]"/> Subject Identification
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. KYC Verification Query"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 sm:p-5 focus:bg-white focus:border-[#D80000] focus:ring-2 focus:ring-red-300 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
                  <MessageSquare size={12} className="text-[#D80000]"/> Detailed Inquiry
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we assist your business today?"
                  className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 sm:p-5 focus:bg-white focus:border-[#D80000] focus:ring-2 focus:ring-red-300 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-300 resize-none"
                />
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={formLoading}
                className="w-full bg-slate-900 hover:bg-black disabled:bg-slate-200 text-[#FFD700] py-4 sm:py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-sm sm:text-lg uppercase tracking-tight"
              >
                {formLoading ? <Loader className="animate-spin" size={20} /> : (
                  <> Dispatch Ticket <Send size={18} /> </>
                )}
              </button>
            </div>
          </motion.div>

          {/* SIDE PANEL */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-4 flex flex-col gap-6 mt-6 lg:mt-0"
          >
            {/* Status Card */}
            <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <Globe size={16} className="text-yellow-500 animate-pulse" /> System Status
              </h3>
              <div className="space-y-2">
                <StatusItem label="Admin Dashboard" status="Operational" />
                <StatusItem label="Payment Gateway" status="Operational" />
                <StatusItem label="Email Servers" status="Fast" />
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-yellow-400 rounded-3xl p-6 text-slate-900">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2">
                <HeadphonesIcon size={16} /> Quick Support
              </h3>
              <div className="space-y-2">
                <QuickLink icon={<BadgeCheck size={14}/>} title="Partner FAQ" desc="Instant answers" />
                <QuickLink icon={<Clock size={14}/>} title="Emergency" desc="WhatsApp Admin" />
              </div>
            </div>

            {/* Trust Badge */}
            <div className="bg-white border border-slate-200 rounded-3xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="text-emerald-500" size={28} />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-slate-400">Secure Channel</p>
                <p className="text-sm font-black text-slate-800 leading-tight">End-to-End Encrypted Communication</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatusItem({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between border-b border-white/20 pb-2">
      <span className="text-[9px] font-bold text-white/70 uppercase">{label}</span>
      <span className="text-[9px] font-black text-yellow-400 uppercase tracking-tighter">{status}</span>
    </div>
  );
}

function QuickLink({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/50 p-3 rounded-2xl cursor-pointer hover:bg-white transition-colors group">
      <div className="w-8 h-8 bg-slate-900 text-yellow-400 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black uppercase tracking-tight">{title}</p>
        <p className="text-[9px] font-medium text-slate-600">{desc}</p>
      </div>
    </div>
  );
}
