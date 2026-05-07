"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProductFilters from "@/components/ProductFilters";
import ProductCard from "@/components/ProductCard";
import EmptyState from "@/components/EmptyState";
import { toast, Toaster } from "react-hot-toast";
import { Loader2, Search, X, Store, ShoppingBag } from "lucide-react";
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

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<any>(null);


  // Filters
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [searchQuery, setSearchQuery] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [category, setCategory] = useState("");
  const [subCategory, setSubCategory] = useState("");

  useEffect(() => {
    const savedLocation = localStorage.getItem("user_location");
    if (savedLocation) setLocation(JSON.parse(savedLocation));

    const urlCategory = searchParams.get("category");
    const urlSubCategory = searchParams.get("subCategory");
    const urlBiz = searchParams.get("businessType");

    if (urlCategory) setCategory(urlCategory);
    if (urlSubCategory) setSubCategory(urlSubCategory);
    if (urlBiz) setBusinessType(urlBiz);
  }, [searchParams]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProducts();
    }, 400);

    return () => clearTimeout(handler);
  }, [sort, priceRange, searchQuery, businessType, category, subCategory, location]);

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
          pincode,
          city,
          business_reviews (rating)
        )
      `)
        .eq("status", "active")
        .eq("business_profiles.status", "approved");

      // Business Type
      if (businessType) {
        query = query.ilike(
          "business_profiles.business_type",
          `%${businessType}%`
        );
      }

      // Category
      if (category) {
        query = query.eq("category_id", category);
      }

      // Subcategory
      if (subCategory) {
        query = query.eq("sub_category_id", subCategory);
      }

      // Price
      query = query.lte("price", priceRange[1]);

      // Location priority
      if (location?.pincode && location.pincode !== "000000") {
        query = query.eq(
          "business_profiles.pincode",
          location.pincode
        );
      } else if (location?.city) {
        query = query.eq(
          "business_profiles.city",
          location.city
        );
      }

      // Sorting
      if (sort === "price-low") {
        query = query.order("price", { ascending: true });
      } else if (sort === "price-high") {
        query = query.order("price", { ascending: false });
      } else {
        query = query.order("created_at", {
          ascending: false,
        });
      }
      const { data, error } = await query.limit(100);

      if (error) throw error;

      let filteredData = data || [];

      // Search by shop name manually
      if (searchQuery) {
  const search = searchQuery.toLowerCase();

  filteredData = filteredData.filter((product: any) => {
    const productName =
      product.name?.toLowerCase() || "";

    const shopName =
      product.business_profiles?.shop_name?.toLowerCase() || "";

    return (
      productName.includes(search) ||
      shopName.includes(search)
    );
  });
}
      if (error) throw error;

      setItems(filteredData);
    } catch (err) {
      console.error(err);
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
              <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                  <span>{items.length} products found</span>
                </div>

              </div>
            </div>

            <div className="relative w-full md:w-[400px] group">
              <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                <Search size={18} className="text-slate-400 group-focus-within:text-[#ff3d00] transition-colors" />
              </div>
              <input
                type="text"
                placeholder="Search by product or shop name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-100 rounded-[2rem] py-5 pl-14 pr-12 text-sm font-bold text-slate-900 focus:outline-none focus:border-[#ff3d00] transition-all shadow-xl shadow-slate-200/40"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute inset-y-0 right-5 flex items-center text-slate-400">
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
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Searching...</p>
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {items.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                    >
                      <ProductCard
                        product={item}
                        onShopClick={(shopName: string) => {
                          setSearchQuery(shopName);

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                      />
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