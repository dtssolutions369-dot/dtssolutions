"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Trash2, Plus, CheckCircle2, ShieldCheck, 
  Edit3, X, RefreshCw, AlertCircle, Zap, Search,
  LayoutGrid
} from "lucide-react";

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        name: "",
        base_price: "",
        tax_percent: "",
        duration_months: "",
        color: "#64748b",
        medals: "",
    });
    const [benefits, setBenefits] = useState<string[]>([""]);

    useEffect(() => { fetchPlans(); }, []);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("subscription_plans").select("*");
        if (error) {
            showToast(error.message, 'error');
            setLoading(false);
            return;
        }
        const sortedData = (data || []).sort((a, b) => {
            const totalA = a.base_price * (1 + (a.tax_percent || 0) / 100);
            const totalB = b.base_price * (1 + (b.tax_percent || 0) / 100);
            return totalA - totalB;
        });
        setPlans(sortedData);
        setLoading(false);
    };

    const handleEditClick = (plan: any) => {
        setEditingId(plan.id);
        setForm({
            name: plan.name,
            base_price: plan.base_price.toString(),
            tax_percent: plan.tax_percent.toString(),
            duration_months: plan.duration_months.toString(),
            color: plan.color || "#64748b",
            medals: plan.medals || "",
        });
        setBenefits(plan.benefits && plan.benefits.length > 0 ? plan.benefits : [""]);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ 
            name: "", base_price: "", tax_percent: "", 
            duration_months: "", color: "#64748b", medals: "" 
        });
        setBenefits([""]);
        setShowModal(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredBenefits = benefits.filter((b) => b.trim() !== "");
        if (!form.name.trim() || !form.base_price || !form.duration_months || filteredBenefits.length === 0) {
            showToast("Required fields missing", "error");
            return;
        }
        setSaving(true);
        const payload = {
            name: form.name.trim(),
            base_price: Number(form.base_price),
            tax_percent: Number(form.tax_percent || 0),
            duration_months: Number(form.duration_months),
            color: form.color,
            benefits: filteredBenefits,
            medals: form.medals.trim(),
        };
        const { error } = editingId 
            ? await supabase.from("subscription_plans").update(payload).eq("id", editingId)
            : await supabase.from("subscription_plans").insert(payload);

        if (error) showToast(error.message, "error");
        else {
            showToast(`Plan ${editingId ? 'updated' : 'deployed'} successfully`, "success");
            resetForm();
            fetchPlans();
        }
        setSaving(false);
    };

    const handleDeletePlan = async (planId: number) => {
        if (!confirm("Remove this subscription tier?")) return;
        const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
        if (error) showToast(error.message, "error");
        else { showToast("Plan removed", "success"); fetchPlans(); }
    };

    const filteredPlans = plans.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20 text-slate-900">
            {/* TOAST SYSTEM */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-red-600 border-red-700 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={20} /> : <AlertCircle size={20} />}
                    <span className="text-xs font-bold uppercase tracking-widest">{toast.msg}</span>
                </div>
            )}

            {/* --- REFINED GREY HEADER --- */}
            <div className="bg-white border-b border-slate-100 pt-10 pb-20 px-6 md:px-10 relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-2 bg-white rounded-lg border border-slate-200">
                                        <ShieldCheck className="text-slate-400" size={16} />
                                    </div>
                                    <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Billing Management</span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                                    Subscription <span className="font-semibold text-slate-400">Plans</span>
                                </h1>
                                <p className="text-slate-500 text-sm max-w-md font-medium opacity-80 leading-relaxed">
                                    Configure service tiers, pricing models, and access benefits.
                                </p>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="bg-white p-6 rounded-3xl border border-slate-200 min-w-[140px] shadow-sm">
                                    <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Active Tiers</p>
                                    <p className="text-4xl font-semibold text-slate-900 tracking-tighter">{plans.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ACTION BAR --- */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
                <div className="bg-white p-4 rounded-[2rem] shadow-xl flex flex-col md:flex-row gap-4 items-center border border-slate-100">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Filter tiers by name..." 
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:border-slate-200 focus:bg-white outline-none text-sm font-bold text-slate-900 transition-all"
                        />
                    </div>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
                        <Plus size={18} /> New Tier
                    </button>
                </div>
            </div>

            {/* --- PLANS GRID --- */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <RefreshCw className="animate-spin text-slate-400" size={32} />
                        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Accessing Ledger...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPlans.map((plan) => {
                            const total = plan.base_price * (1 + (plan.tax_percent || 0) / 100);
                            return (
                                <div key={plan.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-slate-200 transition-all group flex flex-col relative">
                                    <div className="h-2 w-full" style={{ backgroundColor: plan.color || '#64748b' }} />
                                    <div className="p-8 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tier Level</span>
                                                    {plan.medals && <span className="text-xs">{plan.medals}</span>}
                                                </div>
                                                <h3 className="font-bold text-slate-900 uppercase truncate text-2xl tracking-tight leading-none">{plan.name}</h3>
                                            </div>
                                            <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                                                <Zap size={18} style={{ color: plan.color }} fill="currentColor" />
                                            </div>
                                        </div>

                                        <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-bold text-slate-900 tracking-tighter">₹{total.toFixed(0)}</span>
                                                <span className="text-slate-400 text-[10px] font-bold uppercase">/ {plan.duration_months}m</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Net of {plan.tax_percent}% Tax</p>
                                        </div>

                                        <div className="space-y-3 pb-8">
                                            {plan.benefits?.map((b: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <div className="p-0.5 bg-emerald-50 rounded-full">
                                                        <CheckCircle2 size={14} className="text-emerald-500" />
                                                    </div>
                                                    <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{b}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="px-8 pb-8 flex gap-3">
                                        <button onClick={() => handleEditClick(plan)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                                            <Edit3 size={14} /> Update
                                        </button>
                                        <button onClick={() => handleDeletePlan(plan.id)} className="w-14 flex items-center justify-center py-4 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* --- MODAL (GREY THEME) --- */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
                    <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-8">
                        <div className="bg-slate-50 px-10 py-8 flex items-center justify-between border-b border-slate-100">
                            <div>
                                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Tier Architect</p>
                                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{editingId ? "Modify Existing Tier" : "Create New Tier"}</h3>
                            </div>
                            <button onClick={resetForm} className="w-12 h-12 hover:bg-white rounded-full flex items-center justify-center transition-colors text-slate-400 border border-transparent hover:border-slate-100"><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex flex-col md:flex-row divide-x divide-slate-100">
                            <div className="flex-1 p-10 space-y-6">
                                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Basic Specifications</h4>
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Tier Name</label>
                                        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none text-sm font-medium text-slate-900 transition-all" placeholder="e.g. Premium Pro" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Base Price (₹)</label>
                                            <input required type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Tax (%)</label>
                                            <input type="number" value={form.tax_percent} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Months</label>
                                            <input required type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium" />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Emoji Medal</label>
                                            <input value={form.medals} onChange={(e) => setForm({ ...form, medals: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-medium text-center" placeholder="⭐" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Accent Theme</label>
                                        <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                                            <span className="text-xs font-mono font-bold text-slate-400">{form.color.toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-10 flex flex-col">
                                <div className="flex items-center justify-between mb-6">
                                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tier Benefits</h4>
                                    <button type="button" onClick={() => setBenefits([...benefits, ""])} className="text-[10px] font-bold uppercase bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-black transition-all flex items-center gap-1.5">
                                        <Plus size={12} /> Add Perk
                                    </button>
                                </div>
                                <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
                                    {benefits.map((b, idx) => (
                                        <div key={idx} className="flex gap-2">
                                            <input required placeholder="Benefit details..." value={b} onChange={(e) => {
                                                const updated = [...benefits];
                                                updated[idx] = e.target.value;
                                                setBenefits(updated);
                                            }} className="flex-1 px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl outline-none text-xs font-medium focus:bg-white" />
                                            <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-10 flex gap-4">
                                    <button type="button" onClick={resetForm} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
                                    <button type="submit" disabled={saving} className="flex-[2] py-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                                        {saving ? <RefreshCw className="animate-spin" size={18} /> : <ShieldCheck size={18} />}
                                        {editingId ? "Update Tier" : "Deploy Tier"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}