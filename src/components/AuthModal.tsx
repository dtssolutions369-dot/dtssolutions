"use client";

import React, { useState } from "react";
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import toast from "react-hot-toast";

export default function AuthModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [view, setView] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);

  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (view === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        onClose();
        window.location.reload(); // Refresh to update header state
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").insert([{ id: data.user.id, full_name: fullName, email }]);
        }
        toast.success("Registration successful!");
        setView("login");
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Card */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 overflow-hidden"
          >
            <button onClick={onClose} className="absolute right-6 top-6 p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <div className="bg-[#ff3d00] w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white font-black italic shadow-lg shadow-orange-200">D</div>
              <h2 className="text-2xl font-black text-slate-900">{view === "login" ? "Welcome Back" : "Create Account"}</h2>
              <p className="text-slate-400 text-sm font-medium">Join the local shopping revolution</p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {view === "register" && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input type="text" required placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-50 py-4 pl-12 pr-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 ring-orange-500/5 transition-all" />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="email" required placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 py-4 pl-12 pr-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 ring-orange-500/5 transition-all" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 py-4 pl-12 pr-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 ring-orange-500/5 transition-all" />
                </div>
              </div>

              <button disabled={loading} className="w-full bg-[#ff3d00] text-white py-5 rounded-2xl font-black shadow-xl shadow-orange-100 flex items-center justify-center gap-2 mt-4">
                {loading ? <Loader2 className="animate-spin" /> : <>{view === "login" ? "Login" : "Register"} <ArrowRight size={18}/></>}
              </button>
            </form>

            <p className="text-center mt-6 text-sm font-bold text-slate-400">
              {view === "login" ? "New here?" : "Already have an account?"} 
              <button onClick={() => setView(view === "login" ? "register" : "login")} className="text-[#ff3d00] ml-1">
                {view === "login" ? "Create Account" : "Login Now"}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}