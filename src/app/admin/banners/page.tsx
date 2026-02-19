"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Plus, Image as ImageIcon, Eye, EyeOff, 
  Trash2, Edit3, Loader2, X, Upload, 
  Layers, BarChart3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function BannersPage() {
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null); // For Editing
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 });

  useEffect(() => { fetchBanners(); }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBanners(data || []);
      
      const active = data?.filter(b => b.is_active).length || 0;
      setStats({
        total: data?.length || 0,
        active: active,
        inactive: (data?.length || 0) - active
      });
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("banners")
      .update({ is_active: !currentStatus })
      .eq("id", id);
    
    if (!error) {
      toast.success(`Banner ${!currentStatus ? 'Activated' : 'Deactivated'}`);
      fetchBanners();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    
    const { error } = await supabase.from("banners").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Banner deleted");
      fetchBanners();
    }
  };

  const openEditModal = (banner: any) => {
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Toaster position="bottom-center" />
      
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff3d00]">
               <Layers size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Banner Management</h1>
              <p className="text-slate-500 text-xs font-medium">Configure store advertising and promotions</p>
            </div>
          </div>
          
          <button 
            onClick={() => { setSelectedBanner(null); setIsModalOpen(true); }}
            className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-black transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> New Campaign
          </button>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Live Campaigns" value={stats.active} icon={<Eye size={20}/>} color="text-green-600" bg="bg-green-50" />
          <StatCard label="Paused Banners" value={stats.inactive} icon={<EyeOff size={20}/>} color="text-slate-400" bg="bg-slate-50" />
          <StatCard label="Total Inventory" value={stats.total} icon={<ImageIcon size={20}/>} color="text-blue-600" bg="bg-blue-50" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            <div className="col-span-full py-20 flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-[#ff3d00]" size={40} />
              <p className="text-slate-400 font-bold text-sm">Syncing with database...</p>
            </div>
          ) : (
            banners.map((banner) => (
              <motion.div layout key={banner.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm group relative">
                {/* Status Badge */}
                <div className={`absolute top-6 left-6 z-10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm flex items-center gap-2 ${banner.is_active ? 'bg-green-500/80 text-white' : 'bg-slate-900/80 text-white'}`}>
                   {banner.is_active ? 'Active' : 'Draft'}
                </div>

                {/* Banner Image */}
                <div className="relative aspect-[1200/500] bg-slate-50 overflow-hidden">
                  <img src={banner.image_url} alt={banner.title} className="w-full h-full object-cover" />
                </div>

                {/* Details and Actions */}
                <div className="p-8 flex items-center justify-between">
                  <div className="max-w-[60%]">
                    <h3 className="font-black text-slate-900 text-2xl tracking-tight line-clamp-1">{banner.title}</h3>
                    <p className="text-slate-500 text-sm font-medium line-clamp-1">{banner.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button onClick={() => toggleStatus(banner.id, banner.is_active)} className="h-11 w-11 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-all" title="Toggle Visibility">
                      {banner.is_active ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button onClick={() => openEditModal(banner)} className="h-11 w-11 bg-slate-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-50 transition-all" title="Edit Banner">
                      <Edit3 size={18} />
                    </button>
                    <button onClick={() => handleDelete(banner.id)} className="h-11 w-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-all" title="Delete Banner">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <AddBannerModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setSelectedBanner(null); }} 
        refresh={fetchBanners}
        editData={selectedBanner}
      />
    </div>
  );
}

// --- STAT CARD COMPONENT ---
function StatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-orange-200 transition-all">
      <div className={`${bg} ${color} w-14 h-14 rounded-2xl flex items-center justify-center`}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-3xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

// --- MODAL COMPONENT (HANDLES ADD & EDIT) ---
function AddBannerModal({ isOpen, onClose, refresh, editData }: any) {
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    link_url: "", 
    position: "Top Slider" 
  });

  // Sync editData when modal opens
  useEffect(() => {
    if (editData) {
      setFormData({
        title: editData.title || "",
        description: editData.description || "",
        link_url: editData.link_url || "",
        position: editData.position || "Top Slider"
      });
      setPreview(editData.image_url);
    } else {
      setFormData({ title: "", description: "", link_url: "", position: "Top Slider" });
      setPreview(null);
      setFile(null);
    }
  }, [editData, isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalImageUrl = preview;

      // If a new file is uploaded, upload it to storage
      if (file) {
        const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
        const { error: uploadError } = await supabase.storage
          .from('banners')
          .upload(`banner-images/${fileName}`, file);
        
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('banners')
          .getPublicUrl(`banner-images/${fileName}`);
        
        finalImageUrl = publicUrl;
      }

      if (!finalImageUrl) throw new Error("Image is required");

      if (editData) {
        // UPDATE EXISTING
        const { error } = await supabase
          .from("banners")
          .update({ ...formData, image_url: finalImageUrl })
          .eq("id", editData.id);
        if (error) throw error;
        toast.success("Banner updated");
      } else {
        // INSERT NEW
        const { error } = await supabase
          .from("banners")
          .insert([{ ...formData, image_url: finalImageUrl, is_active: true }]);
        if (error) throw error;
        toast.success("Banner published!");
      }

      refresh();
      onClose();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-800">{editData ? 'Edit Campaign' : 'New Campaign'}</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              {/* IMAGE UPLOADER */}
              <div onClick={() => fileInputRef.current?.click()} className="relative w-full aspect-[1200/400] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer overflow-hidden hover:border-[#ff3d00] transition-colors group">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center">
                    <Upload className="text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-bold text-slate-400">Click to upload banner</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <p className="text-white text-xs font-black">CHANGE IMAGE</p>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
              </div>

              {/* INPUTS */}
              <div className="space-y-4">
                <input 
                  required
                  placeholder="Campaign Title" 
                  value={formData.title}
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none focus:ring-2 ring-orange-500/20" 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                />
                <input 
                  placeholder="Short Description" 
                  value={formData.description}
                  className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none" 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <button disabled={uploading} className="w-full bg-[#ff3d00] text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-200 hover:bg-black transition-all">
                {uploading ? (
                  <Loader2 className="animate-spin mx-auto" />
                ) : (
                  editData ? "Save Changes" : "Publish Banner"
                )}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}