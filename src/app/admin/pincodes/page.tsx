"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Search, Edit2, Trash2, 
  MapPin, Globe, Store, Loader2, X, Check
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminPincodes() {
  const [loading, setLoading] = useState(true);
  const [pincodes, setPincodes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    pincode: "",
    area_locality: "",
    city: "Delhi",
    state: "Delhi",
    is_active: true
  });

  const [stats, setStats] = useState({ total: 0, active: 0, businesses: 0 });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch managed Pincodes
      const { data: pins, error: pinError } = await supabase
        .from("pincodes")
        .select("*")
        .order("pincode", { ascending: true });

      if (pinError) throw pinError;

      // 2. Fetch all unique pincodes used in Business Profiles
      const { data: profiles, error: profileError } = await supabase
        .from("business_profiles")
        .select("pincode");

      if (profileError) throw profileError;

      // 3. Merge Logic: Ensure we show counts and capture "unmanaged" pincodes from businesses
      const businessCounts = profiles.reduce((acc: any, curr) => {
        if (curr.pincode) acc[curr.pincode] = (acc[curr.pincode] || 0) + 1;
        return acc;
      }, {});

      const mergedData = pins.map(p => ({
        ...p,
        business_count: businessCounts[p.pincode] || 0
      }));

      setPincodes(mergedData);
      setStats({
        total: pins.length,
        active: pins.filter(p => p.is_active).length,
        businesses: profiles.length
      });

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editId) {
        const { error } = await supabase.from("pincodes").update(formData).eq("id", editId);
        if (error) throw error;
        toast.success("Pincode updated");
      } else {
        const { error } = await supabase.from("pincodes").insert([formData]);
        if (error) throw error;
        toast.success("Pincode added");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this pincode?")) return;
    await supabase.from("pincodes").delete().eq("id", id);
    fetchData();
    toast.success("Removed");
  };

  const openModal = (item: any = null) => {
    if (item) {
      setEditId(item.id);
      setFormData({ 
        pincode: item.pincode, 
        area_locality: item.area_locality, 
        city: item.city, 
        state: item.state, 
        is_active: item.is_active 
      });
    } else {
      setEditId(null);
      setFormData({ pincode: "", area_locality: "", city: "Delhi", state: "Delhi", is_active: true });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 p-4 bg-[#fcfcfc] min-h-screen">
      <Toaster />
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pincodes</h1>
          <p className="text-slate-500 font-medium text-sm">Manage service delivery areas</p>
        </div>
        <button 
          onClick={() => openModal()}
          className="bg-[#ff3d00] hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-100"
        >
          <Plus size={20} /> Add New Pincode
        </button>
      </div>

      {/* STATS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Total Pincodes" value={stats.total} icon={<MapPin className="text-orange-500" />} color="border-orange-500" />
        <StatCard label="Active Areas" value={stats.active} icon={<Globe className="text-green-500" />} color="border-green-500" />
        <StatCard label="Total Businesses" value={stats.businesses} icon={<Store className="text-blue-500" />} color="border-blue-500" />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                    type="text"
                    placeholder="Search area or pincode..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 ring-orange-500/20 font-medium"
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <th className="p-6">Pincode</th>
              <th className="p-6">Area/Locality</th>
              <th className="p-6">City/State</th>
              <th className="p-6 text-center">Businesses</th>
              <th className="p-6 text-center">Status</th>
              <th className="p-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {pincodes.filter(p => p.pincode.includes(searchQuery)).map((item) => (
              <tr key={item.id} className="hover:bg-slate-50/30 transition-colors">
                <td className="p-6 font-black text-slate-800">{item.pincode}</td>
                <td className="p-6 text-slate-600 font-bold">{item.area_locality}</td>
                <td className="p-6 text-slate-400 text-sm">{item.city}, {item.state}</td>
                <td className="p-6 text-center">
                    <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-black">
                        {item.business_count}
                    </span>
                </td>
                <td className="p-6 text-center">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
                    {item.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-6 text-right">
                    <div className="flex justify-end gap-2">
                        <button onClick={() => openModal(item)} className="p-2 text-slate-300 hover:text-blue-500"><Edit2 size={16}/></button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                    </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black text-slate-900">{editId ? 'Edit' : 'Add New'} Pincode</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode Number</label>
                  <input required maxLength={6} value={formData.pincode} onChange={(e) => setFormData({...formData, pincode: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#ff3d00]/20 font-bold" placeholder="e.g. 110001" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Area Locality</label>
                  <input required value={formData.area_locality} onChange={(e) => setFormData({...formData, area_locality: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#ff3d00]/20 font-bold" placeholder="e.g. Connaught Place" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                        <input required value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#ff3d00]/20 font-bold" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State</label>
                        <input required value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-2 ring-[#ff3d00]/20 font-bold" />
                    </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer" onClick={() => setFormData({...formData, is_active: !formData.is_active})}>
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${formData.is_active ? 'bg-[#ff3d00] border-[#ff3d00]' : 'border-slate-200 bg-white'}`}>
                        {formData.is_active && <Check size={14} className="text-white" />}
                    </div>
                    <span className="text-sm font-bold text-slate-700">Area is Active for Delivery</span>
                </div>

                <button disabled={isSubmitting} className="w-full bg-[#ff3d00] text-white py-5 rounded-[1.5rem] font-black text-sm shadow-xl shadow-orange-100 mt-4">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "SAVE PINCODE"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ label, value, icon, color }: any) {
    return (
      <div className={`bg-white p-8 rounded-[2rem] border-l-8 ${color} shadow-sm flex items-center justify-between`}>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
          <p className="text-4xl font-black text-slate-800 mt-1">{value}</p>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
      </div>
    );
}