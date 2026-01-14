"use client";

import React, { useEffect, useState, ChangeEvent, useMemo, useRef } from 'react';
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, UploadCloud, Package, PlusCircle,
  PackagePlus, Trash2, Pencil,
  Loader, LayoutGrid, Share2, Zap,
  ChevronLeft, ChevronRight
} from "lucide-react";

interface Category { id: string; name: string; }
interface Product {
  id: string;
  product_name: string;
  price: number;
  description: string;
  category_id: string;
  is_active: boolean;
  product_image: string;
  product_video?: string;
  created_at: string;
}

// --- MOBILE OPTIMIZED SLIDER ---
const ProductImageSlider: React.FC<{ images: string[]; isActive: boolean }> = ({ images, isActive }) => {
  const [index, setIndex] = useState(0);

  if (!images || images.length === 0 || images[0] === "") {
    return (
      <div className="relative bg-gray-100 aspect-square flex items-center justify-center">
        <Package className="text-gray-300" size={48} />
      </div>
    );
  }

  return (
    <div className="relative aspect-square overflow-hidden bg-gray-50">
      <img 
        src={images[index]} 
        className="w-full h-full object-cover" 
        alt="Product" 
      />

      {images.length > 1 && (
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none">
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIndex(i => i === 0 ? images.length - 1 : i - 1); }}
            className="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} className="text-black" />
          </button>
          <button 
            type="button" 
            onClick={(e) => { e.stopPropagation(); setIndex(i => i === images.length - 1 ? 0 : i + 1); }}
            className="pointer-events-auto w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
          >
            <ChevronRight size={20} className="text-black" />
          </button>
        </div>
      )}
      {/* Pagination dots */}
      <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
        {images.map((_, i) => (
          <div key={i} className={`h-1.5 rounded-full transition-all ${i === index ? "w-4 bg-yellow-400" : "w-1.5 bg-white/50"}`} />
        ))}
      </div>
    </div>
  );
};


export default function VendorInventoryStudio() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [formData, setFormData] = useState({
    product_name: '', price: '', description: '', category_id: '', is_active: true
  });

  const mediaScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { 
    fetchInitialData(); 
  }, []);

 async function fetchInitialData() {
  setFetching(true);

  // Fetch active categories
  const { data: catData } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name');
  if (catData) setCategories(catData);

  // Fetch current user
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // Get the vendor record for this user
    const { data: vendorRecord } = await supabase
      .from('vendor_register')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (vendorRecord) {
      // Fetch only products uploaded by this vendor
      const { data: prodData } = await supabase
        .from('vendor_products')
        .select('*')
        .eq('vendor_id', vendorRecord.id)  // <-- filter by logged-in vendor
        .order('created_at', { ascending: false });

      if (prodData) setProducts(prodData);
    }
  }

  setFetching(false);
}


  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFileObjects(prev => [...prev, ...filesArray]);
      const previewUrls = filesArray.map(file => URL.createObjectURL(file));
      setImages(prev => [...prev, ...previewUrls]);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = images[index];
    if (imageToRemove.startsWith('blob:')) {
      const blobCountBefore = images.slice(0, index).filter(img => img.startsWith('blob:')).length;
      setFileObjects(prev => prev.filter((_, i) => i !== blobCountBefore));
    }
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({ product_name: '', price: '', description: '', category_id: '', is_active: true });
    setImages([]);
    setFileObjects([]);
    setIsOtherSelected(false);
  };

  const startEdit = (item: Product) => {
    setEditingId(item.id);
    setFormData({
      product_name: item.product_name,
      price: item.price.toString(),
      description: item.description || '',
      category_id: item.category_id,
      is_active: item.is_active
    });
    setImages(item.product_image ? item.product_image.split('|||') : []);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: vendorRecord } = await supabase.from('vendor_register').select('id').eq('user_id', user?.id).single();
      if (!vendorRecord) throw new Error("Vendor profile not found");

      const uploadedUrls = await Promise.all(
        fileObjects.map(async (file) => {
          const filePath = `${vendorRecord.id}/${Date.now()}-${file.name}`;
          const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, file);
          if (uploadError) throw uploadError;
          return supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl;
        })
      );

      const finalImages = [...images.filter(img => img.startsWith('http')), ...uploadedUrls].join('|||');
      
      let catId = formData.category_id;
      if (isOtherSelected) {
        const { data: newCat } = await supabase.from('categories').insert([{ name: newCategoryName.trim(), is_active: true }]).select().single();
        if (newCat) catId = newCat.id;
      }

      const payload = {
        product_name: formData.product_name,
        price: parseFloat(formData.price),
        description: formData.description,
        category_id: catId,
        is_active: formData.is_active,
        product_image: finalImages,
        vendor_id: vendorRecord.id
      };

      if (editingId) await supabase.from('vendor_products').update(payload).eq('id', editingId);
      else await supabase.from('vendor_products').insert([payload]);

      resetForm();
      fetchInitialData();
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-black pb-12">
       {/* --- HERO SECTION --- */}

      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-20 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">

        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />

        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="text-center md:text-left">

            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-5xl md:text-5xl font-black tracking-tighter text-gray-900 leading-none uppercase">

              Inventory <span className="text-red-600 ">Studio</span>

            </motion.h1>

          </div>

          <motion.div initial={{ opacity: 0, rotate: 0, scale: 0.9 }} animate={{ opacity: 1, rotate: 3, scale: 1 }} className="hidden lg:block bg-white p-8 rounded-[2.5rem] shadow-xl border-2 border-yellow-100 relative">

            <div className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-xl shadow-lg">

              <Zap size={20} fill="currentColor" />

            </div>

            <div className="text-yellow-600">

              <PackagePlus size={60} strokeWidth={2.5} />

            </div>

          </motion.div>

        </div>

      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Form Section */}
          <div className="lg:col-span-5">
            <motion.div layout className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-900 border border-gray-100">
                      {editingId ? <Pencil size={20} /> : <PlusCircle size={20} />}
                    </div>
                    <h2 className="font-black text-xl">{editingId ? 'Update Item' : 'Add New Item'}</h2>
                  </div>
                  {editingId && (
                    <button onClick={resetForm} className="p-2 bg-gray-50 text-gray-400 rounded-full">
                      <X size={20} />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Title *</label>
                    <input required className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold focus:ring-2 ring-yellow-400 outline-none transition-all" value={formData.product_name} onChange={(e) => setFormData({ ...formData, product_name: e.target.value })} placeholder="Rolex Datejust..." />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Price (₹)</label>
                      <input type="number" required className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold outline-none" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Category</label>
                      <select required className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold outline-none" value={formData.category_id} onChange={(e) => { setFormData({ ...formData, category_id: e.target.value }); setIsOtherSelected(e.target.value === "other"); }}>
                        <option value="">Select</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                        <option value="other" className="text-blue-500">+ Add New</option>
                      </select>
                    </div>
                  </div>

                  {isOtherSelected && (
                    <input className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-4 font-bold text-blue-900 animate-in slide-in-from-top-2" placeholder="New Category Name..." value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                  )}

                  <div>
                    <label className="block text-[10px] font-black uppercase text-gray-400 mb-1.5 ml-1">Description</label>
                    <textarea rows={2} className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 font-bold outline-none resize-none" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Optional details..." />
                  </div>

                  {/* Media Upload */}
                  <div className="bg-gray-50/50 rounded-2xl p-4 border border-dashed border-gray-200">
                    <p className="text-[10px] font-black uppercase text-gray-400 mb-3">Product Media ({images.length})</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                      <label className="min-w-[70px] h-[70px] bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 active:bg-gray-100 cursor-pointer">
                        <UploadCloud size={20} />
                        <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                      </label>
                      {images.map((img, i) => (
                        <div key={i} className="min-w-[70px] h-[70px] rounded-xl relative ring-1 ring-gray-100 shadow-sm">
                          <img src={img} className="w-full h-full object-cover rounded-xl" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1"><X size={10} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <button disabled={loading} className={`w-full py-5 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-3 transition-all active:scale-95 ${editingId ? 'bg-yellow-500' : 'bg-black'} disabled:bg-gray-300`}>
                  {loading ? <Loader className="animate-spin" size={20} /> : editingId ? "Update Product" : "Publish Listing"}
                </button>
              </form>
            </motion.div>
          </div>

          {/* List Section */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between sticky top-0 bg-[#F9FAFB]/80 backdrop-blur-md py-2 z-30">
              <h2 className="font-black text-xl flex items-center gap-2">
                <LayoutGrid size={20} className="text-red-500" /> Catalog
              </h2>
              <span className="bg-white px-3 py-1 rounded-full border border-gray-200 text-[10px] font-black">{products.length} ITEMS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <AnimatePresence mode="popLayout">
                {fetching ? (
                  Array(4).fill(0).map((_, i) => <div key={i} className="aspect-square bg-gray-200 rounded-3xl animate-pulse" />)
                ) : products.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                    <PackagePlus size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="font-bold text-gray-400">No items listed yet.</p>
                  </div>
                ) : (
                  products.map((item) => (
                    <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group">
                      <ProductImageSlider images={item.product_image.split("|||")} isActive={item.is_active} />
                      <div className="p-5">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-black text-lg truncate flex-1 mr-2">{item.product_name}</h3>
                          <div className="flex gap-2">
                             <button onClick={() => startEdit(item)} className="p-2 bg-gray-50 text-gray-900 rounded-lg border border-gray-100"><Pencil size={14} /></button>
                             <button onClick={() => { if(confirm("Delete?")) supabase.from('vendor_products').delete().eq('id', item.id).then(() => fetchInitialData()) }} className="p-2 bg-red-50 text-red-500 rounded-lg border border-red-100"><Trash2 size={14} /></button>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <p className="text-2xl font-black text-red-500">₹{item.price.toLocaleString()}</p>
                          <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-black transition-colors"><Share2 size={16} /></button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}