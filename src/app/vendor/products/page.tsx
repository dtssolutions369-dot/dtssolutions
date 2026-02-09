"use client";

import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Trash2,
  Pencil,
  Loader,
  ArrowRight,
  Camera,
  Box,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// --- TYPES ---
interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  product_name: string;
  price: number;
  description: string;
  category_id: string;
  is_active: boolean;
  product_image: string;
}

// --- IMAGE SLIDER ---
const CompactImageSlider: React.FC<{ images: string[] }> = ({ images }) => {
  const [index, setIndex] = useState(0);
  if (!images || images.length === 0 || images[0] === "")
    return (
      <div className="bg-slate-50 aspect-square flex items-center justify-center rounded-2xl border border-slate-100">
        <Package className="text-slate-200" size={24} />
      </div>
    );

  return (
    <div className="relative aspect-square overflow-hidden rounded-xl group/slider bg-slate-50 border border-slate-100">
      <img src={images[index]} className="w-full h-full object-cover" alt="Product" />
      {images.length > 1 && (
        <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover/slider:opacity-100 transition-all">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
            }}
            className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow"
          >
            <ChevronLeft size={10} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
            }}
            className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center shadow"
          >
            <ChevronRight size={10} />
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function VendorInventoryStudio() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [fileObjects, setFileObjects] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    product_name: "",
    price: "",
    description: "",
    category_id: "",
    is_active: true,
  });

  // SEARCH STATE
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInitialData();
  }, []);

  // --- FETCH INITIAL DATA ---
  async function fetchInitialData() {
    setFetching(true);

    const { data: catData } = await supabase
      .from("categories")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (catData) setCategories(catData);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: vendorRecord } = await supabase
        .from("vendor_register")
        .select("id, city, pincode")
        .eq("user_id", user.id)
        .single();

      if (vendorRecord) {
        const { data: prodData } = await supabase
          .from("vendor_products")
          .select("*")
          .eq("vendor_id", vendorRecord.id)
          .order("created_at", { ascending: false });
        if (prodData) setProducts(prodData);
      }
    }

    setFetching(false);
  }

  // --- FILTER PRODUCTS ---
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, products]);

  // --- IMAGE HANDLER ---
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFileObjects((prev) => [...prev, ...filesArray]);
      setImages((prev) => [...prev, ...filesArray.map((file) => URL.createObjectURL(file))]);
    }
  };

  // --- SUBMIT FORM ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const { data: vendorRecord } = await supabase
        .from("vendor_register")
        .select("id, city, pincode")
        .eq("user_id", user.id)
        .single();
      if (!vendorRecord) throw new Error("Vendor profile not found");

      // --- UPLOAD NEW FILES ---
      const uploadedUrls = await Promise.all(
        fileObjects.map(async (file) => {
          const filePath = `${vendorRecord.id}/${Date.now()}-${file.name}`;
          await supabase.storage.from("product-images").upload(filePath, file, { upsert: true });
          const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
          return urlData.publicUrl;
        })
      );

      const finalImages = [...images.filter((img) => img.startsWith("http")), ...uploadedUrls].join("|||");

      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        product_image: finalImages,
        vendor_id: vendorRecord.id,
        city: vendorRecord.city,
        pincode: vendorRecord.pincode,
      };

      if (editingId) {
        await supabase.from("vendor_products").update(payload).eq("id", editingId);
      } else {
        await supabase.from("vendor_products").insert([payload]);
      }

      // --- RESET FORM ---
      setEditingId(null);
      setFormData({ product_name: "", price: "", description: "", category_id: "", is_active: true });
      setImages([]);
      setFileObjects([]);
      fetchInitialData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-24 font-sans selection:bg-[#74cb01]/30">
      {/* HEADER */}
      <header className="relative pt-24 pb-44 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-[#00AEEF]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[0%] left-[5%] w-[400px] h-[400px] bg-[#74cb01]/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AEEF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AEEF]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Inventory Studio</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Manage Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Inventory.</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Create, edit, and showcase your premium products with our advanced inventory management tools.
            </p>
          </motion.div>
        </div>
      </header>

      {/* FILTER BAR */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-slate-950 rounded-[3rem] p-3 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Search Input */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 focus-within:border-[#F26522]/40 transition-all">
              <Search size={20} className="text-[#F26522]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Search Products</label>
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or details..."
                  className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-slate-600 w-full mt-0.5"
                />
              </div>
            </div>

            {/* Stats Display */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5">
              <Box size={20} className="text-[#74cb01]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Assets</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">{products.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* PRODUCT FORM */}
          <aside className="lg:col-span-5 xl:col-span-4">
            <div className="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                <h2 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                  {editingId ? "Modify Asset" : "Create Asset"}
                </h2>
                {editingId && (
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ product_name: "", price: "", description: "", category_id: "", is_active: true });
                      setImages([]);
                      setFileObjects([]);
                    }}
                    className="text-[10px] font-black text-red-500 uppercase hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Title</label>
                  <input
                    required
                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-base font-bold border border-transparent focus:border-[#74cb01]/40 focus:bg-white outline-none transition-all shadow-inner"
                    value={formData.product_name}
                    onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                    placeholder="Asset Name"
                  />
                </div>

                {/* Price & Collection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Price</label>
                    <input
                      type="number"
                      required
                      className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-base font-bold border border-transparent focus:border-[#74cb01]/40 focus:bg-white outline-none transition-all shadow-inner"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Collection</label>
                    <select
                      className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-sm font-bold border border-transparent outline-none focus:bg-white focus:border-[#74cb01]/40 transition-all shadow-inner"
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">Select</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-500 ml-1">Details</label>
                  <textarea
                    rows={4}
                    className="w-full bg-slate-50 px-6 py-4 rounded-2xl text-base font-medium border border-transparent focus:border-[#74cb01]/40 focus:bg-white outline-none resize-none transition-all shadow-inner"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Craftsmanship details..."
                  />
                </div>

                {/* Media Upload */}
                <div className="relative">
                  <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[2.5rem] cursor-pointer hover:bg-[#74cb01]/5 hover:border-[#74cb01]/40 transition-all bg-slate-50/50 group">
                    <Camera size={28} className="text-slate-300 mb-2 group-hover:text-[#74cb01] transition-colors" />
                    <span className="text-[10px] font-black uppercase text-slate-400">Media Assets</span>
                    <input type="file" multiple className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                  {images.length > 0 && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                      {images.map((img, i) => (
                        <img key={i} src={img} className="w-14 h-14 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
                      ))}
                    </div>
                  )}
                </div>

                <button
                  disabled={loading}
                  className="w-full py-5 bg-slate-950 text-white rounded-[1.5rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-[#74cb01] shadow-xl hover:shadow-[#74cb01]/30 transition-all"
                >
                  {loading ? <Loader className="animate-spin" size={18} /> : editingId ? "Update Vault" : "Publish Asset"}
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </aside>

          {/* PRODUCT GALLERY */}
          <section className="lg:col-span-7 xl:col-span-8">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Search Results</h3>
                <span className="bg-[#74cb01]/10 text-[#74cb01] text-[10px] px-3 py-1 rounded-full font-black uppercase">
                  {filteredProducts.length} Items Found
                </span>
              </div>
            </div>

            {fetching ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="animate-spin text-[#00AEEF] mb-6" size={50} />
                <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Loading Inventory</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                <AnimatePresence mode="popLayout">
                  {filteredProducts.length === 0 ? (
                    <div className="col-span-full py-32 flex flex-col items-center justify-center">
                      <div className="bg-white border border-slate-100 rounded-[4rem] py-40 text-center shadow-sm">
                        <Search className="mx-auto text-slate-100 mb-8" size={100} strokeWidth={1} />
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-2">No Assets Found</h3>
                        <p className="text-slate-400 font-medium text-lg">Try searching for a different name or category.</p>
                      </div>
                    </div>
                  ) : (
                    filteredProducts.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        whileHover={{ y: -12 }}
                        className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col"
                      >
                        <div className="relative aspect-square bg-slate-100 overflow-hidden">
                          <CompactImageSlider images={item.product_image.split("|||")} />

                          <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-[#74cb01] animate-pulse" />
                              <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">Active</span>
                            </div>
                          </div>

                          <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">
                              <Pencil size={20} />
                            </div>
                          </div>
                        </div>

                        {/* Info Section */}
                        <div className="p-8 flex-1 flex flex-col">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter line-clamp-2 group-hover:text-[#00AEEF] transition-colors leading-[1.1] mb-4">
                            {item.product_name}
                          </h3>

                          <p className="text-sm font-medium text-slate-500 mb-6 line-clamp-3">{item.description}</p>

                          <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                            <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pricing</p>
                              <p className="text-2xl font-black text-[#F26522] tracking-tighter">₹{Number(item.price).toLocaleString()}</p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setFormData({ ...item, price: item.price.toString() });
                                  setImages(item.product_image.split("|||"));
                                  setFileObjects([]);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className="h-10 w-10 bg-slate-50 group-hover:bg-[#00AEEF] group-hover:text-white rounded-xl flex items-center justify-center text-slate-300 transition-all duration-300"
                              >
                                <Pencil size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  if (confirm("Delete Asset?")) {
                                    supabase.from("vendor_products").delete().eq("id", item.id).then(() => fetchInitialData());
                                  }
                                }}
                                className="h-10 w-10 bg-slate-50 group-hover:bg-red-500 group-hover:text-white rounded-xl flex items-center justify-center text-slate-300 transition-all duration-300"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
