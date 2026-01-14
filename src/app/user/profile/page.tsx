"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  Loader2, Mail, Fingerprint,
  CalendarClock, ShieldCheck,
  Store, UserCircle2
} from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen bg-[#FFFDF5]">
        <div className="text-center">
          <Loader2 className="animate-spin w-10 h-10 mx-auto text-yellow-600 mb-4" />
          <p className="font-black uppercase tracking-widest text-xs text-slate-400">Loading Registry...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-yellow-100 text-slate-900">

      {/* --- HERO HEADER (Compact Registry Style) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-24 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="text-center md:text-left flex-1">
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              // Reduced from 7xl to 5xl
              className="text-3xl md:text-5xl font-black tracking-tighter text-gray-900 leading-[0.9] uppercase mb-3"
            >
              User <br />
              <span className="text-red-600 ">Registry</span>
            </motion.h1>
            <p className="text-gray-500 font-bold text-[10px] md:text-xs uppercase tracking-[0.2em]">{user.email}</p>
          </div>

          {/* Icon Tilted Card - Slightly Scaled Down */}
          <motion.div
            initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
            animate={{ opacity: 1, rotate: -3, scale: 0.95 }}
            className="relative"
          >
            <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-yellow-100 flex items-center justify-center relative">
              <div className="text-yellow-500">
                <UserCircle2 size={80} strokeWidth={1} />
              </div>

              <div className="absolute -top-2 -right-2 bg-red-600 text-white p-2.5 rounded-xl shadow-lg border-4 border-[#FEF3C7]">
                <ShieldCheck size={20} fill="currentColor" />
              </div>
            </div>

            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest whitespace-nowrap">
              Identity Verified
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- DETAILS SECTION --- */}
      <div className="max-w-4xl mx-auto px-6 -mt-12 pb-20 relative z-20">
        <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-yellow-100/50">
          <div className="flex items-center gap-3 mb-8 border-b border-yellow-100 pb-5">
            <div className="p-2.5 bg-yellow-400 rounded-xl text-black">
              <Fingerprint size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase  leading-none">Account Credentials</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Identity File</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <DetailRow
              title="Email Address"
              value={user.email}
              icon={<Mail size={18} />}
            />
            <DetailRow
              title="Registry Date"
              value={new Date(user.created_at).toLocaleDateString()}
              icon={<CalendarClock size={18} />}
            />
          </div>

          {/* Bottom Banner */}
          <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 flex items-center gap-5">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm shrink-0 border border-slate-100">
              <Store className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-black uppercase tracking-tight">Active Studio Member</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed mt-1">
                This user profile is officially registered within the Vendor Network Registry. All credentials verified through authenticated protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ title, value, icon }: { title: string; value: string | null; icon: React.ReactNode }) {
  return (
    <div className="group flex items-center gap-4 p-3.5 rounded-2xl border border-transparent hover:border-yellow-200 hover:bg-[#FEF3C7]/20 transition-all">
      <div className="bg-white text-yellow-700 p-2.5 rounded-xl shadow-sm border border-yellow-50 group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-0.5">{title}</span>
        <span className="text-xs font-black text-gray-900 truncate">{value || "—"}</span>
      </div>
    </div>
  );
}