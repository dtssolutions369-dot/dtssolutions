"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ImageIcon,
  UploadCloud,
  Trash2,
  Plus,
  X,
  Calendar,
  Edit3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  TriangleAlert,
  ShieldCheck,
  Layout
} from "lucide-react";

export default function DigitalBanner() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Modals
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form States
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Feedback States
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchBanners = async () => {
    setFetchLoading(true);
    const { data, error } = await supabase
      .from("digital_banners")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) showToast("Failed to sync banners", "error");
    setBanners(data || []);
    setFetchLoading(false);
  };

  useEffect(() => { fetchBanners(); }, []);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle("");
    setFile(null);
    setPreviewUrl(null);
    setShowModal(true);
  };

  const openEditModal = (banner: any) => {
    setEditingBanner(banner);
    setTitle(banner.title);
    setFile(null);
    setPreviewUrl(banner.image_url);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!title.trim()) { showToast("Please enter a banner title", "error"); return; }
    if (!editingBanner && !file) { showToast("An image file is required", "error"); return; }

    setLoading(true);
    try {
      let finalImageUrl = editingBanner?.image_url || "";

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `banner-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("digital-banners")
          .upload(fileName, file);

        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from("digital-banners").getPublicUrl(fileName);
        finalImageUrl = data.publicUrl;
      }

      const payload = { title: title.trim(), image_url: finalImageUrl };

      if (editingBanner) {
        const { error } = await supabase.from("digital_banners").update(payload).eq("id", editingBanner.id);
        if (error) throw error;
        showToast("Banner updated", "success");
      } else {
        const { error } = await supabase.from("digital_banners").insert(payload);
        if (error) throw error;
        showToast("Banner published", "success");
      }

      setShowModal(false);
      fetchBanners();
    } catch (error: any) {
      showToast(error.message || "Operation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const processDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      const banner = banners.find(b => b.id === deleteConfirm);
      if (banner?.image_url) {
        const fileName = banner.image_url.split('/').pop();
        await supabase.storage.from("digital-banners").remove([fileName]);
      }
      await supabase.from("digital_banners").delete().eq("id", deleteConfirm);
      showToast("Banner removed successfully", "success");
      fetchBanners();
    } catch (error) {
      showToast("System error during deletion", "error");
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
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

      {/* REFINED HEADER SECTION */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-24 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShieldCheck className="text-slate-400" size={14} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Deployment Console</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Digital <span className="font-semibold text-slate-400">Banners</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-sm font-medium opacity-80">
                  Update your website's primary visual identity in real-time.
                </p>
              </div>

              <div className="flex items-center gap-6">
                 <div className="hidden lg:block text-right">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Slots</p>
                    <p className="text-2xl font-semibold text-slate-900">{banners.length} / 12</p>
                 </div>
                 <button onClick={openAddModal} className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 group">
                   <Plus size={18} /> New Campaign
                 </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        {fetchLoading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-slate-100 shadow-sm">
            <RefreshCw className="animate-spin text-slate-200" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {banners.map((b) => (
              <div key={b.id} className="group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
                <div className="relative h-64 bg-slate-50 overflow-hidden">
                  <img src={b.image_url} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button onClick={() => openEditModal(b)} className="p-4 bg-white text-slate-900 rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-xl">
                        <Edit3 size={18} />
                    </button>
                    <button onClick={() => setDeleteConfirm(b.id)} className="p-4 bg-white text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-xl">
                        <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight truncate">{b.title}</h3>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                    <Calendar size={12} /> {new Date(b.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                 <TriangleAlert size={32} />
              </div>
              <h3 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Remove Campaign?</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">This asset will be unlinked from the live site.</p>
              <div className="flex gap-4">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Cancel</button>
                <button onClick={processDelete} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all">Confirm</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-10 md:p-12">
              <div className="flex items-center justify-between mb-12">
                <div>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Metadata Config</p>
                    <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{editingBanner ? "Update Banner" : "New Asset"}</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors">
                    <X size={20} />
                </button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Internal Campaign Name</label>
                  <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Winter 2026 Promo" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none font-bold text-slate-700 transition-all" />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Visual Content</label>
                  <div
                    onClick={() => document.getElementById('bannerFile')?.click()}
                    className={`h-64 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group ${file || previewUrl ? 'border-slate-300' : 'border-slate-200 bg-slate-50 hover:bg-white'}`}
                  >
                    {previewUrl ? (
                      <div className="absolute inset-0 w-full h-full">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <p className="text-white text-[10px] font-bold uppercase tracking-widest bg-black/50 px-6 py-2 rounded-full">Replace Asset</p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-14 h-14 bg-white rounded-2xl border border-slate-200 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                            <UploadCloud className="text-slate-400" size={24} />
                        </div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Select Campaign Creative</p>
                        <p className="text-[8px] text-slate-300 mt-1 uppercase tracking-tighter">PNG, JPG or WebP (Max 5MB)</p>
                      </div>
                    )}
                    <input id="bannerFile" type="file" accept="image/*" className="hidden" onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) { setFile(f); setPreviewUrl(URL.createObjectURL(f)); }
                    }} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setShowModal(false)} className="flex-1 py-5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                  <button onClick={handleSave} disabled={loading} className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3">
                    {loading ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                    {editingBanner ? "Update Metadata" : "Push Live"}
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