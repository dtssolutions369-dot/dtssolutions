"use client";
import AutoScroll from 'embla-carousel-auto-scroll';
import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import LocationModal from "@/components/LocationModal";
import {
    MapPin, Heart, ArrowRight, ShoppingBag,
    Loader2, Zap, ShieldCheck,
    ChevronRight, Truck, Star, ChevronLeft
} from "lucide-react";
import Link from "next/link";
// 1. Import Carousel Logic
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

export default function CustomerDashboard() {
    const [location, setLocation] = useState<any>(null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [banners, setBanners] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    // ... existing state declarations ...
    const [selectedIndex, setSelectedIndex] = useState(0);
    // 2. Initialize the missing ref here
    const productRowRef = useRef<HTMLDivElement>(null);

    // ... existing carousel logic ...
    // 1. INITIALIZE CAROUSEL FIRST
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    // 2. DEFINE CALLBACKS AFTER API IS INITIALIZED
    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // 3. DEFINE EFFECTS AFTER API IS INITIALIZED
    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
        emblaApi.on("select", onSelect);
        onSelect(); // Set initial

        // Clean up listener on unmount
        return () => {
            emblaApi.off("select", onSelect);
        };
    }, [emblaApi]);


    useEffect(() => {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
            const loc = JSON.parse(savedLocation);
            setLocation(loc);
            fetchDashboardData(loc.pincode);
        } else {
            setIsLocationModalOpen(true);
            fetchDashboardData();
        }
    }, []);
    // Near your other hooks at the top
    const [latestProductsRef] = useEmblaCarousel(
        { loop: true, dragFree: true },
        [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]
    );
    const fetchDashboardData = async (userPincode?: string) => {
        setLoading(true);
        try {
            // 3. Fetch Banners sorted by created_at (Descending - Newest first)
            const { data: bannerData } = await supabase
                .from("banners")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            const { data: catData } = await supabase.from("categories").select("*").is("parent_id", null);

            setBanners(bannerData || []);
            setCategories(catData || []);

            let query = supabase
                .from("products")
                .select(`*, business_profiles!inner (id, shop_name, pincode, address)`)
                .eq("status", "active");

            if (userPincode && userPincode !== "" && userPincode !== "000000") {
                query = query.eq("business_profiles.pincode", userPincode);
            }

            const { data: prodData } = await query.order("created_at", { ascending: false });
            setProducts(prodData || []);
        } catch (err) {
            console.error("Dashboard Error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleLocationSelect = (loc: any) => {
        setLocation(loc);
        localStorage.setItem("user_location", JSON.stringify(loc));
        setIsLocationModalOpen(false);
        fetchDashboardData(loc.pincode);
    };

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20">

            <LocationModal
                isOpen={isLocationModalOpen}
                onSelect={handleLocationSelect}
            />

            {loading ? (
                <div className="h-[80vh] flex flex-col items-center justify-center gap-4">
                    <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
                    <p className="text-slate-400 font-bold animate-pulse">Finding local treasures...</p>
                </div>
            ) : (
                <main className="max-w-[1600px] mx-auto px-6 pt-8 space-y-20">

                    {/* 4. UPDATED HERO SLIDER */}
                    <section className="relative group">
                        {/* Increased height to h-[650px] */}
                        <div className="overflow-hidden rounded-[3.5rem] shadow-2xl shadow-orange-100 bg-slate-900" ref={emblaRef}>
                            <div className="flex">
                                {banners.map((banner) => (
                                    <div key={banner.id} className="relative flex-[0_0_100%] h-[650px] min-w-0">
                                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 flex flex-col justify-center px-16 space-y-6">
                                            <div className="space-y-4">

                                                <h1 className="text-6xl md:text-8xl font-black text-white max-w-3xl leading-[1] tracking-tighter">
                                                    {banner.title}
                                                </h1>
                                            </div>
                                            <p className="text-white/80 text-xl font-medium max-w-lg leading-relaxed">
                                                {banner.description}
                                            </p>

                                        </div>
                                        <img
                                            src={banner.image_url}
                                            className="absolute inset-0 w-full h-full object-cover opacity-70"
                                            alt={banner.title}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* NAVIGATION DOTS - Positioned Bottom Right */}
                        <div className="absolute bottom-10 right-16 z-30 flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl">
                            {banners.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => emblaApi?.scrollTo(index)}
                                    className={`transition-all duration-500 rounded-full ${selectedIndex === index
                                        ? "w-10 h-3 bg-[#ff3d00]"
                                        : "w-3 h-3 bg-white/50 hover:bg-white"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Navigation Arrows */}
                        {/* TOP RIGHT NAVIGATION CONTROLS */}
                        <div className="absolute top-8 right-8 z-30 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <button
                                onClick={scrollPrev}
                                className="p-4 bg-black/20 backdrop-blur-xl text-white rounded-2xl hover:bg-[#ff3d00] transition-all shadow-2xl border border-white/10 active:scale-90"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={scrollNext}
                                className="p-4 bg-black/20 backdrop-blur-xl text-white rounded-2xl hover:bg-[#ff3d00] transition-all shadow-2xl border border-white/10 active:scale-90"
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    </section>

                    {/* 2. WHY SHOP WITH DTS */}
                    {/* 2. WHY SHOP WITH DTS */}
                    <section className="space-y-12">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <span className="text-[#ff3d00] font-black uppercase tracking-[0.3em] text-xs">
                                The DTS Advantage
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">
                                Why shop with us?
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <ValueCard
                                icon={<ShoppingBag className="text-[#ff3d00]" />}
                                title="Support Local"
                                desc="Every purchase helps a local entrepreneur thrive and keeps your community's economy growing."
                            />
                            <ValueCard
                                icon={<Zap className="text-amber-500" />}
                                title="Instant Service"
                                desc="Skip the long waits. Get lightning-fast delivery because your products are already in your city."
                            />
                            <ValueCard
                                icon={<ShieldCheck className="text-emerald-500" />}
                                title="Quality Assured"
                                desc="We hand-verify every local seller to ensure you only get 100% authentic and premium products."
                            />
                        </div>
                    </section>

                    {/* 3. CATEGORIES */}
                    <section className="space-y-8">
                        <div className="flex items-center justify-between">
                            <div className="relative">
                                <span className="text-[#ff3d00] font-black text-sm uppercase tracking-widest mb-2 block">
                                    Collections
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                                    Shop by <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3d00] to-orange-400">Category</span>
                                </h2>
                            </div>

                            <Link href="/customer/categories" className="group flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-[#ff3d00] transition-all duration-300">
                                <span className="font-bold text-sm">View All</span>
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        {/* Dynamic Grid Layout */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {categories.slice(0, 8).map((cat, index) => (
                                <div
                                    key={cat.id}
                                    className={`group relative overflow-hidden rounded-[2rem] bg-slate-100 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-1
                    ${index === 0 ? "md:col-span-2 md:row-span-1" : ""} 
                    ${index === 3 ? "md:row-span-2" : ""}`}
                                >
                                    {/* Image Container */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={cat.image_url || "/placeholder.png"}
                                            alt={cat.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {/* Dynamic Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative h-48 md:h-64 p-6 flex flex-col justify-end">
                                        <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                            <p className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                                Explore
                                            </p>
                                            <h3 className="text-xl md:text-2xl font-black text-white leading-none">
                                                {cat.name}
                                            </h3>
                                        </div>

                                        {/* Hidden Button that slides up */}
                                        <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                            <span className="inline-flex items-center gap-2 text-[#ff3d00] bg-white px-4 py-2 rounded-xl text-xs font-black uppercase">
                                                Shop Now <ArrowRight size={14} />
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>


                    {/* 4. LATEST PRODUCTS - SLOW CONTINUOUS SCROLL */}
                    <section className="space-y-8 overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-orange-50 p-8 rounded-[3rem] gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="bg-[#ff3d00] w-2 h-8 rounded-full" />
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">
                                        Latest in <span className="text-[#ff3d00]">{location?.city || "Your Area"}</span>
                                    </h2>
                                </div>
                                <p className="text-orange-900/50 font-bold ml-4">New arrivals from verified local sellers</p>
                            </div>

                            <div className="flex items-center gap-4 bg-white/50 p-2 rounded-2xl border border-orange-100">
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-orange-900/30 uppercase tracking-[0.2em]">Pincode</p>
                                    <span className="font-black text-orange-600">{location?.pincode || "000000"}</span>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                    <MapPin size={18} className="text-[#ff3d00]" />
                                </div>
                            </div>
                        </div>

                        {products.length > 0 ? (
                            <div
                                className="overflow-hidden cursor-grab active:cursor-grabbing px-4"
                                ref={latestProductsRef} // Use the ref initialized above
                            >
                                <div className="flex gap-6 py-4">
                                    {[...products, ...products].map((prod, idx) => (
                                        <div key={`${prod.id}-${idx}`} className="flex-[0_0_auto]">
                                            <ProductCard product={prod} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100">
                                {/* ... No Shops Found View ... */}
                            </div>
                        )}
                    </section>

                    {/* 5. TRUST GRID */}
                    {/* 5. TRUST SECTION - Compact & Refined */}
                    <section className="py-10 border-t border-slate-100">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                            <div className="space-y-1">
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Shopping made <span className="text-[#ff3d00]">simpler.</span>
                                </h2>
                                <p className="text-slate-500 font-medium text-sm">Experience the best of your city with total peace of mind.</p>
                            </div>
                            <div className="h-px flex-1 bg-gradient-to-r from-slate-100 to-transparent hidden md:block mx-8" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Feature 1 */}
                            <div className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-slate-50 shadow-sm hover:border-orange-100 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center">
                                    <Star className="text-[#ff3d00]" size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Curated Local Selection</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed mt-1">Handpicked products from the top-rated boutiques in your area.</p>
                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-slate-50 shadow-sm hover:border-blue-100 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                                    <Truck className="text-blue-600" size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Express City Delivery</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed mt-1">No cross-country shipping. Your order stays local and arrives faster.</p>
                                </div>
                            </div>

                            {/* Feature 3 */}
                            <div className="flex items-start gap-4 p-6 rounded-3xl bg-white border border-slate-50 shadow-sm hover:border-emerald-100 transition-colors">
                                <div className="flex-shrink-0 w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center">
                                    <ShieldCheck className="text-emerald-600" size={22} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Verified Secure Trade</h4>
                                    <p className="text-slate-500 text-xs leading-relaxed mt-1">Every transaction is protected and every seller is identity-verified.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            )}
        </div>
    );
}

// Sub-components stay the same...
function ValueCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="group relative bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(255,61,0,0.1)] transition-all duration-500 hover:-translate-y-2 overflow-hidden border border-slate-50">
            {/* Decorative Background Element */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-50 rounded-full group-hover:bg-orange-50 transition-colors duration-500" />

            <div className="relative space-y-6">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:bg-white group-hover:shadow-xl transition-all duration-500">
                    {React.cloneElement(icon as React.ReactElement, { size: 32 })}
                </div>

                <div className="space-y-3">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-[#ff3d00] transition-colors">
                        {title}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {desc}
                    </p>
                </div>

                {/* Bottom Accent Line */}
                <div className="w-12 h-1.5 bg-slate-100 rounded-full group-hover:w-24 group-hover:bg-[#ff3d00] transition-all duration-500" />
            </div>
        </div>
    );
}

function ProductCard({ product }: { product: any }) {
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Internal slider for product images (2 seconds delay)
    const [emblaRef] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 2000, stopOnInteraction: false })
    ]);

    return (
        <div className="group bg-white rounded-[2.5rem] p-4 shadow-xl shadow-slate-200/50 hover:shadow-[#ff3d00]/10 transition-all duration-500 border border-slate-50 relative flex-shrink-0 w-[280px] md:w-[320px]">
            <button
                onClick={() => setIsWishlisted(!isWishlisted)}
                className="absolute top-6 right-6 z-30 p-2.5 bg-white/90 backdrop-blur-md rounded-full shadow-lg hover:bg-[#ff3d00] hover:text-white transition-all active:scale-90"
            >
                <Heart size={18} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-white" : "text-slate-400"} />
            </button>

            <div className="absolute top-6 left-6 z-20 bg-black/90 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase">
                ₹{product.price}
            </div>

            {/* Image Slider Container */}
            <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-5 relative bg-slate-50 shadow-inner" ref={emblaRef}>
                <div className="flex h-full">
                    {product.images?.map((img: string, idx: number) => (
                        <div key={idx} className="relative flex-[0_0_100%] min-w-0 h-full">
                            <img
                                src={img}
                                alt={`${product.name} ${idx}`}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    ))}
                    {/* Fallback if no images */}
                    {(!product.images || product.images.length === 0) && (
                        <div className="flex-[0_0_100%] flex items-center justify-center bg-slate-100 h-full">
                            <ShoppingBag className="text-slate-300" size={40} />
                        </div>
                    )}
                </div>
            </div>

            <div className="px-2 space-y-1">
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[10px] font-black text-[#ff3d00] uppercase tracking-widest">{product.business_profiles?.shop_name}</p>
                </div>
                <h3 className="font-black text-slate-800 text-lg truncate group-hover:text-[#ff3d00] transition-colors">{product.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-400 pt-1">
                    <MapPin size={12} className="text-slate-300" />
                    <span className="text-[10px] font-bold truncate uppercase tracking-tighter">{product.business_profiles?.address}</span>
                </div>
            </div>
        </div>
    );
}