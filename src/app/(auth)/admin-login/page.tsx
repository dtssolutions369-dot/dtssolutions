"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ShieldAlert, ChevronRight } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 1. SESSION CHECK: If already logged in as admin, skip login page
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: admin } = await supabase
          .from("admin_profiles")
          .select("id")
          .eq("email", session.user.email)
          .single();
        
        if (admin) router.push("/admin/dashboard");
      }
    };
    checkUser();
  }, [router]);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    const toastId = toast.loading("Establishing Secure Connection...");

    try {
      // 2. AUTHENTICATION: Sign in to Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // 3. AUTHORIZATION: Verify this user exists in your custom admin_profiles table
      const { data: admin, error: adminErr } = await supabase
        .from("admin_profiles")
        .select("role")
        .eq("email", authData.user?.email)
        .single();

      // If they are a valid user but NOT in the admin table
      if (adminErr || !admin) {
        await supabase.auth.signOut(); // Kick them out of the session
        throw new Error("Unauthorized: Access restricted to System Administrators.");
      }

      toast.success(`Access Granted. Welcome, ${admin.role || 'Admin'}`, { id: toastId });
      
      // Delay slightly for smooth transition
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 1000);
      
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fffcfb] flex items-center justify-center p-4 font-sans">
      <Toaster position="top-center" reverseOrder={false} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white border border-orange-100 rounded-[2.5rem] p-10 shadow-[0_40px_100px_rgba(0,0,0,0.04)]"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-50 rounded-2xl mb-6 shadow-inner">
            <ShieldAlert className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">ADMIN CONTROL</h1>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">
            Authorized Personnel Only
          </p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-5">
          {/* Email Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Admin Identifier
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@system.com"
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-red-500/20 text-slate-900 text-sm font-semibold transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Security Key
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors">
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-red-500/20 text-slate-900 text-sm font-semibold transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="pt-4">
            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 hover:bg-red-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-red-100 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <motion.span 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  >
                    ◌
                  </motion.span> 
                  Verifying...
                </span>
              ) : (
                <>
                  Enter Terminal <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

             </motion.div>
    </div>
  );
}