"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Loader, ShieldAlert, Sparkles, CheckCircle2, FileText, 
  MessageSquareText, ArrowRight, ShieldCheck, UserCheck, 
  ListChecks, Timer, Rocket
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
      setFormError("Identity and Intent fields are required.");
      return;
    }
    setFormLoading(true);
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("vendor_enquiries").insert([
      { vendor_id: vendorId, vendor_email: vendorEmail, subject, message },
    ]);

    if (error) {
      setFormError("Transmission failed. Please try again.");
    } else {
      setFormSuccess("Your enquiry has been routed to the admin team.");
      setSubject("");
      setMessage("");
    }
    setFormLoading(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 pb-12 font-sans selection:bg-[#74cb01]/20">
      
      {/* CLEAN HEADER */}
      <div className="relative pt-16 pb-28 overflow-hidden bg-slate-50/80 border-b border-slate-100">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#74cb01]/5 rounded-full blur-[80px] translate-x-1/4 -translate-y-1/2" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="h-1 w-8 bg-[#74cb01] rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#74cb01]">Priority Channel</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none uppercase">
            Admin <span className="text-[#74cb01]">Concierge</span>
          </h1>
          <p className="mt-4 text-slate-500 text-base font-medium max-w-md">
            Directly communicate with our operations team for technical support or account enquiries.
          </p>
        </div>
      </div>

      {/* COMPACT CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-30">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* FORM CARD */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#74cb01]/10 rounded-xl flex items-center justify-center text-[#74cb01]">
                    <MessageSquareText size={20} />
                </div>
                <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">Compose Request</h2>
            </div>

            <AnimatePresence mode="wait">
              {formError && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 mb-6 text-xs font-bold border border-red-100">
                  <ShieldAlert size={16} /> {formError}
                </motion.div>
              )}
              {formSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 mb-6 text-xs font-bold border border-green-100">
                  <CheckCircle2 size={16} /> {formSuccess}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject: e.g. Payment Issue, API Error"
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-[#74cb01]/10 focus:bg-white border border-transparent focus:border-[#74cb01]/20 transition-all placeholder:text-slate-300"
              />

              <textarea
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your enquiry in detail..."
                  className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none text-sm font-bold focus:ring-2 focus:ring-[#74cb01]/10 focus:bg-white border border-transparent focus:border-[#74cb01]/20 transition-all resize-none placeholder:text-slate-300"
              />

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleFormSubmit}
                disabled={formLoading}
                className="w-full bg-slate-900 hover:bg-black text-white py-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 text-sm uppercase tracking-[0.2em] shadow-lg shadow-slate-200"
              >
                {formLoading ? <Loader className="animate-spin" size={18} /> : (
                  <> Send Request <Send size={16} className="text-[#74cb01]" /> </>
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* REPLACED SIDEBAR: ROADMAP & IDENTITY */}
          <div className="lg:col-span-4 flex flex-col gap-5">
            
            {/* NEW: Process Roadmap */}
            <div className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-lg shadow-slate-100">
                <h3 className="text-xs font-black mb-6 text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <ListChecks size={14} /> Submission Roadmap
                </h3>
                <div className="space-y-6">
                    <StepItem 
                        icon={<FileText size={14} />} 
                        title="Review" 
                        desc="Admin validates the request"
                        active 
                    />
                    <StepItem 
                        icon={<Timer size={14} />} 
                        title="Processing" 
                        desc="Ticket assigned to lead"
                    />
                    <StepItem 
                        icon={<Rocket size={14} />} 
                        title="Resolution" 
                        desc="Final response sent to you"
                    />
                </div>
            </div>

            {/* NEW: Verification Card */}
            <div className="bg-slate-900 p-7 rounded-[2.5rem] text-white relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-[#74cb01] rounded-lg">
                            <UserCheck size={18} className="text-slate-900" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Verified Vendor</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        You are sending this as: <br />
                        <span className="text-white font-bold">{vendorEmail || "Authenticated User"}</span>
                    </p>
                </div>
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#74cb01]/10 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-[#74cb01]/20 transition-all" />
            </div>

            <div className="bg-slate-50 border border-dashed border-slate-200 p-5 rounded-[2rem] flex items-center gap-4">
                <ShieldCheck size={20} className="text-slate-300" />
                <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">
                    Messages are encrypted <br /> & stored securely.
                </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

/* Roadmap Component */
function StepItem({ icon, title, desc, active = false }: { icon: any, title: string, desc: string, active?: boolean }) {
    return (
        <div className="flex gap-4">
            <div className={`mt-1 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${active ? 'bg-[#74cb01] text-white' : 'bg-slate-50 text-slate-300'}`}>
                {icon}
            </div>
            <div>
                <p className={`text-xs font-black uppercase tracking-tight ${active ? 'text-slate-900' : 'text-slate-400'}`}>{title}</p>
                <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
            </div>
        </div>
    );
}