"use client";

import React, { useEffect, useState, Suspense } from "react";
// FIXED: Added useSearchParams and usePathname imports
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { toast, Toaster } from "react-hot-toast";
import { Loader2, Search, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductGalleryWrapper() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#ff3d00]" size={40} />
        <p className="text-slate-400 font-bold animate-pulse">Loading Gallery...</p>
      </div>
    }>
      <Toaster position="bottom-center" />
      <ProductGalleryPage />
    </Suspense>
  );
}

function ProductGalleryPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- FILTERS STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // 1. Sync State with URL on Load
  useEffect(() => {
    const urlCategory = searchParams.get("category");
    const urlSubCategory = searchParams.get("subCategory");
    const urlBiz = searchParams.get("businessType");

    if (urlCategory) setCategory(urlCategory);
    if (urlSubCategory) setSubCategory(urlSubCategory);
    if (urlBiz) setBusinessType(urlBiz);
  }, [searchParams]);

  // 2. Fetch Products when filters change
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(handler);
  }, [sort, priceRange, searchQuery, businessType, category, subCategory]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("products")
        .select(`
          *,
          business_profiles!inner (
            id,
            shop_name,
            business_type,
            status,
            business_reviews (
              rating
            )
          )
        `)
        .eq("status", "active")
        .eq("business_profiles.status", "approved");

      // --- APPLY FILTERS ---
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (businessType) {
        query = query.eq("business_profiles.business_type", businessType);
      }

      if (category) {
        query = query.eq("category_id", category);
      }

      if (subCategory) {
        query = query.eq("sub_category_id", subCategory);
      }

      // Price Filter
      query = query.lte("price", priceRange[1]);

      // Sorting Logic
      if (sort === "price-low") query = query.order("price", { ascending: true });
      else if (sort === "price-high") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);

    } catch (err: any) {
      console.error("Filter Error:", err);
      toast.error(err.message || "Failed to filter products");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSort("relevance");
    setPriceRange([0, 50000]);
    setSearchQuery("");
    setBusinessType("");
    setCategory("");
    setSubCategory("");
    // Clear URL params
    router.push(pathname);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="max-w-[1600px] mx-auto px-4 md:px-10 py-6">

        <header className="mb-10 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                Explore<span className="text-[#ff3d00]">.</span>
              </h1>
              <p className="text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest">
                {products.length} Items found in the vault
              </p>
            </div>

            <div className="relative w-full md:w-[400px] group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-[#ff3d00] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search for items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-5 pl-14 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#ff3d00] focus:ring-4 focus:ring-orange-500/5 transition-all shadow-xl shadow-slate-200/40 placeholder:text-slate-300"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-slate-900">
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 md:gap-12">
          <aside className="w-full lg:w-80 shrink-0">
            <ProductFilters
              selectedSort={sort}
              onSortChange={setSort}
              priceRange={priceRange}
              onPriceChange={setPriceRange}
              selectedBusinessType={businessType}
              onBusinessTypeChange={setBusinessType}
              selectedCategory={category}
              onCategoryChange={setCategory}
              selectedSubCategory={subCategory}
              onSubCategoryChange={setSubCategory}
              onReset={handleReset}
            />
          </aside>

          <section className="flex-grow">
            {loading ? (
              <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Searching the Vault...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {products.map((prod, idx) => (
                    <motion.div
                      key={prod.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                    >
                      <ProductCard product={prod} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <EmptyState onReset={handleReset} />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}