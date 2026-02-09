"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Video, UploadCloud, Trash2, Plus, X, Film, Calendar,
  RefreshCw, AlertCircle, CheckCircle2, TriangleAlert, ShieldCheck,
  PlayCircle
} from "lucide-react";

export default function DigitalBranding() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchVideos = async () => {
    setFetchLoading(true);
    const { data, error } = await supabase
      .from("digital_branding_videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) showToast("Failed to sync video assets", "error");
    setVideos(data || []);
    setFetchLoading(false);
  };

  useEffect(() => { fetchVideos(); }, []);

  const processDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      const videoToDelete = videos.find(v => v.id === deleteConfirm);
      if (videoToDelete?.video_url) {
        const fileName = videoToDelete.video_url.split('/').pop();
        await supabase.storage
          .from("digital-branding-videos")
          .remove([`branding/${fileName}`]);
      }
      const { error } = await supabase.from("digital_branding_videos").delete().eq("id", deleteConfirm);
      if (error) throw error;
      showToast("Asset removed successfully", "success");
      fetchVideos();
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleSave = async () => {
    if (!title.trim()) return showToast("Title is required", "error");
    if (!editingVideo && !file) return showToast("Please select a video file", "error");

    setLoading(true);
    setUploadProgress(10);
    try {
      let finalVideoUrl = editingVideo?.video_url || "";
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
        const filePath = `branding/${fileName}`;
        const { error: uploadError } = await supabase.storage.from("digital-branding-videos").upload(filePath, file);
        if (uploadError) throw uploadError;
        setUploadProgress(60);
        const { data } = supabase.storage.from("digital-branding-videos").getPublicUrl(filePath);
        finalVideoUrl = data.publicUrl;
      }

      const payload = { title: title.trim(), video_url: finalVideoUrl };
      if (editingVideo) {
        await supabase.from("digital_branding_videos").update(payload).eq("id", editingVideo.id);
        showToast("Asset updated successfully", "success");
      } else {
        await supabase.from("digital_branding_videos").insert(payload);
        showToast("New asset published", "success");
      }

      setUploadProgress(100);
      setTimeout(() => {
        setShowModal(false);
        setUploadProgress(0);
        fetchVideos();
      }, 500);
    } catch (error: any) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoHover = (e: React.MouseEvent<HTMLVideoElement>, shouldPlay: boolean) => {
    const video = e.currentTarget;
    if (shouldPlay) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-red-600 border-red-700 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle2 className="text-emerald-400" size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-widest">{toast.msg}</span>
        </div>
      )}

      {/* REFINED GREY HEADER */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-20 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-10 md:p-12 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShieldCheck className="text-slate-400" size={14} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Asset Library</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Motion <span className="font-semibold text-slate-400">Branding</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-sm font-medium opacity-80">
                  Manage high-fidelity video assets for your digital presence.
                </p>
              </div>

              <button
                onClick={() => { setEditingVideo(null); setTitle(""); setFile(null); setPreviewUrl(null); setShowModal(true); }}
                className="bg-slate-900 text-white px-10 py-5 rounded-2xl font-bold uppercase text-[11px] tracking-widest flex items-center gap-3 hover:bg-black transition-all shadow-xl active:scale-95 self-start md:self-center"
              >
                <Plus size={18} /> Upload Asset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="max-w-7xl mx-auto px-10 -mt-10 relative z-20">
        {fetchLoading ? (
          <div className="h-64 bg-white rounded-[3rem] flex items-center justify-center border border-slate-100 shadow-sm">
            <RefreshCw className="animate-spin text-slate-300" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {videos.map((v) => (
              <div key={v.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-video bg-slate-100 overflow-hidden flex items-center justify-center">
                  <video
                    src={v.video_url}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    muted
                    loop
                    onMouseOver={e => handleVideoHover(e, true)}
                    onMouseOut={e => handleVideoHover(e, false)}
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <PlayCircle className="text-white/80" size={48} strokeWidth={1} />
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => { setEditingVideo(v); setTitle(v.title); setPreviewUrl(v.video_url); setShowModal(true); }} className="p-3 bg-white shadow-lg rounded-xl text-slate-600 hover:text-slate-900 transition-colors">
                      <Film size={18} />
                    </button>
                    <button onClick={() => setDeleteConfirm(v.id)} className="p-3 bg-white shadow-lg rounded-xl text-red-400 hover:text-red-600 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight truncate flex-1">{v.title}</h3>
                  </div>
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                    <Calendar size={12} className="text-slate-300" />
                    {new Date(v.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODAL (GREY THEME) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row divide-x divide-slate-100 animate-in zoom-in-95">
            
            {/* Left Column */}
            <div className="flex-1 p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="space-y-1">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Configuration</p>
                  <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">Asset Details</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full text-slate-400"><X size={20}/></button>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest ml-1">Friendly Title</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="e.g. Hero Cinematic" className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none font-bold text-slate-700 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Recommended</p>
                    <p className="text-xs font-bold text-slate-700">16:9 Landscape</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Max Size</p>
                    <p className="text-xs font-bold text-slate-700">50MB Limit</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 flex gap-4">
                <button onClick={() => setShowModal(false)} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
                <button onClick={handleSave} disabled={loading} className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[11px] tracking-widest shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3">
                  {loading ? <RefreshCw className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  {editingVideo ? "Update Metadata" : "Deploy Asset"}
                </button>
              </div>
            </div>

            {/* Right Column (Upload) */}
            <div className="flex-1 bg-slate-50/50 p-12 flex flex-col items-center justify-center relative">
              <input id="vUpload" type="file" accept="video/*" className="hidden" onChange={handleFileChange} />
              <div
                onClick={() => document.getElementById('vUpload')?.click()}
                className={`w-full min-h-[350px] rounded-[2.5rem] border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden relative group ${previewUrl ? 'border-slate-400 bg-white shadow-lg' : 'border-slate-200 hover:border-slate-400 bg-white hover:shadow-xl'}`}
              >
                {previewUrl ? (
                  <video src={previewUrl} className="w-full h-full object-cover" autoPlay muted loop />
                ) : (
                  <div className="text-center p-6">
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform shadow-sm">
                      <UploadCloud className="text-slate-400" size={24} />
                    </div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Click to browse videos</p>
                  </div>
                )}
              </div>

              {loading && (
                <div className="w-full mt-8 space-y-2 px-4">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <span>Transmitting Asset</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-[3rem] p-10 max-w-sm w-full text-center border border-slate-100 shadow-2xl">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <TriangleAlert size={32} strokeWidth={1.5} />
            </div>
            <h4 className="text-2xl font-semibold text-slate-900 tracking-tight mb-2">Remove Asset?</h4>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-wide mb-8">This action will permanently delete the file from storage.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-4 font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
              <button onClick={processDelete} disabled={loading} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-600 transition-all flex items-center justify-center gap-2">
                {loading && <RefreshCw className="animate-spin" size={12} />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}