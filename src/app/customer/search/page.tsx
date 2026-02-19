"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import ProductFilters from "@/components/ProductFilters";
import AuthModal from "@/components/AuthModal";
import { toast, Toaster } from "react-hot-toast"; 
import {
  ShoppingBag, Heart, Store, Loader2, ChevronLeft,
  ArrowRight, ChevronRight, Home, Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-[#ff3d00]" size={40} />
        <p className="text-slate-400 font-bold animate-pulse">Loading Marketplace...</p>
      </div>
    }>
      <Toaster position="bottom-center" reverseOrder={false} />
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  const [products, setProducts] = useState<any[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);

  useEffect(() => {
    fetchCategoryProducts();
  }, [categoryId, sort, priceRange]);

  const fetchCategoryProducts = async () => {
    setLoading(true);
    try {
      if (categoryId) {
        const { data: catData } = await supabase
          .from("categories")
          .select(`name, id, parent_id, parent:parent_id(id, name)`)
          .eq("id", categoryId)
          .single();
        setCategoryInfo(catData);
      }

      // IMPROVED QUERY: Fetching business reviews count and rating via the business profile
      let query = supabase
        .from("products")
        .select(`
          *,
          business_profiles!inner (
            id, 
            shop_name, 
            business_reviews (rating)
          )
        `)
        .eq("status", "active")
        .gte("price", priceRange[0])
        .lte("price", priceRange[1]);

      if (categoryId) {
        query = query.or(`category_id.eq.${categoryId},sub_category_id.eq.${categoryId}`);
      }

      if (sort === "price_asc") query = query.order("price", { ascending: true });
      else if (sort === "price_desc") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data: prodData } = await query;
      setProducts(prodData || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSort("relevance");
    setPriceRange([0, 50000]);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      <main className="max-w-[1600px] mx-auto px-4 md:px-10 py-6">
        <header className="mb-10">
          <nav className="flex items-center gap-2 mb-6 overflow-x-auto no-scrollbar whitespace-nowrap py-2">
            <Link href="/" className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400 hover:text-slate-900">
              <Home size={16} />
            </Link>
            <ChevronRight size={14} className="text-slate-300 shrink-0" />
            <Link href="/customer/categories" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#ff3d00] transition-colors">
              Categories
            </Link>
            {categoryInfo?.parent && (
              <>
                <ChevronRight size={14} className="text-slate-300 shrink-0" />
                <Link href={`/customer/search?category=${categoryInfo.parent.id}`} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-[#ff3d00] transition-colors">
                  {categoryInfo.parent.name}
                </Link>
              </>
            )}
            <ChevronRight size={14} className="text-slate-300 shrink-0" />
            <span className="text-xs font-black uppercase tracking-widest text-[#ff3d00] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              {categoryInfo?.name || "Global Market"}
            </span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Link href="/customer/categories" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:border-[#ff3d00] hover:text-[#ff3d00] transition-all bg-white">
                  <ChevronLeft size={20} />
                </Link>
                <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter capitalize">
                  {categoryInfo?.name || "Marketplace"}<span className="text-[#ff3d00]">.</span>
                </h1>
              </div>
              <p className="text-slate-400 font-bold text-sm ml-14">
                {products.length} Products found
              </p>
            </div>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-12">
          <aside className="w-full lg:w-80 shrink-0">
            <div className="sticky top-10">
              <ProductFilters
                selectedSort={sort}
                onSortChange={setSort}
                priceRange={priceRange}
                onPriceChange={setPriceRange}
                onReset={handleReset}
              />
            </div>
          </aside>

          <section className="flex-grow">
            {loading ? (
              <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Sorting Aisle...</p>
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
                <AnimatePresence>
                  {products.map((prod, idx) => (
                    <motion.div key={prod.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
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

function ProductCard({ product }: { product: any }) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  // Calculate Review Data
  const reviews = product.business_profiles?.business_reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviewCount).toFixed(1)
    : null;

  useEffect(() => {
    checkWishlistStatus();
  }, [product.id]);

  const checkWishlistStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("wishlist").select("id").eq("user_id", user.id).eq("product_id", product.id).single();
    if (data) setIsWishlisted(true);
  };

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAuthOpen(true); return; }

    const previousState = isWishlisted;
    setIsWishlisted(!previousState); 
    try {
      if (previousState) {
        await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
        toast.success("Removed from wishlist");
      } else {
        await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
        toast.success("Saved to wishlist!");
      }
    } catch (error) {
      setIsWishlisted(previousState);
      toast.error("Error updating wishlist");
    }
  };

  return (
    <>
      <div className="group bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/30 hover:shadow-orange-500/10 transition-all border border-transparent hover:border-orange-100 flex flex-col h-full relative">
        <div className="aspect-square rounded-[2rem] overflow-hidden mb-5 relative bg-slate-100">
          <img
            src={product.images?.[0] || "/placeholder-product.png"}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
          />
          
          {/* Rating Badge */}
          <div className="absolute top-4 left-4 z-10">
            {averageRating ? (
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-orange-50">
                <Star size={12} className="text-[#ff3d00] fill-[#ff3d00]" />
                <span className="text-[11px] font-black text-slate-900">{averageRating}</span>
                <span className="text-[10px] font-bold text-slate-400">({reviewCount})</span>
              </div>
            ) : (
              <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-50">
                <span className="text-[10px] font-black text-[#ff3d00] uppercase tracking-tighter">New Item</span>
              </div>
            )}
          </div>

          <button 
            onClick={handleWishlistClick}
            className={`absolute top-4 right-4 w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center transition-all shadow-sm z-10 ${
              isWishlisted ? "bg-[#ff3d00] text-white" : "bg-white/80 text-slate-400 hover:text-[#ff3d00]"
            }`}
          >
            <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
          </button>

          <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
            <div className="w-6 h-6 bg-[#ff3d00] rounded-lg flex items-center justify-center text-white">
              <Store size={12} /> 
            </div>
            <span className="text-[10px] font-black text-slate-800 uppercase tracking-tighter truncate">
              {product.business_profiles?.shop_name || "Local Shop"}
            </span>
          </div>
        </div>

        <div className="flex-grow px-2 space-y-3">
          <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[#ff3d00] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
          </div>
        </div>

        <div className="mt-6">
          <Link
            href={`/customer/product/${product.id}`}
            className="w-full bg-[#ff3d00] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900"
          >
            Explore Item <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} message="Sign in to save this item." />
    </>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 px-10">
      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShoppingBag className="text-slate-200" size={40} />
      </div>
      <h3 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">Nothing found here.</h3>
      <p className="text-slate-400 font-medium mb-8">Try adjusting your filters or checking another category.</p>
      <button onClick={onReset} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ff3d00] transition-all">
        Reset All Filters
      </button>
    </div>
  );
}