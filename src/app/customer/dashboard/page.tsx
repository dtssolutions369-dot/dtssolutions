"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import LocationModal from "@/components/LocationModal";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";

// Lucide Icons
import {
    MapPin, ArrowRight, ShoppingBag,
    Loader2, Zap, ShieldCheck,
    Star, Truck
} from "lucide-react";

// Embla Carousel
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import AutoScroll from 'embla-carousel-auto-scroll';

export default function CustomerDashboard() {
    const [location, setLocation] = useState<any>(null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [banners, setBanners] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);

    // 1. Hero Carousel Hook
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 5000, stopOnInteraction: false })
    ]);

    // 2. Continuous Scroll Hook for Products
    const [latestProductsRef] = useEmblaCarousel(
        { loop: true, dragFree: true, align: "start" },
        [AutoScroll({ speed: 1, stopOnInteraction: false, stopOnMouseEnter: true })]
    );

    const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
    const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

    // Handle Hero Dots
    useEffect(() => {
        if (!emblaApi) return;
        const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
        emblaApi.on("select", onSelect);
        onSelect();
        return () => { emblaApi.off("select", onSelect); };
    }, [emblaApi]);

    // Initial Data Fetch
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

    const fetchDashboardData = async (userPincode?: string) => {
        setLoading(true);
        try {
            const { data: bannerData } = await supabase
                .from("banners")
                .select("*")
                .eq("is_active", true)
                .order("created_at", { ascending: false });

            const { data: catData } = await supabase
                .from("categories")
                .select("*")
                .is("parent_id", null);

            let query = supabase
                .from("products")
                .select(`*, business_profiles!inner (id, shop_name, pincode, address)`)
                .eq("status", "active");

            if (userPincode && userPincode !== "000000") {
                query = query.eq("business_profiles.pincode", userPincode);
            }

            const { data: prodData } = await query.order("created_at", { ascending: false });

            setBanners(bannerData || []);
            setCategories(catData || []);
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

    if (loading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
                <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
                <p className="text-slate-400 font-bold animate-pulse">Finding local treasures...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#fcfcfc] pb-20">
            <LocationModal isOpen={isLocationModalOpen} onSelect={handleLocationSelect} />

            <main className="max-w-[1600px] mx-auto px-6 pt-8 space-y-20">

                {/* --- HERO SLIDER --- */}
                <section className="relative group">
                    <div className="overflow-hidden rounded-[2.5rem] md:rounded-[3.5rem] shadow-xl bg-slate-900" ref={emblaRef}>
                        <div className="flex">
                            {banners.map((banner) => (
                                <div key={banner.id} className="relative flex-[0_0_100%] h-[500px] md:h-[600px] min-w-0">
                                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/90 via-black/40 to-transparent z-10 flex flex-col justify-end md:justify-center px-8 md:px-20 pb-16 md:pb-0 space-y-6">
                                        <h1 className="text-4xl md:text-8xl font-black text-white max-w-4xl leading-[0.9] tracking-tighter">
                                            {banner.title}
                                        </h1>
                                        <p className="text-white/70 text-lg md:text-2xl font-medium max-w-xl leading-relaxed">
                                            {banner.description}
                                        </p>
                                    </div>
                                    <img
                                        src={banner.image_url}
                                        className="absolute inset-0 w-full h-full object-cover opacity-70"
                                        alt=""
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 z-20 flex justify-between pointer-events-none">
                        <button onClick={scrollPrev} className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-[#ff3d00] transition-all pointer-events-auto hidden md:block">
                            <ArrowRight size={24} className="rotate-180" />
                        </button>
                        <button onClick={scrollNext} className="p-4 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-[#ff3d00] transition-all pointer-events-auto hidden md:block">
                            <ArrowRight size={24} />
                        </button>
                    </div>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                        {banners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => emblaApi?.scrollTo(i)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${selectedIndex === i ? "w-12 bg-[#ff3d00]" : "w-3 bg-white/30"}`}
                            />
                        ))}
                    </div>
                </section>

                {/* --- CATEGORIES GRID --- */}
                <section className="space-y-10">
                    <div className="flex items-end justify-between">
                        <div className="space-y-2">
                            <span className="text-[#ff3d00] font-black text-sm uppercase tracking-[0.3em]">Collections</span>
                            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">
                                Shop by <span className="text-slate-300 italic">Category</span>
                            </h2>
                        </div>
                        <Link href="/customer/categories" className="hidden md:flex items-center gap-3 font-bold text-slate-900 hover:text-[#ff3d00] transition-colors">
                            View All Categories <ArrowRight size={20} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {categories.slice(0, 8).map((cat, idx) => (
                            <Link
                                href={`/customer/category/${cat.id}`}
                                key={cat.id}
                                className={`group relative h-64 md:h-80 rounded-[2.5rem] overflow-hidden bg-slate-100 ${idx === 0 || idx === 3 ? 'md:col-span-2' : ''}`}
                            >
                                <img src={cat.image_url} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent" />
                                <div className="absolute bottom-8 left-8">
                                    <h3 className="text-2xl font-black text-white">{cat.name}</h3>
                                    <span className="text-white/60 text-sm font-bold flex items-center gap-2 group-hover:text-[#ff3d00] transition-colors">
                                        Browse Store <ArrowRight size={14} />
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* --- LATEST PRODUCTS (Continuous Scroll) --- */}
                <section className="space-y-10">
                    <div className="bg-orange-50 p-10 rounded-[3.5rem] flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                                Latest in <span className="text-[#ff3d00] underline decoration-4 underline-offset-8">{location?.city || "Local Area"}</span>
                            </h2>
                            <p className="text-orange-900/50 font-bold mt-2">Recently added products from your neighborhood</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-3xl shadow-sm">
                            <MapPin className="text-[#ff3d00]" />
                            <span className="font-black text-slate-900">{location?.pincode}</span>
                        </div>
                    </div>

                    {/* FIX: Added 'py-10' and '-my-10' to allow the cards to scale without clipping */}
                    <div className="overflow-hidden cursor-grab active:cursor-grabbing py-12 -my-12" ref={latestProductsRef}>
                        <div className="flex gap-6">
                            {[...products, ...products].map((prod, idx) => (
                                /* FIX: Added 'relative z-10 hover:z-20' so the active card stays on top */
                                <div
                                    key={`${prod.id}-${idx}`}
                                    className="flex-[0_0_300px] md:flex-[0_0_350px] relative z-10 hover:z-20 transition-all"
                                >
                                    <ProductCard product={prod} />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- BENTO ADVANTAGE SECTION --- */}
                <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-12 mb-6">
                        <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
                            The DTS <span className="text-[#ff3d00]">Advantage</span>
                        </h2>
                    </div>

                    <div className="md:col-span-7 bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden group">
                        <ShoppingBag className="text-[#ff3d00] mb-8" size={48} />
                        <h3 className="text-3xl font-bold mb-4">Support Local Business</h3>
                        <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                            Every purchase stays within your community, helping local creators and shops grow.
                        </p>
                        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff3d00]/10 rounded-full blur-3xl group-hover:bg-[#ff3d00]/20 transition-all" />
                    </div>

                    <div className="md:col-span-5 bg-orange-100 rounded-[3rem] p-12 group hover:bg-[#ff3d00] transition-colors duration-500">
                        <Zap className="text-[#ff3d00] group-hover:text-white mb-8" size={48} />
                        <h3 className="text-3xl font-bold mb-4 group-hover:text-white">Instant Service</h3>
                        <p className="text-orange-900/60 group-hover:text-white/80 text-lg leading-relaxed">
                            Since products are already in your city, delivery is faster than any national platform.
                        </p>
                    </div>

                    <div className="md:col-span-12 bg-white border-2 border-slate-100 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                                <ShieldCheck size={40} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold">Quality Assured</h3>
                                <p className="text-slate-500 font-medium text-lg">Identity-verified sellers and hand-picked goods.</p>
                            </div>
                        </div>
                        <p className="max-w-xl text-slate-600 text-lg leading-relaxed text-center md:text-left">
                            We bridge the gap between craftsmanship and convenience. Our platform ensures that you receive only premium, verified products.
                        </p>
                    </div>
                </section>

                {/* --- TRUST FOOTER --- */}
                <section className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20 border-t border-slate-100">
                    <TrustItem icon={<Star />} title="Curated Selection" desc="Only the best boutiques." />
                    <TrustItem icon={<Truck />} title="Express Delivery" desc="Local items, local speed." color="text-blue-600" bg="bg-blue-50" />
                    <TrustItem icon={<ShieldCheck />} title="Secure Trade" desc="Protected transactions." color="text-emerald-600" bg="bg-emerald-50" />
                </section>
            </main>
        </div>
    );
}

function TrustItem({ icon, title, desc, color = "text-[#ff3d00]", bg = "bg-orange-50" }: any) {
    return (
        <div className="flex items-center gap-5 p-8 rounded-[2.5rem] bg-white border border-slate-50 shadow-sm">
            <div className={`w-14 h-14 ${bg} ${color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                {React.cloneElement(icon as React.ReactElement, { size: 28 })}
            </div>
            <div>
                <h4 className="font-black text-slate-900 text-lg">{title}</h4>
                <p className="text-slate-500 text-sm font-medium">{desc}</p>
            </div>
        </div>
    );
}