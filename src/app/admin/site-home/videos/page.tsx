"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Video,
  Plus,
  Trash2,
  Pencil,
  X,
  Upload,
  RefreshCw,
  ShieldCheck,
  Globe,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  Play,
  Film
} from "lucide-react";

/* =======================
    TYPES
======================= */
type VendorVideo = {
  id: string;
  video_url: string;
  video_title: string;
  business_sector: string[];
  area?: string | null;
  legal_type?: string | null;
  source: "admin" | "vendor";
  vendor_name?: string | null;
};

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<VendorVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "admin" | "vendor">("all");

  // Modal & Toast States
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<VendorVideo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<VendorVideo | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Form States
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    video_title: "",
    business_sector: [] as string[],
    area: "",
    legal_type: "",
  });

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* =======================
      FETCH LOGIC
  ======================= */
  const fetchVideos = async () => {
    setFetchLoading(true);
    try {
      const { data: adminData } = await supabase.from("vendor_videos").select("*").order("created_at", { ascending: false });
      const { data: vendorData } = await supabase.from("vendor_register").select("id, company_name, video_files").not("video_files", "is", null);

      const adminVideos: any[] = (adminData || []).map(v => ({ 
        ...v, 
        source: "admin"
      }));

      const vendorVideos: any[] = [];
      vendorData?.forEach((vendor) => {
        (vendor.video_files || []).forEach((v: any, index: number) => {
          vendorVideos.push({
            id: `${vendor.id}-${index}`,
            video_url: v.url,
            video_title: v.title || "Company Showcase", 
            business_sector: ["Vendor Upload"],
            vendor_name: vendor.company_name,
            source: "vendor"
          });
        });
      });

      let combined = [...adminVideos, ...vendorVideos];
      if (filter === "admin") combined = adminVideos;
      if (filter === "vendor") combined = vendorVideos;

      setVideos(combined);
    } catch (err) {
      showToast("Failed to fetch videos", "error");
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => { fetchVideos(); }, [filter]);

  /* =======================
      ACTIONS
  ======================= */
  const handleSave = async () => {
    if (!form.video_title.trim()) { showToast("Video title is required", "error"); return; }
    if (!editing && !file) { showToast("Video file is required", "error"); return; }

    setLoading(true);
    try {
      let videoUrl = editing?.video_url || "";

      if (file) {
        const fileName = `${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("vendor-videos").upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("vendor-videos").getPublicUrl(fileName);
        videoUrl = urlData.publicUrl;
      }

      const payload = {
        video_title: form.video_title,
        business_sector: form.business_sector,
        area: form.area || null,
        legal_type: form.legal_type || null,
        video_url: videoUrl,
      };

      if (editing) {
        const { error } = await supabase.from("vendor_videos").update(payload).eq("id", editing.id);
        if (error) throw error;
        showToast("Video asset updated", "success");
      } else {
        const { error } = await supabase.from("vendor_videos").insert([payload]);
        if (error) throw error;
        showToast("New video deployed", "success");
      }

      setShowModal(false);
      fetchVideos();
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const processDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      const fileName = deleteTarget.video_url.split("/vendor-videos/")[1];
      if (fileName) await supabase.storage.from("vendor-videos").remove([fileName]);
      await supabase.from("vendor_videos").delete().eq("id", deleteTarget.id);
      showToast("Video removed permanently", "success");
      fetchVideos();
    } catch (err) {
      showToast("Deletion failed", "error");
    } finally {
      setLoading(false);
      setDeleteTarget(null);
    }
  };

  const openAddModal = () => {
    setEditing(null);
    setForm({ video_title: "", business_sector: [], area: "", legal_type: "" });
    setFile(null);
    setShowModal(true);
  };

  const toggleSector = (s: string) => {
    setForm(prev => ({
      ...prev,
      business_sector: prev.business_sector.includes(s) 
        ? prev.business_sector.filter(i => i !== s) 
        : [...prev.business_sector, s]
    }));
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-20">
      
      {/* REFINED TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-slate-900 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}

      {/* REFINED HEADER */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-24 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShieldCheck className="text-slate-400" size={14} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Multimedia Repository</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Media <span className="font-semibold text-slate-400">Library</span>
                </h1>
                
                {/* SOURCE FILTER TABS */}
                <div className="flex bg-white p-1 rounded-2xl border border-slate-200 w-fit mt-6">
                  {["all", "admin", "vendor"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={`px-6 py-2 rounded-xl text-[10px] font-bold uppercase transition-all ${
                        filter === f ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={openAddModal} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 group">
                <Plus size={18} /> Add New Asset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIDEO GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <RefreshCw className="animate-spin text-slate-200" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-60 bg-slate-950 overflow-hidden">
                  <video src={v.video_url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  
                  {/* SOURCE BADGE */}
                  <div className={`absolute top-5 left-5 px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md ${
                    v.source === 'admin' ? 'bg-slate-900/80 border-slate-700 text-white' : 'bg-emerald-500/80 border-emerald-400 text-white'
                  }`}>
                    {v.source}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 scale-75 group-hover:scale-100 transition-transform">
                        <Play fill="currentColor" size={24} />
                      </div>
                  </div>

                  <div className="absolute top-5 right-5 flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 transition-transform">
                    {v.source === 'admin' && (
                      <button onClick={() => { setEditing(v); setForm({ ...v, area: v.area || "", legal_type: v.legal_type || "" }); setShowModal(true); }} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-slate-900 hover:text-white shadow-xl">
                        <Pencil size={18} />
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(v)} className="w-10 h-10 bg-white text-red-500 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Globe size={12} className="text-slate-300" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">{v.area || "Global Asset"}</span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-tight mb-2 truncate uppercase">{v.video_title}</h3>
                  <p className="text-slate-400 text-[10px] font-medium mb-6">
                    {v.vendor_name ? v.vendor_name : "Central Management"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {v.business_sector.map(s => (
                      <span key={s} className="bg-slate-50 text-slate-500 text-[8px] px-3 py-1.5 rounded-lg font-bold uppercase border border-slate-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DELETE MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 text-center">
            <div className="p-10">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <TriangleAlert size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Wipe Asset?</h3>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Permanently deleting: <br/> <span className="text-slate-900">{deleteTarget.video_title}</span>
              </p>
              <div className="flex gap-4 mt-8">
                <button onClick={() => setDeleteTarget(null)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Abort</button>
                <button onClick={processDelete} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 md:p-12">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Metadata Config</p>
                  <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{editing ? "Refine Media" : "New Media Asset"}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 overflow-y-auto max-h-[65vh] pr-2">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Asset Title</label>
                  <input type="text" value={form.video_title} onChange={(e) => setForm({...form, video_title: e.target.value})} placeholder="e.g. Corporate_Overview_2025" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none font-bold text-slate-700 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Media Source</label>
                  <div onClick={() => document.getElementById('videoFile')?.click()} className={`relative h-44 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${file ? 'border-slate-400 bg-slate-50' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}>
                    {file ? (
                      <div className="text-center">
                        <Film className="text-slate-900 mx-auto mb-2" size={32} />
                        <p className="text-[10px] font-bold text-slate-900 truncate max-w-[200px]">{file.name}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <Upload className="text-slate-300 mx-auto mb-2" size={28} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Video File</p>
                      </div>
                    )}
                    <input id="videoFile" type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1 flex items-center gap-2"><Briefcase size={12}/> Target Sectors</label>
                  <div className="flex flex-wrap gap-2">
                    {["Manufacturer", "Industrial", "Distributor","Wholesaler","Dealer", "Sub-Dealer", "Retailer", "Service Provider"].map(s => (
                      <button
                        key={s}
                        onClick={() => toggleSector(s)}
                        className={`px-5 py-2.5 rounded-xl text-[9px] font-bold uppercase border transition-all ${
                          form.business_sector.includes(s) ? "bg-slate-900 border-slate-900 text-white shadow-lg" : "bg-white border-slate-200 text-slate-400 hover:border-slate-400"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Location</label>
                    <input className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none font-bold text-slate-700" placeholder="Mumbai, IN" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Entity Type</label>
                    <select className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 outline-none font-bold text-slate-700 appearance-none" value={form.legal_type} onChange={e => setForm({...form, legal_type: e.target.value})}>
                      <option value="">Standard</option>
                      <option value="proprietorship">Proprietorship</option>
                      <option value="partnership">Partnership</option>
                      <option value="llp">LLP</option>
                      <option value="private_ltd">Private Ltd</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400">Discard</button>
                  <button onClick={handleSave} disabled={loading} className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3">
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    {editing ? "Save Changes" : "Deploy Asset"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}