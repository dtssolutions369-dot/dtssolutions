"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Loader2, Mail, Fingerprint,
  CalendarClock, ShieldCheck,
  Store, UserCircle2, ChevronLeft
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-[#FAFAFA]">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 mx-auto text-[#00AEEF] mb-4" />
          <p className="font-black uppercase tracking-widest text-xs text-slate-400">Loading Registry...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-24 font-sans selection:bg-[#74cb01]/30">
      
      {/* --- PREMIUM CENTERED HEADER --- */}
      <header className="relative pt-24 pb-44 overflow-hidden">
        {/* Ambient background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-[#00AEEF]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[0%] left-[5%] w-[400px] h-[400px] bg-[#74cb01]/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AEEF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AEEF]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">User Registry</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              User <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Registry.</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Your verified identity and account details in the Dtssolutions network.
            </p>
          </motion.div>
        </div>
      </header>

      {/* --- DARK COMMAND CENTER FILTER BAR --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-950 rounded-[3rem] p-3 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#00AEEF]/40 transition-all"
            >
              <ChevronLeft size={20} className="text-[#00AEEF]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Navigation</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">Back to Dashboard</span>
              </div>
            </button>

            {/* User Email Display */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5">
              <Mail size={20} className="text-[#F26522]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Email</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs truncate">{user.email}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Account Credentials Section */}
            <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-[#00AEEF]/10 rounded-2xl text-[#00AEEF]">
                  <Fingerprint size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-none">Account Credentials</h2>
                  <p className="text-slate-400 text-sm mt-1">Verified Identity File</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DetailCard
                  title="Email Address"
                  value={user.email}
                  icon={<Mail size={18} />}
                />
                <DetailCard
                  title="Registry Date"
                  value={new Date(user.created_at).toLocaleDateString()}
                  icon={<CalendarClock size={18} />}
                />
              </div>
            </section>

            {/* Active Studio Member Section */}
            <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-[#74cb01]/10 rounded-2xl text-[#74cb01]">
                  <Store size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-none">Network Status</h2>
                  <p className="text-slate-400 text-sm mt-1">Membership Verification</p>
                </div>
              </div>
              
              <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-100">
                    <ShieldCheck className="text-[#74cb01]" size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900 uppercase tracking-tight">Active Studio Member</p>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed mt-1">
                      This user profile is officially registered within the Vendor Network Registry. All credentials verified through authenticated protocols.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              {/* User Avatar Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm hover:shadow-md transition-shadow text-center"
              >
                <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-slate-200">
                  <UserCircle2 size={48} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight mb-2">Identity Verified</h3>
                <p className="text-sm font-medium text-slate-500">Secure and authenticated account</p>
                <div className="mt-6 flex justify-center">
                  <div className="bg-[#74cb01]/10 text-[#74cb01] px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider">
                    Verified
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- REFINED DETAIL CARD ---

function DetailCard({ title, value, icon }: { title: string; value: string | null; icon: React.ReactNode }) {
  return (
    <div className="group bg-white border border-slate-100 rounded-[2rem] p-6 hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="bg-slate-50 text-[#00AEEF] p-3 rounded-xl group-hover:bg-[#00AEEF] group-hover:text-white transition-all">
          {icon}
        </div>
        <div className="flex-1">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1 block">{title}</span>
          <span className="text-sm font-black text-slate-900 truncate">{value || "—"}</span>
        </div>
      </div>
    </div>
  );
}