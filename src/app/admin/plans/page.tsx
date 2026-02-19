"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Edit2, Trash2, Check, Star, 
  Loader2, X, Trash, Crown, Zap, 
  Target, Rocket, ShieldCheck,
  Settings, Users, CreditCard, Activity, Globe
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    base_price: 0,
    duration_months: 1,
    benefits: [""] as string[],
    is_popular: false,
    color: "#ff3d00"
  });

  useEffect(() => { fetchPlans(); }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("base_price", { ascending: true });
      if (error) throw error;
      setPlans(data || []);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const togglePopular = async (planId: number, currentStatus: boolean) => {
    try {
      await supabase.from("subscription_plans").update({ is_popular: false }).neq("id", -1); 
      if (!currentStatus) {
        const { error } = await supabase.from("subscription_plans").update({ is_popular: true }).eq("id", planId);
        if (error) throw error;
        toast.success("Most Popular tier updated");
      }
      fetchPlans();
    } catch (error: any) {
      toast.error("Update failed: " + error.message);
    }
  };

  const addBenefitField = () => setFormData({ ...formData, benefits: [...formData.benefits, ""] });
  const removeBenefitField = (index: number) => {
    setFormData({ ...formData, benefits: formData.benefits.filter((_, i) => i !== index) });
  };
  const updateBenefitValue = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const cleanedBenefits = formData.benefits.filter(b => b.trim() !== "");
      const payload = { ...formData, benefits: cleanedBenefits };

      if (editId) {
        const { error } = await supabase.from("subscription_plans").update(payload).eq("id", editId);
        if (error) throw error;
        toast.success("Plan updated successfully");
      } else {
        const { error } = await supabase.from("subscription_plans").insert([payload]);
        if (error) throw error;
        toast.success("New tier launched!");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddModal = () => {
    setEditId(null);
    setFormData({ name: "", base_price: 0, duration_months: 1, benefits: [""], is_popular: false, color: "#ff3d00" });
    setIsModalOpen(true);
  };

  const openEditModal = (plan: any) => {
    setEditId(plan.id);
    setFormData({ ...plan, benefits: plan.benefits || [""] });
    setIsModalOpen(true);
  };

  const getPlanIcon = (price: number) => {
    if (price === 0) return <Target size={28} />;
    if (price < 1000) return <Rocket size={28} />;
    if (price < 5000) return <Zap size={28} />;
    return <Crown size={28} />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Toaster position="top-right" />
      
      {/* HEADER SECTION - REMOVED TOP MARGIN */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <span className="text-[#ff3d00] font-black text-[10px] uppercase tracking-[0.4em]">Administration</span>
            <h1 className="text-3xl font-black tracking-tight mt-1">Subscription Tiers</h1>
          </div>
          <button 
            onClick={openAddModal}
            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 transition-all hover:bg-black active:scale-95 shadow-xl shadow-slate-200"
          >
            <Plus size={18} /> Add New Plan
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 mt-10">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {plans.map((plan) => (
              <motion.div 
                layout
                key={plan.id} 
                className={`group relative bg-white rounded-[2.5rem] p-8 border-2 transition-all hover:shadow-2xl ${plan.is_popular ? 'border-[#ff3d00]' : 'border-white shadow-sm'}`}
              >
                {plan.is_popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#ff3d00] text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl ring-4 ring-[#F8FAFC]">
                    Best Value
                  </div>
                )}
                
                <div className="flex flex-col items-center text-center mb-8">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${plan.is_popular ? 'bg-orange-50 text-[#ff3d00]' : 'bg-slate-50 text-slate-400'}`}>
                     {getPlanIcon(plan.base_price)}
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-5xl font-black italic tracking-tighter">₹{plan.base_price}</span>
                    <span className="text-slate-400 font-bold text-sm">/mo</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-10 min-h-[180px]">
                  {plan.benefits?.map((benefit: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-slate-50/50 p-3 rounded-xl border border-transparent">
                      <ShieldCheck size={18} className="text-[#ff3d00] shrink-0" />
                      <span className="text-sm font-semibold text-slate-600 leading-snug">{benefit}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button 
                    onClick={() => togglePopular(plan.id, plan.is_popular)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] border transition-all ${
                      plan.is_popular 
                        ? 'bg-[#ff3d00] border-[#ff3d00] text-white shadow-lg shadow-orange-200' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-900 hover:text-slate-900'
                    }`}
                  >
                    {plan.is_popular ? "Remove Mark as Popular" : "Mark as Popular"}
                  </button>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={() => openEditModal(plan)}
                      className="flex-1 py-3 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => { if(confirm("Delete this plan?")) supabase.from("subscription_plans").delete().eq("id", plan.id).then(() => fetchPlans()) }}
                      className="p-3 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-xl transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL DESIGN */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }} 
              className="bg-white w-full max-w-2xl rounded-[3rem] p-12 shadow-3xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-black tracking-tight">{editId ? 'Refine Plan' : 'New Tier'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Display Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#ff3d00] focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg" placeholder="Gold Plan" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Price (₹)</label>
                    <input required type="number" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: Number(e.target.value)})} className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-[#ff3d00] focus:bg-white rounded-[1.5rem] outline-none transition-all font-bold text-lg" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Core Benefits</label>
                  <div className="space-y-3">
                    {formData.benefits.map((benefit, index) => (
                      <div key={index} className="flex gap-3">
                        <input value={benefit} onChange={(e) => updateBenefitValue(index, e.target.value)} className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none font-semibold" placeholder="Unlimited Access" />
                        <button type="button" onClick={() => removeBenefitField(index)} className="p-4 text-red-400 hover:bg-red-50 rounded-2xl transition-all"><Trash size={20}/></button>
                      </div>
                    ))}
                    <button type="button" onClick={addBenefitField} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[#ff3d00] hover:text-[#ff3d00] transition-all">+ Add Benefit</button>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-slate-50 rounded-[2rem] cursor-pointer" onClick={() => setFormData({...formData, is_popular: !formData.is_popular})}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center border-2 transition-all ${formData.is_popular ? 'bg-[#ff3d00] border-[#ff3d00]' : 'border-slate-200 bg-white'}`}>
                    {formData.is_popular && <Check size={18} className="text-white" strokeWidth={3} />}
                  </div>
                  <div>
                    <span className="block text-sm font-black text-slate-800">Highlight as Best Value</span>
                  </div>
                </div>

                <button disabled={isSubmitting} className="w-full bg-[#ff3d00] text-white py-6 rounded-[2rem] font-black text-lg shadow-2xl shadow-orange-200 hover:bg-black transition-all">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "SAVE CHANGES"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// HELPER FOR ICON BAR
function QuickAction({ icon, label }: { icon: React.ReactNode, label: string }) {
    return (
        <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors whitespace-nowrap">
            <span className="p-2 bg-slate-50 rounded-xl">{icon}</span>
            <span className="text-xs font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}