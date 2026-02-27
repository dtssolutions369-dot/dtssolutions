"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2, User, Mail, Phone, MapPin,
  Lock, Eye, EyeOff, ChevronRight, ShieldCheck, CheckCircle2
} from "lucide-react";

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false); // New state for registration success message

  const [formData, setFormData] = useState({
    shop_name: "", owner_name: "", email: "", phone: "",
    pincode: "", address_line: "", city: "", state: "",
    business_type: [] as string[],
    password: "", confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const toggleCategory = (type: string) => {
    setFormData(prev => ({
      ...prev,
      business_type: prev.business_type.includes(type)
        ? prev.business_type.filter(t => t !== type)
        : [...prev.business_type, type]
    }));
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading(isLogin ? "Verifying..." : "Creating account...");

    try {
      if (isLogin) {
        // 1️⃣ Find profile by phone
        const { data: profile, error: profileError } = await supabase
          .from("business_profiles")
          .select("email, status")
          .eq("phone", formData.phone)
          .single();

        if (profileError || !profile) throw new Error("Phone number not registered");
        if (profile.status === "pending") throw new Error("Account pending approval by admin");
        if (profile.status === "rejected") throw new Error("Registration rejected. Contact support.");

        // 2️⃣ Sign In
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: formData.password,
        });

        if (authError) throw authError;

        toast.success("Welcome back!", { id: toastId });
        router.push("/business/dashboard");
      } else {
        // REGISTER LOGIC
        if (formData.business_type.length === 0) throw new Error("Select a business category");
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords mismatch");

        // 1️⃣ Auth Signup
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
        });

        if (authError) throw authError;

        // Inside handleAuth -> else (Register Logic) block:
        const { error: insErr } = await supabase.from("business_profiles").insert([
          {
            user_id: authData.user?.id,
            shop_name: formData.shop_name,
            email: formData.email,
            phone: formData.phone,
            // THE TRIGGER WATCHES THESE THREE:
            pincode: formData.pincode,
            city: formData.city,
            state: formData.state,
            // Full address for your UI
            address: `${formData.address_line}, ${formData.city}, ${formData.state}`,
            business_type: formData.business_type.join(", "),
            status: "pending",
          },
        ]);

        if (insErr) throw insErr;

        toast.success("Application Sent!", { id: toastId });
        setRegSuccess(true);
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  if (regSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Registration Received</h2>
          <p className="text-slate-500 text-sm mb-8">Our team will verify your business details. You will receive an email once your account is approved.</p>
          <button onClick={() => { setRegSuccess(false); setIsLogin(true); }} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">BACK TO LOGIN</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="bg-orange-600 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200">
              <Building2 className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? "Partner Login" : "Grow With Us"}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              {isLogin ? "Manage your digital storefront" : "Register your business profile"}
            </p>
          </div>

          {/* Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-2xl mb-10 max-w-[280px] mx-auto">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${isLogin ? "bg-white shadow-sm text-orange-600" : "text-slate-400"}`}>LOGIN</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${!isLogin ? "bg-white shadow-sm text-orange-600" : "text-slate-400"}`}>REGISTER</button>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <AnimatePresence mode="wait">
              {!isLogin ? (
                <motion.div key="reg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Business Name *" name="shop_name" value={formData.shop_name} onChange={handleChange} required placeholder="Shop Name" />
                    <Field label="Owner Name *" name="owner_name" value={formData.owner_name} onChange={handleChange} required placeholder="Full Name" />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} required icon={<Mail size={16} />} placeholder="email@business.com" />
                    <Field label="Phone Number *" name="phone" value={formData.phone} onChange={handleChange} required icon={<Phone size={16} />} placeholder="10-digit number" />
                  </div>

                  <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 space-y-4">
                    <Field label="Street Address *" name="address_line" value={formData.address_line} onChange={handleChange} required icon={<MapPin size={16} />} placeholder="Building, Street, Area" />
                    <div className="grid md:grid-cols-3 gap-3">
                      <Field label="City *" name="city" value={formData.city} onChange={handleChange} required />
                      <Field label="State *" name="state" value={formData.state} onChange={handleChange} required />
                      <Field label="Pincode *" name="pincode" value={formData.pincode} onChange={handleChange} required />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Business Categories</label>
                    <div className="flex flex-wrap gap-2">
                      {['Wholesaler', 'Retailer', 'Distributor', 'Manufacturer'].map(cat => (
                        <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${formData.business_type.includes(cat) ? "bg-orange-600 border-orange-600 text-white" : "bg-white border-slate-200 text-slate-500"}`}>{cat}</button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">
                  <Field label="Registered Phone Number" name="phone" value={formData.phone} onChange={handleChange} required icon={<Phone size={18} />} placeholder="10-digit registered mobile" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative">
              <Field label="Account Password *" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required icon={<Lock size={18} />} placeholder="••••••••" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-slate-400">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {!isLogin && (
              <Field label="Confirm Password *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required icon={<Lock size={18} />} placeholder="••••••••" />
            )}

            <button disabled={loading} type="submit" className="w-full bg-slate-900 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all flex items-center justify-center gap-3 mt-4">
              {loading ? "Please Wait..." : isLogin ? "Secure Login" : "Create Business Account"}
              <ChevronRight size={16} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors">{icon}</div>}
        <input {...props} className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-orange-500 transition-all text-sm font-bold placeholder:font-normal placeholder:text-slate-300`} />
      </div>
    </div>
  );
}