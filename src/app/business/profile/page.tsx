"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Store, Mail, User, Phone, MapPin, 
  Save, Edit3, Loader2, CheckCircle2, 
  Clock, ShieldCheck, ChevronRight,
  LayoutDashboard, Building2, AlignLeft,
  X, Briefcase, Crown, Zap
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function BusinessProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [trialStats, setTrialStats] = useState({ daysLeft: 0, percentage: 0 });

  const categories = ['Wholesaler', 'Dealer', 'Sub-Dealer', 'Retailer', 'Service Provider'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (error) throw error;
      
      const typeArray = data.business_type ? data.business_type.split(", ") : [];
      setProfile({ ...data, business_type_array: typeArray });
      calculateTrial(data.trial_start_date, data.trial_end_date);
    } catch (error: any) {
      toast.error("Error loading profile");
    } finally {
      setLoading(false);
    }
  };

  const calculateTrial = (startStr: string, endStr: string) => {
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    const now = new Date().getTime();
    const daysLeft = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
    const percentage = Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
    setTrialStats({ daysLeft, percentage });
  };

  const toggleCategory = (type: string) => {
    if (!isEditing) return;
    const current = profile.business_type_array || [];
    const updated = current.includes(type)
      ? current.filter((t: string) => t !== type)
      : [...current, type];
    setProfile({ ...profile, business_type_array: updated });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("business_profiles")
        .update({
          owner_name: profile.owner_name,
          phone: profile.phone,
          pincode: profile.pincode,
          address: profile.address,
          description: profile.description,
          business_type: profile.business_type_array.join(", "),
        })
        .eq("id", profile.id);

      if (error) throw error;
      toast.success("Profile synchronized successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  // SUBSCRIPTION LOGIC
  const isPremium = profile?.subscription_status === 'active';

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#FDFCFB]">
      <div className="relative flex items-center justify-center">
        <Loader2 className="animate-spin text-[#FF3D00]" size={48} />
        <div className="absolute inset-0 blur-2xl bg-orange-200/50 animate-pulse rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFB] pb-20 font-sans selection:bg-orange-100">
      <Toaster position="bottom-right" />
      
      {/* HEADER SECTION */}
      <div className="bg-slate-900 pt-16 pb-32 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-tr from-[#FF3D00] to-[#FF8A00] rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/20 rotate-3">
                    <Store className="text-white" size={36} />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-slate-900 w-8 h-8 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="text-white" size={14} />
                </div>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">{profile?.shop_name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black text-orange-400 uppercase tracking-widest border border-white/10 italic">
                  {isPremium ? 'Premium Merchant' : 'Trial Member'}
                </span>
                <span className="text-slate-400 text-xs font-medium flex items-center gap-1">
                  <Mail size={12} /> {profile?.email}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* THE SUBSCRIPTION STATUS PILL ADDED HERE */}
            <div className="hidden sm:flex items-center gap-3 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-2xl">
               {isPremium ? <Crown size={18} className="text-orange-400" /> : <Zap size={18} className="text-orange-400" />}
               <div className="h-8 w-[1px] bg-white/10 mx-1" />
               <div className="text-right leading-none">
                <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">
                  {isPremium ? "Next Renewal" : "Trial Ends"}
                </p>
                <p className="text-xs font-bold">
                  {(() => {
                    const dateToDisplay = isPremium ? profile.subscription_end_date : profile.trial_end_date;
                    if (!dateToDisplay) return "N/A";
                    return new Date(dateToDisplay).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    });
                  })()}
                </p>
              </div>
            </div>

            <button 
              onClick={() => setIsEditing(!isEditing)}
              className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.15em] transition-all flex items-center gap-3 ${
                isEditing ? "bg-white text-slate-900" : "bg-[#FF3D00] text-white hover:bg-[#E63600] shadow-xl shadow-orange-900/20"
              }`}
            >
              {isEditing ? <><X size={16} /> Cancel</> : <><Edit3 size={16} /> Edit Profile</>}
            </button>
          </div>
        </div>
      </div>

      {/* BENTO GRID CONTENT */}
      <div className="max-w-6xl mx-auto px-6 -mt-16">
        <form onSubmit={handleUpdate} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: PRIMARY INFO */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-1.5 h-6 bg-[#FF3D00] rounded-full" />
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Core Credentials</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-x-10 gap-y-8">
                <ProfileField label="Registered Shop" value={profile?.shop_name} icon={<Building2 size={18}/>} readOnly />
                <ProfileField label="Owner Full Name" name="owner_name" value={profile?.owner_name} isEditing={isEditing} icon={<User size={18}/>} onChange={(e: any) => setProfile({...profile, owner_name: e.target.value})} />
                <ProfileField label="Business Contact" name="phone" value={profile?.phone} isEditing={isEditing} icon={<Phone size={18}/>} onChange={(e: any) => setProfile({...profile, phone: e.target.value})} />
                <ProfileField label="Pincode / Zip" name="pincode" value={profile?.pincode} isEditing={isEditing} icon={<MapPin size={18}/>} onChange={(e: any) => setProfile({...profile, pincode: e.target.value})} />
              </div>

              <div className="mt-10 pt-10 border-t border-slate-50">
                 <ProfileField label="Full Physical Address" name="address" value={profile?.address} isEditing={isEditing} icon={<MapPin size={18}/>} onChange={(e: any) => setProfile({...profile, address: e.target.value})} />
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-1.5 h-6 bg-[#FF3D00] rounded-full" />
                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Business Nature</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {categories.map(type => (
                    <button 
                      key={type} 
                      type="button" 
                      onClick={() => toggleCategory(type)} 
                      className={`px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border ${
                        profile?.business_type_array?.includes(type) 
                        ? "bg-[#FF3D00] border-[#FF3D00] text-white shadow-lg shadow-orange-100" 
                        : "bg-slate-50 border-slate-100 text-slate-400 hover:border-orange-200"
                      } ${!isEditing && "cursor-default opacity-80"}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STATUS & ACTION */}
          <div className="space-y-8">
            
            {/* ACTION CENTER - ONLY SHOWS WHEN EDITING */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200"
                    >
                        <h3 className="font-black uppercase tracking-widest text-[10px] text-orange-400 mb-4">Action Center</h3>
                        <p className="text-slate-400 text-sm leading-relaxed mb-8">Save details to sync your shop with the public marketplace.</p>
                        <button 
                            disabled={saving}
                            onClick={handleUpdate}
                            className="w-full bg-[#FF3D00] py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#FF5722] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Sync Changes</>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TRIAL/SUBSCRIPTION STATUS CARD */}
            <div className={`rounded-[2.5rem] p-8 text-white ${isPremium ? 'bg-slate-800' : 'bg-gradient-to-b from-[#FF8A00] to-[#FF3D00]'}`}>
                <div className="flex justify-between items-start mb-12">
                    <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                        {isPremium ? <Crown size={24} /> : <Clock size={24} />}
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase opacity-60">Status</p>
                        <p className="text-sm font-black italic underline decoration-2">
                          {isPremium ? 'Premium Active' : 'Trial Period'}
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {!isPremium ? (
                      <div>
                        <div className="flex justify-between items-end mb-3">
                            <span className="text-4xl font-black">{trialStats.daysLeft}</span>
                            <span className="text-xs font-black uppercase opacity-60 pb-1">Days Remaining</span>
                        </div>
                        <div className="h-3 w-full bg-black/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${100 - trialStats.percentage}%` }}
                                className="h-full bg-white rounded-full shadow-sm"
                            />
                        </div>
                      </div>
                    ) : (
                      <div className="py-2">
                        <p className="text-xs font-bold opacity-80 leading-relaxed">Your premium business features are currently active and visible to all customers.</p>
                      </div>
                    )}
                    
                    <div className="pt-6 grid grid-cols-2 gap-4 border-t border-white/10">
                        <div>
                            <p className="text-[8px] font-black uppercase opacity-60">
                              {isPremium ? 'Activated' : 'Started'}
                            </p>
                            <p className="text-[10px] font-bold">
                              {new Date(isPremium ? profile.subscription_start_date : profile.trial_start_date).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[8px] font-black uppercase opacity-60">
                              {isPremium ? 'Renews' : 'Expires'}
                            </p>
                            <p className="text-[10px] font-bold">
                              {new Date(isPremium ? profile.subscription_end_date : profile.trial_end_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECURITY/VERIFICATION CARD */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${profile?.is_approved ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                        {profile?.is_approved ? <ShieldCheck /> : <Clock />}
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Verification</p>
                        <p className="text-sm font-black text-slate-900">{profile?.is_approved ? "Fully Verified" : "Review Pending"}</p>
                    </div>
                 </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProfileField({ label, icon, readOnly, isEditing, isTextArea, value, onChange, ...props }: any) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] ml-1">{label}</label>
      <div className="relative group">
        {icon && (
          <div className={`absolute left-5 ${isTextArea ? 'top-5' : 'top-1/2 -translate-y-1/2'} transition-colors ${
            isEditing ? 'text-[#FF3D00]' : 'text-slate-300'
          }`}>
            {icon}
          </div>
        )}
        
        {isEditing && !readOnly ? (
          isTextArea ? (
            <textarea
              {...props}
              value={value || ""}
              onChange={onChange}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#FF3D00] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-800"
              rows={4}
            />
          ) : (
            <input
              {...props}
              value={value || ""}
              onChange={onChange}
              className="w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-3xl outline-none focus:bg-white focus:border-[#FF3D00] focus:ring-4 focus:ring-orange-50 transition-all text-sm font-bold text-slate-800"
            />
          )
        ) : (
          <div className={`w-full pl-14 pr-6 py-5 rounded-3xl border transition-all text-sm font-bold flex items-center min-h-[60px] ${
            readOnly ? 'bg-slate-50/50 border-slate-100 text-slate-400' : 'bg-white border-slate-100 text-slate-700'
          }`}>
            {value || <span className="text-slate-300 italic font-normal text-xs uppercase tracking-widest">Not set</span>}
          </div>
        )}
      </div>
    </div>
  );
}