"use client";

import { useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Lock, Mail, Loader2, Shield, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await supabase
      .from("admin_users")
      .select("role, email")
      .eq("email", email)
      .eq("password", password)
      .single();

    if (authError || !data) {
      setError("Invalid administrative credentials.");
      setLoading(false);
      return;
    }

    localStorage.setItem("user_role", data.role);
    window.location.href = data.role === "admin" ? "/admin/dashboard" : "/admin/subadmin-dashboard";
  };

  return (
    // Added h-screen and fixed background to ensure the dark theme fills the page
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 antialiased">
      
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black">
          
          {/* LOGO SECTION */}
          <div className="flex flex-col items-center mb-10">
            <div className="bg-white p-4 rounded-2xl mb-6 shadow-xl">
              <Image 
                src="/whitelogo.jpeg" 
                alt="Dtssolutions Logo" 
                width={140} 
                height={40} 
                priority
                className="object-contain"
              />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal</h1>
            <p className="text-slate-400 text-sm mt-1">Terminal Authentication Required</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-4">
              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="admin@Dtssolutions.com"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-slate-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="text-red-400 text-xs font-bold text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <button
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Sign In to Console
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Secure Access</span>
            <Shield className="text-slate-700" size={16} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}