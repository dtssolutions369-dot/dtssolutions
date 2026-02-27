"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
    ShoppingBag,
    Share2,
    MapPin,
    Phone,
    MessageCircle,
    ChevronRight,
    ChevronLeft,
    Loader2,
    Store,
    ArrowLeft,
    Star
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuthModal from "@/components/AuthModal";
import ProductCard from "@/components/ProductCard"; // Imported shared component
import toast from "react-hot-toast";

export default function ProductDetailPage() {
    const router = useRouter();
    const { id } = useParams();
    const [product, setProduct] = useState<any>(null);
    const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentImg, setCurrentImg] = useState(0);

    const [isWishlisted, setIsWishlisted] = useState(false);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Rating State
    const [shopRating, setShopRating] = useState<{ avg: string; count: number } | null>(null);

    useEffect(() => {
        if (id) fetchFullProductData();
    }, [id]);

    const fetchFullProductData = async () => {
        setLoading(true);
        try {
            // UPDATED QUERY: Explicitly selecting existing columns to avoid 'is_verified' errors
            const { data: prodData, error: prodError } = await supabase
                .from("products")
                .select(`
                    *, 
                    business_profiles (
                        id,
                        shop_name,
                        address,
                        phone,
                        business_type,
                        status,
                        business_reviews (rating)
                    )
                `)
                .eq("id", id)
                .single();

            if (prodError) throw prodError;

            if (prodData) {
                setProduct(prodData);
                checkWishlistStatus(prodData.id);

                // Calculate Rating for the main product shop
                const reviews = prodData.business_profiles?.business_reviews || [];
                if (reviews.length > 0) {
                    const avg = (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviews.length).toFixed(1);
                    setShopRating({ avg, count: reviews.length });
                }

                // Fetch Related Products using the structure ProductCard expects
                const { data: related, error: relError } = await supabase
                    .from("products")
                    .select(`
                        *, 
                        business_profiles (
                            id,
                            shop_name,
                            business_type,
                            status,
                            business_reviews (rating)
                        )
                    `)
                    .eq("category_id", prodData.category_id)
                    .neq("id", id)
                    .limit(4);
                
                if (relError) throw relError;
                setRelatedProducts(related || []);
            }
        } catch (err: any) {
            console.error("Error fetching product:", err.message);
            toast.error("Could not load product details");
        } finally {
            setLoading(false);
        }
    };

    const checkWishlistStatus = async (productId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from("wishlist").select("id").eq("user_id", user.id).eq("product_id", productId).single();
        if (data) setIsWishlisted(true);
    };

    const handleWishlistToggle = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return setIsAuthOpen(true);

        setWishlistLoading(true);
        if (isWishlisted) {
            await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
            setIsWishlisted(false);
            toast.success("Removed from wishlist");
        } else {
            await supabase.from("wishlist").insert({ user_id: user.id, product_id: product.id });
            setIsWishlisted(true);
            toast.success("Saved to wishlist!");
        }
        setWishlistLoading(false);
    };

    const nextImage = () => setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    const prevImage = () => setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1));

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-[#fcfcfd]">
            <Loader2 className="animate-spin text-[#ff3d00] mb-4" size={48} />
            <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Syncing Catalog...</p>
        </div>
    );

    if (!product) return <div className="p-20 text-center font-bold">Product not found.</div>;

    const images = product.images || ["/placeholder.png"];
    const discount = product.discount || 0;
    const finalPrice = discount > 0 
        ? Math.round(product.price - (product.price * discount) / 100) 
        : product.price;

    const handleShare = async () => {
        const shareData = {
            title: product?.name,
            text: `Check out this ${product?.name} on our platform!`,
            url: window.location.href,
        };
        try {
            if (navigator.share) await navigator.share(shareData);
            else {
                await navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
            }
        } catch (err) { console.error("Error sharing:", err); }
    };

    return (
        <div className="min-h-screen bg-[#fcfcfd] pb-24">
            <main className="max-w-[1400px] mx-auto px-4 md:px-10 py-6">

                {/* --- NAVIGATION & ACTIONS --- */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm group"
                    >
                        <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm group-hover:text-[#ff3d00] transition-all">
                            <ArrowLeft size={18} />
                        </div>
                        Back to Results
                    </button>

                    <button
                        onClick={handleShare}
                        className="p-3 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400 hover:text-[#ff3d00] transition-all"
                    >
                        <Share2 size={20} />
                    </button>
                </div>

                <div className="grid lg:grid-cols-12 gap-12 mb-20">

                    {/* --- LEFT: DYNAMIC IMAGE GALLERY --- */}
                    <div className="lg:col-span-7">
                        <div className="space-y-6">
                            <div className="relative aspect-[4/3] md:aspect-[16/10] rounded-[3rem] overflow-hidden bg-white shadow-2xl shadow-slate-200 border-4 border-white">
                                {product.discount > 0 && (
                                    <div className="absolute top-8 left-8 z-20">
                                        <div className="bg-[#ff3d00] text-white px-4 py-2 rounded-2xl text-xs font-black shadow-xl">
                                            {product.discount}% OFF
                                        </div>
                                    </div>
                                )}
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={currentImg}
                                        initial={{ opacity: 0, scale: 1.05 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.4 }}
                                        src={images[currentImg]}
                                        className="w-full h-full object-cover"
                                    />
                                </AnimatePresence>

                                <div className="absolute inset-0 flex items-center justify-between px-6 pointer-events-none">
                                    <button onClick={prevImage} className="pointer-events-auto w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-[#ff3d00] hover:text-white transition-all">
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button onClick={nextImage} className="pointer-events-auto w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg hover:bg-[#ff3d00] hover:text-white transition-all">
                                        <ChevronRight size={24} />
                                    </button>
                                </div>

                                <button
                                    onClick={handleWishlistToggle}
                                    className={`absolute top-8 right-8 w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all ${isWishlisted ? "bg-[#ff3d00] text-white" : "bg-white/90 backdrop-blur-md text-slate-400"
                                        }`}
                                >
                                    {wishlistLoading ? <Loader2 className="animate-spin" size={20} /> : <ShoppingBag size={24} fill={isWishlisted ? "currentColor" : "none"} />}
                                </button>
                            </div>

                            <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImg(idx)}
                                        className={`relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${currentImg === idx ? "border-[#ff3d00] scale-105 shadow-lg" : "border-transparent opacity-60"
                                            }`}
                                    >
                                        <img src={img} className="w-full h-full object-cover" alt="thumbnail" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* --- RIGHT: PRODUCT & SELLER INFO --- */}
                    <div className="lg:col-span-5 space-y-8">
                        <header className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-[#ff3d00] rounded-full">
                                    <Store size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{product.business_profiles?.shop_name}</span>
                                </div>
                                {shopRating && (
                                    <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 rounded-full border border-slate-100">
                                        <Star size={12} className="fill-[#ff3d00] text-[#ff3d00]" />
                                        <span className="text-xs font-black text-slate-900">{shopRating.avg}</span>
                                        <span className="text-[10px] font-bold text-slate-400">({shopRating.count} reviews)</span>
                                    </div>
                                )}
                            </div>

                            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">{product.name}</h1>

                            <div className="space-y-2 mt-4">
                                {discount > 0 ? (
                                    <>
                                        <div className="flex items-end gap-4">
                                            <span className="text-5xl font-black text-[#ff3d00]">
                                                ₹{finalPrice.toLocaleString()}
                                            </span>
                                            <span className="text-2xl font-bold text-slate-400 line-through">
                                                ₹{product.price.toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-emerald-600 font-black text-sm">
                                            You save ₹{(product.price - finalPrice).toLocaleString()} ({discount}% OFF)
                                        </p>
                                    </>
                                ) : (
                                    <span className="text-5xl font-black text-slate-900">
                                        ₹{product.price.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </header>

                        <div className="space-y-3">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">About this item</h4>
                            <p className="text-slate-600 leading-relaxed font-medium">
                                {product.description || "Indulge in the perfect blend of quality and craftsmanship. Curated from premium local sources."}
                            </p>
                        </div>
                        
                        {product.business_profiles?.business_type && (
                            <div className="mt-6 flex items-center gap-3">
                                <span className="text-xs font-black uppercase tracking-widest text-slate-400">
                                    Business Type
                                </span>
                                <span className="px-4 py-2 bg-orange-50 text-[#ff3d00] rounded-full text-[11px] font-black uppercase tracking-widest border border-orange-100">
                                    {product.business_profiles.business_type}
                                </span>
                            </div>
                        )}

                        {/* PREMIUM SELLER CARD */}
                        <div className="p-8 bg-slate-900 rounded-[3rem] text-white space-y-6 relative overflow-hidden shadow-2xl shadow-slate-400/20">
                            <div className="relative z-10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <span className="text-[10px] font-black text-[#ff3d00] uppercase tracking-[0.3em]">Sold Exclusively By</span>
                                        <h3 className="text-3xl font-black tracking-tighter mt-2">{product.business_profiles?.shop_name}</h3>
                                    </div>
                                    {shopRating && (
                                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 text-center">
                                            <div className="flex items-center gap-1 mb-1">
                                                <Star size={14} className="fill-[#ff3d00] text-[#ff3d00]" />
                                                <span className="font-black text-lg">{shopRating.avg}</span>
                                            </div>
                                            <p className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">{shopRating.count} reviews</p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-slate-400 text-sm font-medium mt-2 mb-6 flex items-center gap-2">
                                    <MapPin size={14} /> {product.business_profiles?.address || "Location not available"}
                                </p>

                                <div className="grid gap-3">
                                    <Link
                                        href={`/customer/shop/${product.business_profiles?.id}`}
                                        className="w-full py-5 bg-[#ff3d00] hover:bg-[#e63500] text-center rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-900/20"
                                    >
                                        View Business Profile
                                    </Link>
                                    <div className="grid grid-cols-2 gap-3">
                                        <a href={`tel:${product.business_profiles?.phone}`} className="py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">
                                            <Phone size={14} /> Call Now
                                        </a>
                                        <a
                                            href={`https://wa.me/${product.business_profiles?.phone}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="py-4 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-2xl flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest transition-all"
                                        >
                                            <MessageCircle size={14} /> WhatsApp
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#ff3d00] rounded-full blur-[80px] opacity-30"></div>
                        </div>
                    </div>
                </div>

                {/* --- RELATED PRODUCTS SECTION --- */}
                <section className="space-y-8 pt-10 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Recommended for you</h2>
                    </div>
                    {/* Using ProductCard within the global grid layout */}
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
                        {relatedProducts.map((rel) => (
                            <ProductCard key={rel.id} product={rel} />
                        ))}
                    </div>
                </section>
            </main>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
            />
        </div>
    );
}