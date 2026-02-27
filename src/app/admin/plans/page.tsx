"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Edit2, Trash2, X, Trash, Crown, Zap,
  Target, Rocket, ShieldCheck, Loader2, AlertTriangle, Calendar
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    base_price: 0,
    tax_percent: 0,
    duration_months: 1, // Now controlled by numeric input
    benefits: [""] as string[],
    is_popular: false
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

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from("subscription_plans")
        .delete()
        .eq("id", deleteId);

      if (error) throw error;
      
      toast.success("Plan deleted permanently");
      setDeleteId(null);
      fetchPlans();
    } catch (error: any) {
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePopular = async (planId: number, currentStatus: boolean) => {
    try {
      await supabase.from("subscription_plans").update({ is_popular: false }).neq("id", -1);
      if (!currentStatus) {
        const { error } = await supabase.from("subscription_plans").update({ is_popular: true }).eq("id", planId);
        if (error) throw error;
        toast.success("Popularity status updated");
      }
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message);
    }
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
        toast.success("Plan updated");
      } else {
        const { error } = await supabase.from("subscription_plans").insert([payload]);
        if (error) throw error;
        toast.success("New tier created");
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (plan: any) => {
    setEditId(plan.id);
    setFormData({
      name: plan.name,
      base_price: plan.base_price,
      tax_percent: plan.tax_percent,
      duration_months: plan.duration_months,
      benefits: plan.benefits || [""],
      is_popular: plan.is_popular
    });
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-[1600px] mx-auto px-6 py-8 flex justify-between items-center">
          <div>
            <span className="text-[#ff3d00] font-black text-[10px] uppercase tracking-[0.4em]">Administration</span>
            <h1 className="text-3xl font-black tracking-tight mt-1">Subscription Tiers</h1>
          </div>
          <button
            onClick={() => { setEditId(null); setFormData({ name: "", base_price: 0, tax_percent: 0, duration_months: 1, benefits: [""], is_popular: false }); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center gap-2 hover:bg-black transition-all active:scale-95"
          >
            <Plus size={18} /> Add New Plan
          </button>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="max-w-[1600px] mx-auto px-6 mt-10 pb-20">
        {loading ? (
          <div className="flex justify-center py-40"><Loader2 className="animate-spin text-[#ff3d00]" size={48} /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <motion.div layout key={plan.id} className={`bg-white rounded-[2.5rem] p-8 border-2 transition-all hover:shadow-xl ${plan.is_popular ? 'border-[#ff3d00]' : 'border-white shadow-sm'}`}>
                <div className="flex flex-col items-center text-center mb-8">
                  <h3 className="text-2xl font-black">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-3">
                    <span className="text-5xl font-black italic tracking-tighter">₹{plan.base_price + (plan.base_price * plan.tax_percent / 100)}</span>
                    <span className="text-slate-400 font-bold text-sm">/{plan.duration_months}mo</span>
                  </div>
                </div>

                <div className="space-y-4 mb-10 min-h-[150px]">
                  {plan.benefits?.map((b: string, i: number) => (
                    <div key={i} className="flex gap-3 bg-slate-50/50 p-3 rounded-xl border border-transparent hover:border-slate-100">
                      <ShieldCheck size={18} className="text-[#ff3d00]" />
                      <span className="text-sm font-semibold text-slate-600">{b}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => togglePopular(plan.id, plan.is_popular)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest border transition-all ${plan.is_popular ? 'bg-[#ff3d00] text-white shadow-lg shadow-orange-100' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-900 hover:text-slate-900'}`}
                  >
                    {plan.is_popular ? "Unmark Popular" : "Mark Popular"}
                  </button>
                  <div className="flex gap-3">
                    <button onClick={() => openEditModal(plan)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all">
                      <Edit2 size={14} /> Edit
                    </button>
                    <button onClick={() => setDeleteId(plan.id)} className="p-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE CONFIRMATION PIP */}
      <AnimatePresence>
        {deleteId && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white max-w-sm w-full rounded-[2.5rem] p-8 text-center shadow-3xl">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">Delete Plan?</h2>
              <p className="text-slate-500 font-medium mb-8 text-sm leading-relaxed">This action cannot be undone. This plan will be removed for all new users.</p>
              <div className="flex flex-col gap-3">
                <button onClick={handleDelete} disabled={isSubmitting} className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-all shadow-lg shadow-red-100">
                  {isSubmitting ? "Deleting..." : "YES, DELETE"}
                </button>
                <button onClick={() => setDeleteId(null)} className="w-full bg-slate-100 text-slate-900 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">CANCEL</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PLAN FORM MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-[3rem] p-10 shadow-3xl overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-black">{editId ? 'Edit Plan' : 'New Plan'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Plan Name</label>
                  <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-[#ff3d00] focus:bg-white transition-all" placeholder="e.g. Pro Monthly" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Price (₹)</label>
                    <input required type="number" value={formData.base_price} onChange={e => setFormData({ ...formData, base_price: Number(e.target.value) })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-slate-200 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tax %</label>
                    <input type="number" value={formData.tax_percent} onChange={e => setFormData({ ...formData, tax_percent: Number(e.target.value) })} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-slate-200 transition-all" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Months</label>
                    <div className="relative">
                      <input 
                        required 
                        type="number" 
                        min="1"
                        value={formData.duration_months} 
                        onChange={e => setFormData({ ...formData, duration_months: Number(e.target.value) })} 
                        className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:bg-white border-2 border-transparent focus:border-slate-200 transition-all pr-12" 
                      />
                      <Calendar className="absolute right-4 top-4 text-slate-300" size={20} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Key Benefits</label>
                  {formData.benefits.map((b, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={b} onChange={e => {
                        const newB = [...formData.benefits];
                        newB[i] = e.target.value;
                        setFormData({ ...formData, benefits: newB });
                      }} className="flex-1 p-4 bg-slate-50 rounded-xl text-sm font-semibold outline-none focus:bg-white border-2 border-transparent focus:border-slate-100 transition-all" placeholder="Enter benefit..." />
                      <button type="button" onClick={() => setFormData({ ...formData, benefits: formData.benefits.filter((_, idx) => idx !== i) })} className="p-4 text-red-400 hover:bg-red-50 rounded-xl transition-all">
                        <Trash size={18} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData({ ...formData, benefits: [...formData.benefits, ""] })} className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold hover:border-[#ff3d00] hover:text-[#ff3d00] transition-all hover:bg-orange-50/30">
                    + Add New Benefit
                  </button>
                </div>

                <button disabled={isSubmitting} className="w-full bg-[#ff3d00] text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-orange-100 hover:bg-black transition-all active:scale-[0.98]">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "CONFIRM & SAVE TIER"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}