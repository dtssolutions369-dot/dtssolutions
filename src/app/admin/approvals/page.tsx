"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, Clock, Eye, Search, 
  Loader2, Check, X, MapPin, Calendar, 
  ShieldCheck, AlertCircle, Filter, Zap, Crown
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ApprovalsPage() {
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"all" | "pending" | "rejected" | "approved">("all");
  const [selectedProfile, setSelectedProfile] = useState<any | null>(null);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("business_profiles")
        .select(`
          *,
          subscription_plans:current_plan_id (name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const results = data || [];
      setProfiles(results);
      
      setStats({
        pending: results.filter(p => p.is_approved === null).length,
        approved: results.filter(p => p.is_approved === true).length,
        rejected: results.filter(p => p.is_approved === false).length
      });

    } catch (error: any) {
      toast.error("Failed to fetch records");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, status: boolean) => {
    try {
      const { error } = await supabase
        .from("business_profiles")
        .update({ is_approved: status })
        .eq("id", id);

      if (error) throw error;
      toast.success(status ? "Business Approved" : "Business Rejected");
      fetchApprovals();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredProfiles = profiles.filter(p => {
    const search = searchQuery.toLowerCase();
    const matchesSearch = p.shop_name?.toLowerCase().includes(search) || p.owner_name?.toLowerCase().includes(search);
    
    if (filterTab === "pending") return matchesSearch && p.is_approved === null;
    if (filterTab === "rejected") return matchesSearch && p.is_approved === false;
    if (filterTab === "approved") return matchesSearch && p.is_approved === true;
    return matchesSearch;
  });

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-6 bg-[#f8fafc] min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Approvals</h1>
          <p className="text-slate-500 text-sm font-medium">Verify business authenticity and plan status</p>
        </div>

        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                filterTab === tab ? 'bg-orange-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Review Required" value={stats.pending} icon={<Clock className="text-orange-500" />} color="border-orange-500" />
        <StatCard label="Live Partners" value={stats.approved} icon={<CheckCircle className="text-green-500" />} color="border-green-500" />
        <StatCard label="Declined" value={stats.rejected} icon={<X className="text-red-500" />} color="border-red-500" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search businesses..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm focus:ring-2 ring-orange-500/20"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
                <th className="p-6">Business</th>
                <th className="p-6">Plan Status</th>
                <th className="p-6">Expiry</th>
                <th className="p-6">KYC Status</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-20"><Loader2 className="animate-spin mx-auto text-orange-500" /></td></tr>
              ) : filteredProfiles.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-20 text-slate-400 font-bold">No records found matching filters</td></tr>
              ) : filteredProfiles.map((item) => {
                const isTrial = item.subscription_status === 'trial';
                const planName = item.subscription_plans?.name || (isTrial ? "Free Trial" : "Expired");
                const expiryDate = item.subscription_end_date || item.trial_end_date;

                return (
                  <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="p-6">
                      <div className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{item.shop_name}</div>
                      <div className="text-[11px] text-slate-400 font-bold uppercase">{item.owner_name}</div>
                    </td>
                    <td className="p-6">
                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        isTrial ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {isTrial ? <Zap size={12}/> : <Crown size={12}/>}
                        {planName}
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-bold text-slate-700">{new Date(expiryDate).toLocaleDateString('en-GB')}</div>
                      <div className="text-[9px] text-slate-400 font-black uppercase">{isTrial ? 'Trial End' : 'Subscription End'}</div>
                    </td>
                    <td className="p-6">
                      <StatusBadge status={item.is_approved} />
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => setSelectedProfile(item)} className="p-2.5 bg-slate-50 text-slate-400 hover:bg-slate-900 hover:text-white rounded-xl transition-all shadow-sm">
                          <Eye size={16}/>
                        </button>
                        {item.is_approved !== true && (
                            <button onClick={() => handleAction(item.id, true)} className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all shadow-sm">
                                <Check size={16}/>
                            </button>
                        )}
                        {item.is_approved !== false && (
                            <button onClick={() => handleAction(item.id, false)} className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm">
                                <X size={16}/>
                            </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedProfile && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden">
                    <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <div>
                            <h3 className="font-black text-xl text-slate-900">Business Verification</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">ID: {selectedProfile.id.slice(0,8)}</p>
                        </div>
                        <button onClick={() => setSelectedProfile(null)} className="p-3 hover:bg-white rounded-2xl transition-all text-slate-400 hover:text-slate-900 shadow-sm"><X size={20}/></button>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <ModalInfo label="Shop Name" value={selectedProfile.shop_name} />
                            <ModalInfo label="Owner Name" value={selectedProfile.owner_name} />
                            <ModalInfo label="Contact Phone" value={selectedProfile.phone} />
                            <ModalInfo label="Email Address" value={selectedProfile.email} />
                        </div>

                        <div className="p-6 bg-orange-50 rounded-3xl border border-orange-100 grid grid-cols-2 gap-4">
                            <ModalInfo label="Current Plan" value={selectedProfile.subscription_plans?.name || (selectedProfile.subscription_status === 'trial' ? 'Free Trial' : 'N/A')} />
                            <ModalInfo label="Plan Expiry" value={new Date(selectedProfile.subscription_end_date || selectedProfile.trial_end_date).toLocaleDateString()} />
                        </div>

                        <ModalInfo label="Business Address" value={selectedProfile.address} />
                    </div>

                    <div className="p-8 bg-slate-50 flex gap-4">
                        <button 
                            onClick={() => { handleAction(selectedProfile.id, true); setSelectedProfile(null); }} 
                            className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-green-200 hover:bg-green-700 transition-all"
                        >
                            Approve Access
                        </button>
                        <button 
                            onClick={() => { handleAction(selectedProfile.id, false); setSelectedProfile(null); }} 
                            className="flex-1 bg-white border-2 border-slate-200 text-slate-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
                        >
                            Reject Request
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className={`bg-white p-6 rounded-[2rem] border border-slate-100 border-l-[8px] ${color} shadow-sm flex items-center justify-between transition-transform hover:scale-[1.02]`}>
      <div className="flex items-center gap-5">
        <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: any }) {
    if (status === true) return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase rounded-lg border border-green-100">
            <Check size={12} strokeWidth={3}/> Approved
        </span>
    );
    if (status === false) return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 text-[10px] font-black uppercase rounded-lg border border-red-100">
            <X size={12} strokeWidth={3}/> Rejected
        </span>
    );
    return (
        <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 text-[10px] font-black uppercase rounded-lg border border-amber-100">
            <Clock size={12} strokeWidth={3}/> Pending
        </span>
    );
}

function ModalInfo({ label, value }: any) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{label}</span>
            <span className="text-slate-800 font-bold text-sm leading-tight">{value || 'Not Provided'}</span>
        </div>
    );
}