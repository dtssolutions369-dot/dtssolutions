"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { toast, Toaster } from "react-hot-toast";
import { Loader2, Search, X, MapPin } from "lucide-react";
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

  // --- STATE ---
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);
  
  // Filters
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  // 1. Load Location and Sync URL Params
  useEffect(() => {
    // Load Location from Storage
    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) {
      setLocation(JSON.parse(savedLocation));
    }

    // Sync URL Params
    const urlCategory = searchParams.get("category");
    const urlSubCategory = searchParams.get("subCategory");
    const urlBiz = searchParams.get("businessType");

    if (urlCategory) setCategory(urlCategory);
    if (urlSubCategory) setSubCategory(urlSubCategory);
    if (urlBiz) setBusinessType(urlBiz);
  }, [searchParams]);

  // 2. Fetch Products when filters or location changes
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 400);
    return () => clearTimeout(handler);
  }, [sort, priceRange, searchQuery, businessType, category, subCategory, location]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // BASE QUERY
      let baseQuery = supabase
        .from("products")
        .select(`
          *,
          business_profiles!inner (
            id,
            shop_name,
            business_type,
            status,
            pincode,
            city,
            business_reviews (rating)
          )
        `)
        .eq("status", "active")
        .eq("business_profiles.status", "approved");

      // Apply Filters (Shared across Pincode/City/All)
      const applyFilters = (q: any) => {
        let filtered = q;
        if (searchQuery) filtered = filtered.ilike("name", `%${searchQuery}%`);
        if (businessType) filtered = filtered.eq("business_profiles.business_type", businessType);
        if (category) filtered = filtered.eq("category_id", category);
        if (subCategory) filtered = filtered.eq("sub_category_id", subCategory);
        filtered = filtered.lte("price", priceRange[1]);
        
        if (sort === "price-low") filtered = filtered.order("price", { ascending: true });
        else if (sort === "price-high") filtered = filtered.order("price", { ascending: false });
        else filtered = filtered.order("created_at", { ascending: false });
        
        return filtered;
      };

      let finalData: any[] = [];

      // STEP A: Try Pincode Search
      if (location?.pincode && location.pincode !== "000000") {
        const { data: pincodeData } = await applyFilters(
          baseQuery.eq("business_profiles.pincode", location.pincode)
        );

        if (pincodeData && pincodeData.length > 0) {
          finalData = pincodeData;
        } 
        // STEP B: Fallback to City
        else if (location?.city) {
            // We have to re-create the base query because the previous one was already filtered by pincode
            let cityQuery = supabase
                .from("products")
                .select(`*, business_profiles!inner (*)`)
                .eq("status", "active")
                .eq("business_profiles.status", "approved")
                .eq("business_profiles.city", location.city);
            
            const { data: cityData } = await applyFilters(cityQuery);
            finalData = cityData || [];
        }
      } else {
        // NO LOCATION: Fetch everything
        const { data: allData } = await applyFilters(baseQuery).limit(40);
        finalData = allData || [];
      }

      setProducts(finalData);

    } catch (err: any) {
      console.error("Filter Error:", err);
      toast.error("Failed to fetch products");
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
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs md:text-sm uppercase tracking-widest">
                <span>{products.length} Items found</span>
                {location && (
                    <div className="flex items-center gap-1 bg-orange-100 text-[#ff3d00] px-3 py-1 rounded-full lowercase tracking-normal font-black">
                        <MapPin size={12} />
                        {location.pincode}
                    </div>
                )}
              </div>
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
              <div className="space-y-4">
                 <EmptyState onReset={handleReset} />
                 {location?.city && (
                    <p className="text-center text-slate-400 font-medium">
                        Tip: We couldn't find items in {location.pincode} or {location.city}. <br/>
                        Try expanding your search by resetting filters.
                    </p>
                 )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}