"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Trash2,
  Edit2,
  RefreshCw,
  Plus,
  X,
  Image as ImageIcon,
  Search,
  Zap,
  AlertCircle,
  CheckCircle2,
  Layers
} from "lucide-react";

type Category = {
  id: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  is_active?: boolean;
  service_count?: number;
};

export default function AdminCategoriesUC() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filtered, setFiltered] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { fetchCategories(); }, []);

  const showToast = (msg: string, type: 'success' | 'error') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  async function fetchCategories() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select(`*, vendor_products(count)`)
        .order("name", { ascending: true });
      if (error) throw error;
      const mapped = data.map((cat: any) => ({
        ...cat,
        service_count: cat.vendor_products?.[0]?.count ?? 0
      }));
      setCategories(mapped);
      setFiltered(mapped);
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(categories.filter(c => c.name.toLowerCase().includes(q)));
  }, [search, categories]);

  const handleEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsActive(cat.is_active ?? true);
    setPreview(cat.image_url || null);
    setImageFile(null);
    setShowModal(true);
  };

  async function handleDelete() {
    if (!deleteId) return;
    try {
      const { error } = await supabase.from("categories").delete().eq("id", deleteId);
      if (error) throw error;
      showToast("Category deleted successfully", "success");
      setCategories(categories.filter(c => c.id !== deleteId));
      setDeleteId(null);
    } catch (e: any) {
      showToast(e.message, "error");
    }
  }

  async function saveCategory(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (!name.trim() || !description.trim() || (!preview && !imageFile)) {
        showToast("All fields are required", "error");
        setSaving(false);
        return;
      }

      let finalImageUrl = preview;
      if (imageFile) {
        const filePath = `categories/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('category-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from('category-images').getPublicUrl(filePath);
        finalImageUrl = urlData.publicUrl;
      }

      const payload = { 
        name: name.trim(), 
        description: description.trim(), 
        is_active: isActive, 
        image_url: finalImageUrl 
      };

      const { error: saveError } = editing 
        ? await supabase.from("categories").update(payload).eq("id", editing.id) 
        : await supabase.from("categories").insert([payload]);
      
      if (saveError) throw saveError;

      showToast("Category Saved Successfully", 'success');
      fetchCategories(); 
      setShowModal(false);
    } catch (error: any) { 
      showToast(error.message, 'error'); 
    } finally { 
      setSaving(false); 
    }
  }

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
                    <Layers className="text-slate-400" size={16} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Inventory Taxonomy</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Service <span className="font-semibold text-slate-400">Categories</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-md font-medium opacity-80 leading-relaxed">
                  Manage the structural hierarchy of services and vendor classification.
                </p>
              </div>
              
              <div className="flex gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 min-w-[140px] shadow-sm">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Total Items</p>
                  <p className="text-4xl font-semibold text-slate-900 tracking-tighter">{categories.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 min-w-[140px] shadow-sm">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Active Now</p>
                  <p className="text-4xl font-semibold text-slate-900 tracking-tighter">{categories.filter(c => c.is_active).length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & CREATE BAR --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl flex flex-col md:flex-row gap-4 items-center border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:border-slate-200 focus:bg-white outline-none text-sm font-bold text-slate-900 transition-all"
            />
          </div>
          <button 
            onClick={() => { setEditing(null); setName(""); setDescription(""); setPreview(null); setImageFile(null); setShowModal(true); }}
            className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95"
          >
            <Plus size={18} /> New Category
          </button>
        </div>
      </div>

      {/* --- CONTENT GRID --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="animate-spin text-slate-400" size={32} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Accessing Database...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((cat) => (
              <div key={cat.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-slate-200 transition-all group flex flex-col">
                <div className="p-8 flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-slate-50 border border-slate-100 overflow-hidden shadow-inner relative group-hover:border-slate-300 transition-colors">
                    {cat.image_url ? (
                      <img src={cat.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200"><ImageIcon size={24} /></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-2 h-2 rounded-full ${cat.is_active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300'}`} />
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{cat.is_active ? 'Online' : 'Hidden'}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 uppercase truncate text-xl tracking-tight leading-none mb-3">{cat.name}</h3>
                    <div className="flex items-center gap-1.5 bg-slate-50 w-fit px-3 py-1.5 rounded-full border border-slate-100">
                      <Zap size={10} className="text-slate-400" />
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{cat.service_count} Services Attached</span>
                    </div>
                  </div>
                </div>
                <div className="px-8 pb-8 flex gap-3 mt-auto">
                  <button onClick={() => handleEdit(cat)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    <Edit2 size={14} /> Update
                  </button>
                  <button onClick={() => setDeleteId(cat.id)} className="w-14 flex items-center justify-center py-4 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- MODAL (GREY THEME) --- */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 px-10 py-8 flex items-center justify-between border-b border-slate-100">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Terminal Editor</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{editing ? "Edit Category" : "Create Category"}</h3>
              </div>
              <button onClick={() => setShowModal(false)} className="w-12 h-12 hover:bg-white rounded-full flex items-center justify-center transition-colors text-slate-400 border border-transparent hover:border-slate-100"><X size={20} /></button>
            </div>
            
            <form onSubmit={saveCategory} className="p-10 space-y-6">
              <div className="flex items-start gap-8">
                <div 
                  onClick={() => document.getElementById('fileIn')?.click()}
                  className={`w-32 h-32 rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-all overflow-hidden bg-slate-50 ${(!preview && !imageFile) ? 'border-red-200' : 'border-slate-200'}`}
                >
                  {preview ? <img src={preview} className="w-full h-full object-cover" alt="preview" /> : <div className="text-center p-2"><ImageIcon className="text-slate-300 mx-auto" size={20} /><p className="text-[8px] font-bold text-slate-400 uppercase mt-2">Upload JPG/PNG</p></div>}
                  <input id="fileIn" type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && (setPreview(URL.createObjectURL(e.target.files[0])), setImageFile(e.target.files[0]))} />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Display Name</label>
                    <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none text-sm font-medium text-slate-900 transition-all" placeholder="e.g. Electrician" />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                    <input type="checkbox" checked={isActive} onChange={() => setIsActive(!isActive)} className="w-5 h-5 accent-slate-900 rounded-lg" />
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">Publicly Visible</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Internal Metadata / Description</label>
                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:border-slate-900 focus:bg-white outline-none text-sm font-medium text-slate-900 resize-none transition-all" placeholder="Describe this category's scope..." />
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={saving} className="flex-[2] py-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                  {saving ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                  Complete Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION --- */}
      {deleteId && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-12 text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-8"><Trash2 size={32} /></div>
            <h3 className="text-2xl font-semibold text-slate-900 tracking-tight leading-none mb-4">Confirm Deletion</h3>
            <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-10 leading-relaxed">This record will be permanently purged from the database.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                className="w-full py-4 bg-red-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl shadow-lg hover:bg-red-600 transition-all"
              >
                Delete Record
              </button>
              <button onClick={() => setDeleteId(null)} className="w-full py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">
                Keep Intact
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}