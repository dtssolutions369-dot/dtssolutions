"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Edit2, Trash2,
  ImageIcon, Loader2, X, Camera,
  Layers, Upload, AlertTriangle, ChevronRight
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function AdminCategories() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, id: string | null }>({
    isOpen: false,
    id: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    image_url: "",
    parent_id: null as string | null
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;

      const parents = data.filter(item => !item.parent_id);
      const children = data.filter(item => item.parent_id);

      const structuredData = parents.map(parent => ({
        ...parent,
        subcategories: children.filter(child => child.parent_id === parent.id)
      }));

      setCategories(structuredData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      const file = e.target.files[0];
      const fileName = `${Math.random()}.${file.name.split('.').pop()}`;
      const filePath = `icons/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('category-icons').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('category-icons').getPublicUrl(filePath);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
      toast.success("Image processed");
    } catch (error: any) {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editId) {
        const { error } = await supabase.from("categories").update(formData).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert([formData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchData();
      toast.success("Database updated");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddCategory = () => {
    setEditId(null);
    setFormData({ name: "", image_url: "", parent_id: null });
    setIsModalOpen(true);
  };

  const openEdit = (item: any) => {
    setEditId(item.id);
    setFormData({ name: item.name, image_url: item.image_url || "", parent_id: item.parent_id });
    setIsModalOpen(true);
  };
const executeDelete = async () => {
  if (!deleteConfirm.id) return;

  try {
    setIsSubmitting(true);

    // Delete category (this will cascade if FK is set with ON DELETE CASCADE)
    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deleteConfirm.id);

    if (error) throw error;

    toast.success("Category deleted successfully");

    setDeleteConfirm({ isOpen: false, id: null });
    fetchData(); // refresh list

  } catch (error: any) {
    toast.error(error.message);
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen bg-[#fafafa] pt-0 p-6">
      <Toaster position="bottom-center" />

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10 pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
          <div className="space-y-1">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-2 w-10 bg-[#ff3d00] rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Architecture</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">Collections</h1>
            <p className="text-slate-500 font-medium">Categorization and hierarchical depth</p>
          </div>

          <button onClick={openAddCategory} className="bg-[#ff3d00] text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center gap-3 shadow-xl">
            <Plus size={20} /> New Root Category
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all p-7 flex flex-col group">
            
            {/* Parent Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="relative">
                <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] overflow-hidden border border-slate-100 ring-4 ring-slate-50">
                  {category.image_url ? <img src={category.image_url} className="w-full h-full object-cover" /> : <ImageIcon className="m-auto h-full text-slate-200 p-5" />}
                </div>
                <button onClick={() => openEdit(category)} className="absolute -bottom-2 -right-2 bg-white shadow-lg p-2 rounded-xl text-slate-400 hover:text-[#ff3d00] border border-slate-50 transition-colors">
                  <Edit2 size={14} />
                </button>
              </div>
              <button onClick={() => setDeleteConfirm({ isOpen: true, id: category.id })} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-900 mb-6">{category.name}</h3>

            {/* Subcategories List */}
            <div className="space-y-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sub-Dimensions</span>
              <div className="space-y-2 bg-slate-50/50 p-3 rounded-[1.5rem] border border-slate-100">
                {category.subcategories.map((sub: any) => (
                  <div key={sub.id} className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-slate-100 group/sub hover:border-[#ff3d00]/30 transition-all shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 border border-slate-100">
                        {sub.image_url ? <img src={sub.image_url} className="w-full h-full object-cover" /> : <Layers size={14} className="m-auto h-full text-slate-300" />}
                      </div>
                      <span className="text-sm font-bold text-slate-700">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(sub)} className="p-1.5 text-slate-400 hover:text-blue-500"><Edit2 size={14} /></button>
                      <button onClick={() => setDeleteConfirm({ isOpen: true, id: sub.id })} className="p-1.5 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
                
                <button 
                  onClick={() => { setEditId(null); setFormData({ name: "", image_url: "", parent_id: category.id }); setIsModalOpen(true); }} 
                  className="w-full py-3 flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl text-xs font-black text-slate-400 hover:text-[#ff3d00] hover:border-[#ff3d00]/50 transition-all bg-white/50 hover:bg-white"
                >
                  <Plus size={14} /> NEW SUB-ITEM
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- MODAL (Unified for Category/Subcategory) --- */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border border-white/20">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 leading-tight">
                      {editId ? 'Edit' : 'Create'} <br /> 
                      <span className="text-[#ff3d00]">{formData.parent_id ? 'Sub-Category' : 'Root Category'}</span>
                    </h2>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 p-3 rounded-2xl hover:bg-slate-100 transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Image Uploader */}
                  <div className="flex justify-center">
                    <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#ff3d00] transition-all overflow-hidden relative group">
                      {formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          {uploading ? <Loader2 className="animate-spin text-[#ff3d00]" /> : <Camera className="text-slate-300 mx-auto" size={28} />}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-black tracking-widest">CHANGE IMAGE</div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Label Name</label>
                    <input required value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full px-6 py-4 bg-slate-50 rounded-2xl border-none outline-none focus:ring-4 ring-orange-500/10 font-bold" placeholder="Enter name..." />
                  </div>

                  <button disabled={isSubmitting || uploading} type="submit" className="w-full bg-[#ff3d00] text-white py-5 rounded-[1.5rem] font-black shadow-xl shadow-orange-100 hover:bg-black transition-all disabled:opacity-50">
                    {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "SAVE CHANGES"}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteConfirm.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="text-red-500" size={40} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Extreme Caution</h2>
              <p className="text-slate-500 text-sm font-medium leading-relaxed mb-8">
                Deleting this category will <span className="text-red-600 font-bold">permanently delete</span> all associated products. This action cannot be undone.
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={executeDelete}
                  disabled={isSubmitting}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black text-sm hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : "YES, DELETE EVERYTHING"}
                </button>
                <button
                  onClick={() => setDeleteConfirm({ isOpen: false, id: null })}
                  className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  NEVERMIND
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>


      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                      {editId ? 'Modify' : 'Create'} {formData.parent_id ? 'Sub Category' : 'Category'}
                    </h2>
                    <p className="text-slate-500 text-sm font-medium">Define entry properties and visuals</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="w-12 h-12 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-colors"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex flex-col items-center">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-40 h-40 bg-slate-50 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#ff3d00] transition-all overflow-hidden relative group"
                    >
                      {formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover" alt="" />
                      ) : (
                        <div className="text-center p-6">
                          {uploading ? <Loader2 className="animate-spin text-[#ff3d00] mx-auto" /> : <Camera className="text-slate-300 mx-auto mb-2" size={32} />}
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Iconography</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white">
                        <Upload size={20} className="mb-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Upload New</span>
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Entry Name</label>
                    <input
                      required
                      autoFocus
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-6 py-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 font-bold text-slate-800 placeholder:text-slate-300 transition-all"
                      placeholder="e.g. Living Room Furniture"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="flex-1 px-6 py-5 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSubmitting || uploading}
                      type="submit"
                      className="flex-[2] bg-[#ff3d00] hover:bg-orange-700 text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-orange-100 disabled:opacity-50 flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                        <>
                          <Plus size={20} />
                          <span>{editId ? "UPDATE RECORD" : "PUBLISH ENTRY"}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}