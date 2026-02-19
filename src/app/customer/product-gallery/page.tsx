"use client";

import React, { useEffect, useState, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import ProductFilters from "@/components/ProductFilters";
import AuthModal from "@/components/AuthModal";
import { toast, Toaster } from "react-hot-toast";
import {
    ShoppingBag, Heart, Store, Loader2, Search,
    ArrowRight, Star, X
} from "lucide-react";
import Link from "next/link";
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
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sort, setSort] = useState("relevance");
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
    const [searchQuery, setSearchQuery] = useState(""); // NEW: Search state

    useEffect(() => {
        // Debounce the search to avoid too many API calls
        const handler = setTimeout(() => {
            fetchProducts();
        }, 400);

        return () => clearTimeout(handler);
    }, [sort, priceRange, searchQuery]);

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
            business_reviews (rating)
          )
        `)
                .eq("status", "active")
                .gte("price", priceRange[0])
                .lte("price", priceRange[1]);

            // NEW: Search Filter
            if (searchQuery.trim()) {
                query = query.ilike("name", `%${searchQuery}%`);
            }

            if (sort === "price_asc") query = query.order("price", { ascending: true });
            else if (sort === "price_desc") query = query.order("price", { ascending: false });
            else query = query.order("created_at", { ascending: false });

            const { data } = await query;
            setProducts(data || []);
        } catch (err) {
            console.error("Error:", err);
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSort("relevance");
        setPriceRange([0, 50000]);
        setSearchQuery("");
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20">
            <main className="max-w-[1600px] mx-auto px-2 md:px-10 py-6">

                {/* --- HEADER & SEARCH BAR --- */}
                <header className="mb-10 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                                Explore<span className="text-[#ff3d00]">.</span>
                            </h1>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">
                                {products.length} Items found in the vault
                            </p>
                        </div>

                        {/* SEARCH INPUT COMPONENT */}
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
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute inset-y-0 right-5 flex items-center text-slate-400 hover:text-slate-900"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>
                    </div>
                </header>

                <div className="flex flex-col lg:flex-row gap-12">
                    {/* --- SIDEBAR --- */}
                    <aside className="w-full lg:w-80 shrink-0">
                        <div className="sticky top-28">
                            <ProductFilters
                                selectedSort={sort}
                                onSortChange={setSort}
                                priceRange={priceRange}
                                onPriceChange={setPriceRange}
                                onReset={handleReset}
                            />
                        </div>
                    </aside>

                    {/* --- GRID --- */}
                    <section className="flex-grow">
                        {loading ? (
                            <div className="h-[50vh] flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
                                <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Searching the Vault...</p>
                            </div>
                        ) : products.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8">
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

// ... ProductCard and EmptyState sub-components remain the same

// ProductCard and EmptyState components remain the same as your provided code
function ProductCard({ product }: { product: any }) {
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);

    const reviews = product.business_profiles?.business_reviews || [];
    const reviewCount = reviews.length;
    const averageRating = reviewCount > 0
        ? (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviewCount).toFixed(1)
        : null;

    const handleWishlistClick = async (e: React.MouseEvent) => {
        e.preventDefault();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setIsAuthOpen(true); return; }
        // ... wishlist logic ...
        setIsWishlisted(!isWishlisted);
        toast.success(isWishlisted ? "Removed" : "Saved!");
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

                    <div className="absolute top-4 left-4 z-10">
                        {averageRating ? (
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm border border-orange-50">
                                <Star size={12} className="text-[#ff3d00] fill-[#ff3d00]" />
                                <span className="text-[11px] font-black text-slate-900">{averageRating}</span>
                            </div>
                        ) : (
                            <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-sm border border-slate-50">
                                <span className="text-[10px] font-black text-[#ff3d00] uppercase tracking-tighter">New</span>
                            </div>
                        )}
                    </div>

                    <button onClick={handleWishlistClick} className={`absolute top-4 right-4 w-11 h-11 backdrop-blur-md rounded-full flex items-center justify-center transition-all z-10 ${isWishlisted ? "bg-[#ff3d00] text-white" : "bg-white/80 text-slate-400"}`}>
                        <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm">
                        <Store size={12} className="text-[#ff3d00]" />
                        <span className="text-[10px] font-black text-slate-800 uppercase truncate">
                            {product.business_profiles?.shop_name || "Local Shop"}
                        </span>
                    </div>
                </div>

                <div className="flex-grow px-2 space-y-3">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-[#ff3d00] transition-colors line-clamp-1">
                        {product.name}
                    </h3>
                    <span className="text-2xl font-black text-slate-900">₹{product.price.toLocaleString()}</span>
                </div>

                <div className="mt-6">
                    <Link href={`/customer/product/${product.id}`} className="w-full bg-[#ff3d00] text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-center transition-all flex items-center justify-center gap-2 shadow-lg hover:bg-slate-900">
                        Explore Item <ArrowRight size={14} />
                    </Link>
                </div>
            </div>
            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
        </>
    );
}

function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-100 px-10">
            <ShoppingBag className="text-slate-200 mx-auto mb-6" size={60} />
            <h3 className="text-3xl font-black text-slate-900 mb-2">Nothing found.</h3>
            <button onClick={onReset} className="mt-4 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ff3d00]">
                Reset Filters
            </button>
        </div>
    );
}