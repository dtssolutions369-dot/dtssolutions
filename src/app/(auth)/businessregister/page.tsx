"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, User, Mail, Phone, MapPin, 
  Lock, Eye, EyeOff, ChevronRight, ShieldCheck 
} from "lucide-react";

export default function BusinessRegisterPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: formData.email, password: formData.password,
        });
        
        if (authError) throw authError;

        const { data: profile, error: profErr } = await supabase
          .from("business_profiles")
          .select("is_approved")
          .eq("user_id", authData.user?.id)
          .single();

        if (profErr || !profile?.is_approved) {
          await supabase.auth.signOut();
          toast.error("Account Pending Approval. Please contact admin.", { id: toastId });
          setLoading(false);
          return;
        }

        toast.success("Welcome back!", { id: toastId });
        router.push("/business/dashboard");
      } else {
        if (formData.business_type.length === 0) throw new Error("Select at least one category");
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match");

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email, password: formData.password,
        });
        if (authError) throw authError;

        const { error: insErr } = await supabase.from("business_profiles").insert([{
          user_id: authData.user?.id,
          shop_name: formData.shop_name,
          owner_name: formData.owner_name,
          email: formData.email,
          phone: formData.phone,
          pincode: formData.pincode,
          address: `${formData.address_line}, ${formData.city}, ${formData.state}`,
          business_type: formData.business_type.join(", "),
          is_approved: false,
        }]);

        if (insErr) throw insErr;
        toast.success("Registration submitted! Awaiting approval.", { id: toastId });
        setIsLogin(true);
      }
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
      <Toaster position="top-center" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden"
      >
        <div className="p-8 md:p-12">
          {/* Header Section */}
          <div className="text-center mb-10">
            <img src="/logo.png" alt="Logo" className="w-32 h-auto mx-auto mb-6" />
            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              {isLogin ? "Welcome Back" : "Partner Registration"}
            </h1>
            <p className="text-slate-500 text-sm">
              {isLogin 
                ? "Access your business dashboard and inventory" 
                : "Join our network and start growing your business today"}
            </p>
          </div>

          {/* Toggle Switch */}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-10 max-w-[300px] mx-auto">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${isLogin ? "bg-white shadow-sm text-orange-600" : "text-slate-500"}`}
            >
              LOGIN
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${!isLogin ? "bg-white shadow-sm text-orange-600" : "text-slate-500"}`}
            >
              REGISTER
            </button>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin ? (
                <motion.div 
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Shop Name *" name="shop_name" value={formData.shop_name} onChange={handleChange} required placeholder="Business Name" />
                    <Field label="Owner Name *" name="owner_name" value={formData.owner_name} onChange={handleChange} required placeholder="Legal Owner Name" />
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-5">
                    <Field label="Email Address *" type="email" name="email" value={formData.email} onChange={handleChange} required icon={<Mail size={16}/>} placeholder="business@email.com" />
                    <Field label="Phone Number *" name="phone" value={formData.phone} onChange={handleChange} required icon={<Phone size={16}/>} placeholder="10-digit number" />
                  </div>

                  <div className="bg-slate-50/80 p-6 rounded-2xl border border-slate-100 space-y-5">
                    <Field label="Street Address *" name="address_line" value={formData.address_line} onChange={handleChange} required icon={<MapPin size={16}/>} placeholder="Street, Area, Building" />
                    <div className="grid md:grid-cols-3 gap-4">
                      <Field label="City *" name="city" value={formData.city} onChange={handleChange} required placeholder="City" />
                      <Field label="State *" name="state" value={formData.state} onChange={handleChange} required placeholder="State" />
                      <Field label="Pincode *" name="pincode" value={formData.pincode} onChange={handleChange} required placeholder="Pincode" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 block">Business Category *</label>
                    <div className="flex flex-wrap gap-2">
                      {['Wholesaler', 'Dealer', 'Sub-Dealer', 'Retailer', 'Service Provider'].map(type => (
                        <button
                          key={type} type="button"
                          onClick={() => toggleCategory(type)}
                          className={`px-4 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                            formData.business_type.includes(type) 
                            ? "bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-100" 
                            : "bg-white border-slate-200 text-slate-500 hover:border-orange-300"
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  key="login"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="space-y-6"
                >
                  <Field label="Business Email" type="email" name="email" value={formData.email} onChange={handleChange} required icon={<Mail size={18}/>} placeholder="Enter registered business email" />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-6">
              <div className="relative">
                <Field label="Password *" type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} required icon={<Lock size={18}/>} placeholder="••••••••" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-10 text-slate-400 hover:text-orange-500 transition-colors">
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
              {!isLogin && (
                <Field label="Confirm Password *" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required icon={<Lock size={18}/>} placeholder="••••••••" />
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl transition-all duration-300 flex items-center justify-center gap-3 mt-8 group"
            >
              {loading ? "PROCESSING..." : isLogin ? "LOG IN TO DASHBOARD" : "SUBMIT REGISTRATION"}
              {!loading && <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>

            {isLogin && (
              <p className="text-center text-slate-400 text-[11px] font-medium mt-4">
                Forgot password? <span className="text-orange-600 cursor-pointer">Reset here</span>
              </p>
            )}
          </form>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, icon, ...props }: any) {
  return (
    <div className="space-y-1.5 w-full">
      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">{label}</label>
      <div className="relative group">
        {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-600 transition-colors">{icon}</div>}
        <input 
          {...props} 
          className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all text-sm font-medium placeholder:text-slate-300 shadow-sm`} 
        />
      </div>
    </div>
  );
}