"use client";

import { useEffect, useState } from "react";
import {
    Layers, MessageSquare,
    CheckCircle2
} from "lucide-react";
import { Search, ListPlus, Send, Award, Play, PlusCircle, LayoutGrid, Rocket, Sparkles, ArrowRight, Users, MapPin, Briefcase } from "lucide-react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

type Category = {
    id: string;
    name: string;
    image_url: string;
    description?: string;
};

type BrandingVideo = {
    id: string;
    video_url: string;
    created_at: string;
};

type ImageBanner = {
    id: string;
    image_url: string;
    title?: string;
    created_at: string;
};

export default function Home() {
    const [find, setFind] = useState("");
    const [near, setNear] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [businessType, setBusinessType] = useState("");
    const [brandingVideos, setBrandingVideos] = useState<BrandingVideo[]>([]);
    const [imageBanners, setImageBanners] = useState<ImageBanner[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [businessTypes, setBusinessTypes] = useState<string[]>([]);
    const router = useRouter();
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const bannerScrollRef = useRef<HTMLDivElement | null>(null);
    const [isBannersPaused, setIsBannersPaused] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [locationAvailability, setLocationAvailability] = useState<{ locations: string[] }>({ locations: [] });
    const brandingScrollRef = useRef<HTMLDivElement | null>(null);
    const [isBrandingPaused, setIsBrandingPaused] = useState(false);
    const [searchFilters, setSearchFilters] = useState<{ products: string[] }>({ products: [] });

    const steps = [
        {
            icon: Search,
            step: "01",
            title: "Discover Experts",
            desc: "Browse a curated network of elite local professionals tailored to your specific needs.",
            color: "from-[#74cb01] to-[#5ba301]"
        },
        {
            icon: MapPin,
            step: "02",
            title: "Geofenced Search",
            desc: "Pinpoint verified service providers operating directly within your immediate vicinity.",
            color: "from-slate-800 to-slate-950"
        },
        {
            icon: Layers,
            step: "03",
            title: "Smart Comparison",
            desc: "Evaluate transparent pricing, performance metrics, and authentic community feedback.",
            color: "from-[#74cb01] to-[#5ba301]"
        },
        {
            icon: MessageSquare,
            step: "04",
            title: "Direct Connection",
            desc: "Engage instantly with providers to finalize logistics through our secure channel.",
            color: "from-slate-800 to-slate-950"
        },
        {
            icon: CheckCircle2,
            step: "05",
            title: "Quality Delivery",
            desc: "Experience seamless service execution followed by a simple, one-tap feedback loop.",
            color: "from-[#74cb01] to-[#5ba301]"
        },
    ];

    useEffect(() => {
        if (!find || find.length < 2) {
            setSearchFilters({ products: [] });
            setShowResults(false);
            return;
        }

        const fetchSearchFilters = async () => {
            const { data, error } = await supabase
                .from("vendor_products")
                .select("product_name")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true)
                .limit(10);

            if (error) {
                console.error("Filter Fetch Error:", error);
                setSearchFilters({ products: [] });
                return;
            }

            const products = Array.from(
                new Set(
                    data.map(item => item.product_name?.toLowerCase().trim()).filter(Boolean)
                )
            );

            setSearchFilters({ products });
            setShowResults(true);
        };

        fetchSearchFilters();
    }, [find]);

    useEffect(() => {
        if (!find || find.length < 2 || !near || near.length < 2) {
            setLocationAvailability({ locations: [] });
            return;
        }

        const checkLocationAvailability = async () => {
            const { data: products, error: productError } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true);

            if (productError || !products?.length) {
                setLocationAvailability({ locations: [] });
                return;
            }

            const vendorIds = [...new Set(products.map(p => p.vendor_id))];

            const { data: vendors, error: vendorError } = await supabase
                .from("vendor_register")
                .select("area, city, pincode")
                .in("id", vendorIds)
                .or(`area.ilike.%${near}%,city.ilike.%${near}%,pincode.ilike.%${near}%`);

            if (vendorError) {
                console.error("Location Check Error:", vendorError);
                setLocationAvailability({ locations: [] });
                return;
            }

            const locations = Array.from(
                new Set(
                    vendors.flatMap(v => [v.area?.toLowerCase().trim(), v.city?.toLowerCase().trim(), v.pincode?.toLowerCase().trim()].filter(Boolean))
                )
            );

            setLocationAvailability({ locations });
        };

        checkLocationAvailability();
    }, [find, near]);

    useEffect(() => {
        if (!find || find.length < 2) {
            setCities([]);
            setBusinessTypes([]);
            return;
        }

        const loadFiltersByProduct = async () => {
            const { data: products, error: productError } = await supabase
                .from("vendor_products")
                .select("vendor_id")
                .ilike("product_name", `%${find}%`)
                .eq("is_active", true);

            if (productError || !products?.length) {
                setCities([]);
                setBusinessTypes([]);
                return;
            }

            const vendorIds = [...new Set(products.map(p => p.vendor_id))];

            const { data: vendors, error: vendorError } = await supabase
                .from("vendor_register")
                .select("city, user_type, state, pincode")
                .in("id", vendorIds);

            if (vendorError || !vendors) return;

            const uniqueCities = Array.from(
                new Set(
                    vendors
                        .map(v => v.city?.toLowerCase().trim())
                        .filter(Boolean)
                )
            );

            const uniqueBusinessTypes = Array.from(
                new Set(
                    vendors.flatMap(v =>
                        Array.isArray(v.user_type)
                            ? v.user_type
                            : [v.user_type]
                    ).map(t => t?.toLowerCase().trim())
                )
            );

            setCities(uniqueCities);
            setBusinessTypes(uniqueBusinessTypes);
        };

        loadFiltersByProduct();
    }, [find]);

    useEffect(() => {
        const loadCategories = async () => {
            const { data, error } = await supabase
                .from("categories")
                .select("*")
                .not("image_url", "is", null)
                .order("name");

            if (!error && data) {
                const validCategories = data.filter(cat => cat.image_url && cat.image_url.trim() !== "");
                setCategories(validCategories);
            }
            setLoading(false);
        };
        loadCategories();
    }, []);

    useEffect(() => {
        const loadHomeMedia = async () => {
            const { data: videos } = await supabase
                .from("digital_branding_videos")
                .select("*")
                .order("created_at", { ascending: false });

            const { data: banners } = await supabase
                .from("digital_banners")
                .select("*")
                .order("created_at", { ascending: false });

            setBrandingVideos(videos || []);
            setImageBanners(banners || []);
        };

        loadHomeMedia();
    }, []);

    useEffect(() => {
        if ((!find || find.length < 2) && (!near || near.length < 2)) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const fetchSearchResults = async () => {
            let vendorIds: string[] = [];

            if (near && near.length >= 2) {
                const { data: vendors, error: vendorError } = await supabase
                    .from("vendor_register")
                    .select("id")
                    .or(`area.ilike.%${near}%,city.ilike.%${near}%,pincode.ilike.%${near}%`);

                if (!vendorError && vendors) {
                    vendorIds = vendors.map(v => v.id);
                }
            }

            let query = supabase
                .from("vendor_products")
                .select(`
                  id, 
                  product_name, 
                  price,
                  vendor_id (
                    area,
                    user_type,
                    city,
                    pincode
                  )
                `)
                .eq("is_active", true)
                .limit(5);

            if (find && find.length >= 2) {
                query = query.ilike("product_name", `%${find}%`);
            }

            if (vendorIds.length > 0) {
                query = query.in("vendor_id", vendorIds);
            }

            const { data, error } = await query;

            if (!error) {
                setSearchResults(data || []);
                setShowResults(true);
            } else {
                console.error("Search Error:", error);
            }
        };

        fetchSearchResults();
    }, [find, near]);

    const handleSearch = () => {
        if (!find.trim() && !near.trim()) {
            alert("Please enter what you need or a location.");
            return;
        }

        setShowResults(false);
        setLocationAvailability({ locations: [] });

        const params = new URLSearchParams();
        if (find) params.append("q", find);
        if (near) params.append("city", near);
        if (businessType) params.append("type", businessType);

        router.push(`/user/listing?${params.toString()}`);
    };

    const scrollRef = useRef<HTMLDivElement | null>(null);

    const scroll = (direction: "left" | "right") => {
        if (!scrollRef.current) return;

        const container = scrollRef.current;
        const card = container.querySelector(".category-card") as HTMLElement;

        if (!card) return;

        const gap = 32;
        const scrollAmount = card.offsetWidth + gap;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const scrollBranding = (direction: "left" | "right") => {
        if (!brandingScrollRef.current) return;

        const container = brandingScrollRef.current;
        const firstCard = container.querySelector("a") as HTMLElement;
        const gap = 20;

        const scrollAmount = firstCard
            ? firstCard.offsetWidth + gap
            : 360;

        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    const AUTO_SCROLL_DELAY = 2000;

    useEffect(() => {
        const slider = brandingScrollRef.current;
        if (!slider || isBrandingPaused) return;

        const autoScrollBranding = setInterval(() => {
            const firstCard = slider.querySelector("a") as HTMLElement;
            const cardWidth = firstCard ? firstCard.offsetWidth + 20 : 360;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, AUTO_SCROLL_DELAY);

        return () => clearInterval(autoScrollBranding);
    }, [isBrandingPaused, brandingVideos]);

    useEffect(() => {
        const slider = bannerScrollRef.current;
        if (!slider || isBannersPaused) return;

        const autoScrollBanners = setInterval(() => {
            const firstCard = slider.querySelector('div');
            const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 450;
            const maxScroll = slider.scrollWidth - slider.clientWidth;

            if (slider.scrollLeft >= maxScroll - 10) {
                slider.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                slider.scrollBy({ left: cardWidth, behavior: "smooth" });
            }
        }, 1500);

        return () => clearInterval(autoScrollBanners);
    }, [isBannersPaused, imageBanners]);

    const scrollBanners = (direction: "left" | "right") => {
        if (!bannerScrollRef.current) return;
        const container = bannerScrollRef.current;
        const scrollAmount = 500;
        container.scrollBy({
            left: direction === "left" ? -scrollAmount : scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-24 font-sans selection:bg-[#74cb01]/30">
            
            {/* --- PREMIUM CENTERED HEADER --- */}
            <header className="relative pt-24 pb-44 overflow-hidden">
                {/* Ambient background effect */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                    <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-[#00AEEF]/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[0%] left-[5%] w-[400px] h-[400px] bg-[#74cb01]/10 rounded-full blur-[100px]" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center text-center"
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AEEF] opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AEEF]"></span>
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">India's Premium Service Network</span>
                        </div>
                        
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
                            Find Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Experts.</span>
                        </h1>
                        <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                            Connect with verified professionals for high-end repairs, logistics, and essential services in your immediate vicinity.
                        </p>
                    </motion.div>
                </div>
            </header>

            {/* --- DARK COMMAND CENTER FILTER BAR --- */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-950 rounded-[3rem] p-3 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] border border-white/10"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        
                        {/* Service Input */}
                        <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 focus-within:border-[#00AEEF]/40 transition-all">
                            <Search size={20} className="text-[#00AEEF]" />
                            <div className="flex flex-col flex-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Service</label>
                                <input 
                                    value={find}
                                    onChange={(e) => setFind(e.target.value)}
                                    placeholder="Electrician..."
                                    className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-slate-600 w-full mt-0.5"
                                />
                            </div>
                        </div>

                        {/* Location Input */}
                        <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 focus-within:border-[#F26522]/40 transition-all">
                            <MapPin size={20} className="text-[#F26522]" />
                            <div className="flex flex-col flex-1">
                                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Location</label>
                                <input 
                                    value={near}
                                    onChange={(e) => setNear(e.target.value)}
                                    placeholder="Mumbai, PIN 400001..."
                                    className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-slate-600 w-full mt-0.5"
                                />
                            </div>
                        </div>

                        {/* Execute Button */}
                        <button 
                            onClick={handleSearch}
                            className="bg-[#00AEEF] hover:bg-white text-slate-950 font-black uppercase tracking-[0.25em] text-[10px] rounded-[2rem] transition-all active:scale-95 shadow-xl shadow-[#00AEEF]/20 flex items-center justify-center gap-3 h-full min-h-[64px]"
                        >
                            <Sparkles size={16} fill="currentColor" /> Execute Search
                        </button>
                    </div>
                               </motion.div>
            </div>

            {/* --- MAIN CONTENT --- */}
            <main className="max-w-[1400px] mx-auto px-6 py-24">
                <div className="space-y-24">

                    {/* --- HOW IT WORKS SECTION --- */}
                    <section className="bg-white rounded-[3rem] p-12 md:p-20 shadow-sm border border-slate-100 overflow-hidden">
                        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-[#74cb01]/5 rounded-full blur-3xl" />

                        <div className="relative text-center mb-20">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute h-full w-full rounded-full bg-[#74cb01] opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#74cb01]"></span>
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">The Dtssolutions Method</span>
                            </div>

                            <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter uppercase leading-tight">
                                How It <span className="text-[#74cb01]">Actually</span> Works.
                            </h2>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-12 lg:gap-8">
                            <div className="hidden lg:block absolute top-12 left-0 w-full h-[1px] bg-slate-100" />

                            {steps.map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    className="relative group"
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 lg:left-0 lg:translate-x-0 z-10">
                                        <span className="bg-white px-3 py-1 rounded-full border border-slate-100 text-[9px] font-black text-slate-400 shadow-sm group-hover:text-[#74cb01] transition-colors">
                                            PHASE {item.step}
                                        </span>
                                    </div>

                                    <div className={`relative w-20 h-20 mx-auto lg:mx-0 mb-8 rounded-[2.2rem] bg-gradient-to-br ${item.color} p-[1px] shadow-lg group-hover:scale-110 transition-all duration-500`}>
                                        <div className="w-full h-full bg-white rounded-[2.2rem] flex items-center justify-center">
                                            <item.icon className="w-7 h-7 text-slate-900 group-hover:text-[#74cb01] transition-colors" strokeWidth={1.5} />
                                        </div>
                                    </div>

                                    <div className="text-center lg:text-left px-2">
                                        <h3 className="text-[15px] font-black text-slate-900 mb-3 tracking-tight group-hover:text-[#74cb01] uppercase">{item.title}</h3>
                                        <p className="text-slate-500 text-[11px] font-semibold opacity-80 leading-relaxed">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* --- POPULAR CATEGORIES --- */}
                    <section className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100 overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
                            <div className="max-w-xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-4">
                                    <LayoutGrid size={12} className="text-[#74cb01]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Service Directory</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase tracking-tighter leading-none">
                                    Popular <span className="text-[#74cb01]">Categories</span>
                                </h2>
                                <p className="mt-4 text-slate-500 text-sm font-medium">
                                    Precision-filtered services to help you find exactly what your business requires.
                                </p>
                            </div>

                            <Link href="/user/ViewAllCategories" className="group flex items-center gap-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-[#74cb01] transition-colors">
                                View All <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>

                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-6">
                            {loading ? (
                                // Skeleton Loader
                                [...Array(20)].map((_, i) => (
                                    <div key={i} className="flex flex-col items-center animate-pulse">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-100 mb-3" />
                                        <div className="h-2 w-10 bg-slate-100 rounded" />
                                    </div>
                                ))
                            ) : (
                                categories?.slice(0, 40).map((cat, i) => (
                                    <motion.div
                                        key={cat.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.02 }}
                                        onClick={() => router.push(`/user/services/${cat.id}`)}
                                        className="flex flex-col items-center cursor-pointer group"
                                    >
                                        <div className="relative w-16 h-16 rounded-[1.5rem] bg-slate-50 border border-transparent group-hover:border-[#74cb01]/20 group-hover:bg-white group-hover:shadow-xl group-hover:shadow-[#74cb01]/10 transition-all duration-300 flex items-center justify-center overflow-hidden">
                                            {cat.image_url ? (
                                                <Image
                                                    src={cat.image_url}
                                                    alt={cat.name}
                                                    fill
                                                    className="object-cover p-2 group-hover:scale-110 transition-transform duration-500"
                                                />
                                            ) : (
                                                <span className="text-lg font-black text-slate-300 group-hover:text-[#74cb01] transition-colors uppercase">
                                                    {cat.name.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="mt-3 text-[10px] font-black text-slate-500 group-hover:text-slate-900 transition-colors text-center uppercase tracking-tighter truncate w-full px-1">
                                            {cat.name}
                                        </p>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </section>

                    {/* --- TRUST / GROWTH CTA --- */}
                    <section className="relative rounded-[3rem] p-8 md:p-16 overflow-hidden">
                        {/* Dark Premium Background */}
                        <div className="absolute inset-0 bg-slate-950" />
                        {/* Animated Glow */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#74cb01]/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
                            <div className="text-center lg:text-left flex-1">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
                                    <Rocket size={12} className="text-[#74cb01]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#74cb01]">Scalability</span>
                                </div>
                                <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter leading-none">
                                    Grow Your <span className="text-[#74cb01]">Business</span> <br />
                                    <span className="text-white/20">With Dtssolutions</span>
                                </h2>
                                <p className="text-slate-400 text-base md:text-lg font-medium max-w-xl leading-relaxed">
                                    Whether you're looking for expert services or want to reach more customers, our ecosystem is built to accelerate your professional growth.
                                </p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
                                <button
                                    onClick={() => router.push('/user/enquiry')}
                                    className="group flex-1 lg:flex-none px-8 py-5 bg-[#74cb01] hover:bg-[#85e601] text-slate-950 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <PlusCircle size={18} />
                                    Post Requirements
                                </button>

                                <button
                                    onClick={() => router.push('/user/enquiry')}
                                    className="flex-1 lg:flex-none px-8 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all backdrop-blur-md"
                                >
                                    View All Enquiries
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* --- DIGITAL BRANDING - Cinematic Studio Slider --- */}
                    <section className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100 mb-12 overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8">
                            <div className="text-center md:text-left">
                                <span className="text-[#74cb01] font-black tracking-[0.3em] uppercase text-[10px] mb-3 block">
                                    Visual Storytelling
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                    Digital <span className="text-[#74cb01]">Branding</span>
                                </h2>
                                <p className="text-slate-500 mt-4 text-sm font-medium max-w-md leading-relaxed">
                                    Elevate your presence with high-impact cinematic assets designed for the digital age.
                                </p>
                            </div>

                            {/* Modern Control Bar */}
                            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => scrollBranding("left")}
                                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-[#74cb01] hover:border-[#74cb01] hover:text-white transition-all active:scale-90 shadow-sm"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => scrollBranding("right")}
                                        className="p-3 rounded-xl bg-slate-900 text-white hover:bg-[#74cb01] transition-all active:scale-90 shadow-sm"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-slate-200 mx-1" />
                                <Link
                                    href="/user/view-more?type=branding"
                                    className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#74cb01] transition flex items-center gap-2"
                                >
                                    View Portfolio <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Video Reel Container */}
                        <div
                            ref={brandingScrollRef}
                            onMouseEnter={() => setIsBrandingPaused(true)}
                            onMouseLeave={() => setIsBrandingPaused(false)}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-none scroll-smooth"
                        >
                            {brandingVideos.map((video) => (
                                <Link
                                    key={video.id}
                                    href="/user/view-more?type=branding"
                                    className="min-w-[280px] md:min-w-[340px] group/card snap-start block"
                                >
                                    <div className="relative h-[200px] md:h-[240px] rounded-[2rem] overflow-hidden shadow-lg bg-slate-200 border-4 border-white transition-all duration-500 group-hover/card:border-yellow-400 group-hover/card:shadow-2xl">
                                        <video
                                            src={video.video_url}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity" />
                                        <div className="absolute bottom-5 left-5 right-5">
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 py-1.5 px-3 rounded-lg
                transform translate-y-2 group-hover/card:translate-y-0
                transition-all duration-500 flex items-center gap-2">
                                                <p className="text-[#74cb01] font-semibold tracking-widest uppercase text-[8px]">
                                                    Premium
                                                </p>
                                                <ArrowRight size={12} className="text-white/80 group-hover/card:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Custom Pagination Dots */}
                        <div className="flex justify-center items-center gap-3 mt-4">
                            <div className="h-1.5 w-10 bg-[#74cb01] rounded-full shadow-[0_0_10px_rgba(116,203,1,0.5)]" />
                            <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                        </div>
                    </section>

                    {/* DIGITAL BANNERS - Refined Uniform Layout */}
                    <section className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-slate-100 mb-12 overflow-hidden">
                        <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8">
                            <div className="text-center md:text-left">
                                <span className="text-[#74cb01] font-black tracking-[0.3em] uppercase text-[10px] mb-3 block">
                                    Premium Graphics
                                </span>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-tighter leading-none">
                                    Digital <span className="text-[#74cb01]">Banners</span>
                                </h2>
                                <p className="text-slate-500 mt-4 text-sm font-medium max-w-md leading-relaxed">
                                    Elevate your presence with high-impact static assets designed for the digital age.
                                </p>
                            </div>

                            {/* Modern Control Bar */}
                            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100 shadow-inner">
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => scrollBanners("left")}
                                        className="p-3 rounded-xl border border-slate-200 bg-white hover:bg-[#74cb01] hover:border-[#74cb01] hover:text-white transition-all active:scale-90 shadow-sm"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        onClick={() => scrollBanners("right")}
                                        className="p-3 rounded-xl bg-slate-900 text-white hover:bg-[#74cb01] transition-all active:scale-90 shadow-sm"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                                <div className="h-8 w-px bg-slate-200 mx-1" />
                                <Link
                                    href="/user/view-more?type=banners"
                                    className="px-4 text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-[#74cb01] transition flex items-center gap-2"
                                >
                                    View More <ArrowRight size={14} />
                                </Link>
                            </div>
                        </div>

                        {/* Scrollable Container */}
                        <div
                            ref={bannerScrollRef}
                            onMouseEnter={() => setIsBannersPaused(true)}
                            onMouseLeave={() => setIsBannersPaused(false)}
                            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 scrollbar-none scroll-smooth"
                        >
                            {imageBanners.map((banner: any) => (
                                <div
                                    key={banner.id}
                                    onClick={() => router.push("/user/view-more?type=banners")}
                                    className="min-w-[300px] md:min-w-[380px] group/card snap-start block cursor-pointer"
                                >
                                    {/* FIXED SIZE KEY: 
                                       1. 'aspect-video' or 'h-[240px]' enforces identical vertical height.
                                       2. 'object-cover' prevents image distortion/stretching.
                                    */}
                                    <div className="relative h-[200px] md:h-[240px] rounded-[2rem] overflow-hidden shadow-lg bg-slate-200 border-4 border-white transition-all duration-500 group-hover/card:border-[#74cb01] group-hover/card:shadow-2xl">
                                        <img
                                            src={banner.image_url}
                                            alt={banner.title || "Banner"}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover/card:opacity-40 transition-opacity" />

                                                                                {/* Floating Premium Label matching your image exactly */}
                                        <div className="absolute bottom-5 left-5 right-5">
                                            <div className="bg-white/10 backdrop-blur-md border border-white/20 py-2 px-4 rounded-xl transform translate-y-2 group-hover/card:translate-y-0 transition-all duration-500 flex items-center justify-between gap-2">
                                                <div>
                                                    <p className="text-[#74cb01] font-black tracking-widest uppercase text-[8px] mb-0.5">
                                                        Premium Asset
                                                    </p>
                                                    <h4 className="text-white text-[11px] font-bold uppercase truncate max-w-[180px]">
                                                        {banner.title || 'Studio Banner'}
                                                    </h4>
                                                </div>
                                                <div className="bg-[#74cb01] p-1.5 rounded-lg text-white">
                                                    <ArrowRight size={12} className="group-hover/card:translate-x-1 transition-transform" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Custom Pagination Dots */}
                        <div className="flex justify-center items-center gap-3 mt-4">
                            <div className="h-1.5 w-10 bg-[#74cb01] rounded-full shadow-[0_0_10px_rgba(116,203,1,0.5)]" />
                            <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                            <div className="h-1.5 w-1.5 bg-slate-200 rounded-full" />
                        </div>
                    </section>

                </div>
            </main>
        </div>
    );
}
