"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import {
  Plus, Search, ShoppingBag, MoreVertical, Loader2,
  PackageOpen, ChevronRight, ChevronLeft, Edit3, Filter,
  Layers, LayoutGrid
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
export const dynamic = 'force-dynamic';
export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Get the business profile ID for this user
      const { data: profile } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("user_id", session.user.id)
        .single();

      if (!profile) return;

      // 2. Fetch only products belonging to this business
      const [prodRes, catRes] = await Promise.all([
        supabase
          .from("products")
          .select(`*, categories:category_id (name)`)
          .eq("business_id", profile.id) // IMPORTANT: Filter by business
          .order("created_at", { ascending: false }),
        supabase.from("categories").select("*")
      ]);

      if (prodRes.error) throw prodRes.error;

      setProducts(prodRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const activeSubCategories = categories.filter((c) => c.parent_id === selectedCategory);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category_id === selectedCategory;
    const matchesSubCategory = selectedSubCategory === "all" || p.sub_category_id === selectedSubCategory;
    return matchesSearch && matchesCategory && matchesSubCategory;
  });

  return (
    <div className="flex flex-col min-h-screen bg-white w-full">
        <Toaster position="bottom-center" />
      {/* 1. TOP HEADER - STICKY & FULL WIDTH */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg shadow-orange-200">
            <ShoppingBag size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Product Catalog</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">{products.length} Items Syncing</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Quick search..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl outline-none focus:bg-white focus:border-orange-500 transition-all text-sm font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Link
            href="/business/add"
            className="bg-[#ff3d00] hover:bg-black text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shrink-0 shadow-lg shadow-orange-100"
          >
            <Plus size={18} strokeWidth={3} /> <span className="hidden sm:inline">Add Product</span>
          </Link>
        </div>
      </header>

      {/* 2. CATEGORY BAR - EDGE TO EDGE */}
      <div className="bg-slate-50/50 border-b border-slate-100 px-8 py-4 overflow-x-auto no-scrollbar flex items-center gap-2">
        <button
          onClick={() => { setSelectedCategory("all"); setSelectedSubCategory("all"); }}
          className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === "all" ? "bg-black text-white shadow-lg" : "text-slate-400 hover:text-slate-900"}`}
        >
          All
        </button>
        {categories.filter(c => !c.parent_id).map((cat) => (
          <button
            key={cat.id}
            onClick={() => { setSelectedCategory(cat.id); setSelectedSubCategory("all"); }}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat.id ? "bg-orange-600 text-white shadow-lg shadow-orange-100" : "text-slate-400 hover:text-slate-900"}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* 3. SUB-CATEGORY BAR (Conditional) */}
      <AnimatePresence>
        {selectedCategory !== "all" && activeSubCategories.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-white border-b border-slate-100 px-8 py-3 flex items-center gap-4 overflow-x-auto no-scrollbar"
          >
            <Layers size={14} className="text-orange-500 shrink-0" />
            {activeSubCategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubCategory(sub.id)}
                className={`text-[11px] font-bold px-3 py-1 rounded-lg transition-all ${selectedSubCategory === sub.id ? "bg-slate-100 text-slate-900" : "text-slate-400 hover:text-slate-600"}`}
              >
                {sub.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. MAIN GRID - NO PADDING ON SIDES ON SMALL SCREENS */}
      <main className="flex-grow p-4 md:p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="animate-spin text-[#ff3d00]" size={40} />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Updating Catalog</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <LayoutGrid size={48} className="text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No products here</h3>
            <p className="text-sm text-slate-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Inside your ProductsPage.tsx - Updated ProductCard component

function ProductCard({ product }: { product: any }) {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const hasImages = product.images && product.images.length > 0;

  // CHECK STATUS
  const isInactive = product.status === 'inactive';

  return (
    <motion.div
      layout
      className={`bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col h-full relative ${isInactive ? 'ring-2 ring-red-50' : ''}`}
    >
      {/* Show overlay ONLY if inactive */}
      {isInactive && (
        <div className="absolute inset-0 z-10 bg-white/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-white shadow-xl p-3 rounded-2xl mb-2 border border-red-100">
            <PackageOpen size={24} className="text-red-600" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-white px-2 py-1 rounded-md shadow-sm">Hidden from Public<br /> take a plans to unhide it </p>
        </div>
      )}

      <div className="relative aspect-square bg-slate-50 overflow-hidden">
        {hasImages ? (
          <img
            src={product.images[currentImgIndex]}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${!isInactive && 'group-hover:scale-110'}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-200 bg-slate-100">
            <PackageOpen size={40} />
          </div>
        )}

        {/* Price Tag Overlay */}
        <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-lg text-sm font-black ${isInactive ? 'bg-slate-400 text-white' : 'bg-black/80 text-white backdrop-blur-md'}`}>
          ₹{product.price.toLocaleString('en-IN')}
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`font-bold text-slate-900 transition-colors line-clamp-1 ${!isInactive && 'group-hover:text-[#ff3d00]'}`}>
            {product.name}
          </h3>
          <button className="text-slate-300 hover:text-black transition-colors"><MoreVertical size={16} /></button>
        </div>

        <p className="text-slate-400 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
          {product.description || "No description provided."}
        </p>

        <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-2 py-1 rounded">
              {product.categories?.name || "Stock"}
            </span>
            {isInactive && (
              <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
            )}
          </div>

          <Link
            href={`/business/products/add?id=${product.id}`}
            className="p-2 rounded-lg bg-slate-50 text-slate-400 hover:bg-[#ff3d00] hover:text-white transition-all"
          >
            <Edit3 size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}