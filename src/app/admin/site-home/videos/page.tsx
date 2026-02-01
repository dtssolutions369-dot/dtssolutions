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
  Loader2,
  RefreshCw,
  ChevronRight,
  ShieldCheck,
  Globe,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  Play
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
      // 1. Fetch from both tables
      const { data: adminData } = await supabase.from("vendor_videos").select("*").order("created_at", { ascending: false });
      const { data: vendorData } = await supabase.from("vendor_register").select("id, company_name, video_files").not("video_files", "is", null);

      // 2. Helper to detect YouTube and generate thumbnails
      const getMediaInfo = (url: string) => {
        const ytMatch = url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        const ytId = ytMatch && ytMatch[2]?.length === 11 ? ytMatch[2] : null;
        return {
          isYouTube: !!ytId,
          ytId,
          thumbnail: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null
        };
      };

      // 3. Normalize Admin Videos
      const adminVideos: any[] = (adminData || []).map(v => ({ 
        ...v, 
        source: "admin",
        ...getMediaInfo(v.video_url)
      }));

      // 4. Normalize Vendor Videos (with "Company Showcase" logic)
      const vendorVideos: any[] = [];
      vendorData?.forEach((vendor) => {
        (vendor.video_files || []).forEach((v: any, index: number) => {
          vendorVideos.push({
            id: `${vendor.id}-${index}`,
            video_url: v.url,
            // USE "Company Showcase" if title is missing
            video_title: v.title || "Company Showcase", 
            business_sector: ["Vendor Upload"],
            vendor_name: vendor.company_name,
            source: "vendor",
            ...getMediaInfo(v.url)
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* TOAST */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in slide-in-from-top-4 duration-300 ${toast.type === 'success' ? 'bg-white border-red-500 text-slate-800' : 'bg-red-600 border-red-700 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-red-600" size={20} /> : <AlertCircle size={20} />}
          <span className="text-sm font-black uppercase tracking-tight">{toast.msg}</span>
        </div>
      )}

      {/* --- MASTER YELLOW BANNER --- */}
      <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-yellow-400 rounded-full opacity-20 blur-3xl" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="text-[#e11d48]" size={20} />
                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Asset Manager</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-black uppercase  tracking-tighter leading-none">
                Vendor <span className="text-[#e11d48]">Videos</span>
              </h1>
              <p className="text-red-900/80 text-xs mt-3 max-w-sm font-bold uppercase tracking-wide leading-relaxed ">
                Broadcast and curate high-impact video assets. Filter through admin-uploaded or vendor-submitted media.
              </p>
            </div>

            <div className="flex items-center gap-4">
               {/* SOURCE FILTER TABS */}
               <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-full border border-white/50 flex gap-1">
                {["all", "admin", "vendor"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-5 py-2 rounded-full text-[10px] font-black uppercase transition-all ${
                      filter === f ? "bg-black text-white shadow-lg" : "text-red-900/60 hover:text-red-900"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button onClick={openAddModal} className="bg-red-600 hover:bg-black text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] flex items-center gap-3 transition-all shadow-2xl active:scale-95 group">
                <Plus size={20} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                Add Video
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* GRID SECTION */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-12 relative z-30">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-xl">
            <RefreshCw className="animate-spin text-red-600" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="group bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-56 bg-black overflow-hidden flex items-center justify-center">
<video
  src={v.video_url}
  preload="metadata"
  controls={false}
  muted
  playsInline
  className="w-full h-full object-cover"
/>
                  
                  {/* SOURCE BADGE */}
                  <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border backdrop-blur-md ${
                    v.source === 'admin' ? 'bg-blue-500/20 border-blue-400 text-blue-600' : 'bg-green-500/20 border-green-400 text-green-600'
                  }`}>
                    {v.source}
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                     <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-red-600 shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Play fill="currentColor" size={20} />
                     </div>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    {v.source === 'admin' && (
                      <button onClick={() => { setEditing(v); setForm({ ...v, area: v.area || "", legal_type: v.legal_type || "" }); setShowModal(true); }} className="w-10 h-10 bg-white text-slate-900 rounded-xl flex items-center justify-center hover:bg-black hover:text-white shadow-xl transition-colors">
                        <Pencil size={18} />
                      </button>
                    )}
                    <button onClick={() => setDeleteTarget(v)} className="w-10 h-10 bg-white text-red-600 rounded-xl flex items-center justify-center hover:bg-red-600 hover:text-white shadow-xl transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Globe size={12} className="text-red-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{v.area || "GLOBAL REGION"}</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase  tracking-tighter leading-tight mb-2 truncate">{v.video_title}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide mb-5">
                    {v.vendor_name ? `Prop: ${v.vendor_name}` : "Admin Asset"}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {v.business_sector.map(s => (
                      <span key={s} className="bg-slate-100 text-slate-500 text-[9px] px-3 py-1 rounded-lg font-black uppercase border border-slate-200">
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
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-center">
            <div className="bg-red-600 p-10 text-white">
              <TriangleAlert size={48} className="mx-auto mb-4" />
              <h3 className="text-3xl font-black uppercase  tracking-tighter">Destroy Asset?</h3>
              <p className="text-red-100 text-[10px] font-bold uppercase mt-3 tracking-widest opacity-80 leading-relaxed">
                You are about to permanently wipe <br/> <span className="text-white underline">{deleteTarget.video_title}</span>
              </p>
            </div>
            <div className="p-8 flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Abort</button>
              <button onClick={processDelete} className="flex-1 py-5 bg-black text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl">Confirm Wipe</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="bg-yellow-300 p-8 flex items-center justify-between border-b border-yellow-400 text-black">
              <div>
                <h3 className="text-2xl font-black uppercase  tracking-tighter leading-none">
                  {editing ? "Refine Asset" : "Deploy Media"}
                </h3>
                <p className="text-red-900 text-[9px] font-black uppercase tracking-widest mt-1 opacity-70">Multimedia Configuration</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"><X size={18} /></button>
            </div>

            <div className="p-10 space-y-6 overflow-y-auto max-h-[75vh]">
              {/* VIDEO TITLE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Broadcasting Title</label>
                <input type="text" value={form.video_title} onChange={(e) => setForm({...form, video_title: e.target.value})} placeholder="e.g. Q1_Performance_Hype" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700 transition-colors" />
              </div>

              {/* VIDEO FILE */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Media Source (MP4/MOV)</label>
                <div onClick={() => document.getElementById('videoFile')?.click()} className={`relative h-44 border-4 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${file ? 'border-red-600 bg-red-50' : 'border-slate-100 bg-slate-50 hover:bg-yellow-50'}`}>
                   {file ? (
                    <div className="text-center p-6">
                       <Video className="text-red-600 mx-auto mb-2" size={32} />
                       <p className="text-xs font-black text-red-600 truncate max-w-[200px]">{file.name}</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="text-slate-300 mx-auto mb-2" size={32} />
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Upload Raw Footage</p>
                    </div>
                  )}
                  <input id="videoFile" type="file" accept="video/*" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>

              {/* SECTORS */}
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Briefcase size={12}/> Target Business Sectors</label>
                <div className="flex flex-wrap gap-2">
                  {["Manufacturer", "Industrial", "Distributor", "Retailer", "Service Provider"].map(s => (
                    <button
                      key={s}
                      onClick={() => toggleSector(s)}
                      className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                        form.business_sector.includes(s) ? "bg-black border-black text-white shadow-lg" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* AREA & LEGAL */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><Globe size={12}/> Geolocation</label>
                  <input className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700" placeholder="Mumbai, IN" value={form.area} onChange={e => setForm({...form, area: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center gap-2">Legal Framing</label>
                  <select className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-red-600 outline-none font-bold text-slate-700 appearance-none" value={form.legal_type} onChange={e => setForm({...form, legal_type: e.target.value})}>
                    <option value="">STANDARD</option>
                    <option value="proprietorship">PROPRIETORSHIP</option>
                    <option value="partnership">PARTNERSHIP</option>
                    <option value="llp">LLP</option>
                    <option value="private_ltd">PRIVATE LIMITED</option>
                  </select>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-[10px] tracking-widest">Discard</button>
                <button onClick={handleSave} disabled={loading} className="flex-[2] py-5 bg-red-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl">
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <Upload size={16} strokeWidth={3} />}
                  {editing ? "Confirm Updates" : "Deploy Asset"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}