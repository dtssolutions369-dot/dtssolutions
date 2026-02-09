"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import {
  ChevronLeft,
  PlayCircle,
  ArrowRight,
  Layers,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Loader2,
  Maximize2,
  X,
  Search
} from "lucide-react";

type PageConfig = {
  title: string;
  table: string;
};

const PAGE_CONFIG: Record<string, PageConfig> = {
  help: { title: "Help & Earn", table: "help_and_earn" },
  categories: { title: "All Categories", table: "categories" },
  branding: { title: "Digital Branding", table: "digital_branding_videos" },
  podcasts: { title: "Podcasts", table: "podcast_videos" },
  influencers: { title: "Influencers", table: "influencers_videos" },
  certificates: { title: "Certificates", table: "certificates" },
  banners: { title: "Digital Banners", table: "digital_banners" },
};

function ViewMoreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const type = searchParams.get("type");

  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    if (!type || !PAGE_CONFIG[type]) {
      router.push("/user");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { table } = PAGE_CONFIG[type];
      const { data } = await supabase.from(table).select("*");
      setData(data || []);
      setLoading(false);
    };

    fetchData();
  }, [type, router]);

  const pageTitle = type ? PAGE_CONFIG[type]?.title : "";

  const filteredData = data.filter((item) =>
    (item.name || item.title || "")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <>
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
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium Directory</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
                {pageTitle.split(" ")[0]} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">{pageTitle.split(" ").slice(1).join(" ")}</span>
              </h1>
              <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
                Explore our curated collection of premium {pageTitle.toLowerCase()} designed to elevate your experience.
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Back Button */}
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#00AEEF]/40 transition-all"
              >
                <ChevronLeft size={20} className="text-[#00AEEF]" />
                <div className="flex flex-col flex-1">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Navigation</label>
                  <span className="bg-transparent border-none outline-none text-white font-bold text-xs">Back to Previous</span>
                </div>
              </button>

              {/* Search Input */}
              <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 focus-within:border-[#F26522]/40 transition-all">
                <Search size={20} className="text-[#F26522]" />
                <div className="flex flex-col flex-1">
                  <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Search</label>
                  <input 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search here..."
                    className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-slate-600 w-full mt-0.5"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* --- MAIN GRID CONTENT --- */}
        <main className="max-w-[1400px] mx-auto px-6 py-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32">
              <Loader2 className="animate-spin text-[#00AEEF] mb-6" size={50} />
              <p className="text-xs font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse">Loading Premium Content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredData.map((item) => {
                  const mediaUrl = item.media_url || item.image_url || item.video_url;
                  const isVideo = item.media_type === "video" || item.video_url;

                  return (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -12 }}
                      className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col"
                    >
                      <div className="relative aspect-video bg-slate-100 overflow-hidden">
                        {isVideo ? (
                          <div
                            onClick={() => setActiveVideo(mediaUrl)}
                            className="cursor-pointer w-full h-full"
                          >
                            <video
                              src={mediaUrl}
                              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                              muted
                              autoPlay
                              loop
                              playsInline
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <PlayCircle size={40} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => setActiveImage(mediaUrl)}
                            className="cursor-pointer w-full h-full"
                          >
                            <Image
                              src={mediaUrl}
                              alt={item.name || item.title || ""}
                              fill
                              className="object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                          </div>
                        )}
                        
                        {/* Badges */}
                        <div className="absolute top-6 left-6 flex flex-col gap-2">
                          <div className="bg-white/95 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/50 shadow-sm flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-[#74cb01] animate-pulse" />
                              <span className="text-[9px] font-black uppercase text-slate-800 tracking-wider">Premium</span>
                          </div>
                        </div>
                        
                        <div className="absolute bottom-4 right-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                          <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-slate-900 shadow-xl">
                            <Maximize2 size={20} />
                          </div>
                        </div>
                      </div>

                      {/* Info Section */}
                      <div className="p-8 flex-1 flex flex-col">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter line-clamp-2 group-hover:text-[#00AEEF] transition-colors leading-[1.1] mb-6">
                          {item.name || item.title}
                        </h3>
                        
                        <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                          <div>
                              <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Category</p>
                              <p className="text-sm font-black text-[#F26522] tracking-tighter">{pageTitle}</p>
                          </div>
                          {type === "categories" && (
                            <Link href={`/user/services/${item.id}`} className="h-10 w-10 bg-slate-50 group-hover:bg-[#74cb01] group-hover:text-white rounded-xl flex items-center justify-center text-slate-300 transition-all duration-300">
                              <ArrowRight size={16} />
                            </Link>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="relative bg-black rounded-3xl p-4 w-full max-w-4xl aspect-video mx-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-4 -right-4 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-[#74cb01] hover:text-white transition-all"
              >
                <X size={20} />
              </button>

              {/* VIDEO */}
              <video
                src={activeVideo}
                autoPlay
                controls
                playsInline
                className="w-full h-full object-contain rounded-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeImage && (
          <motion.div
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center p-4"
            onClick={() => setActiveImage(null)}
          >
            <motion.div
              className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <img src={activeImage} className="w-full h-full object-contain" />
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-[#74cb01] hover:text-white transition-all"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ViewMorePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
          <Loader2 className="animate-spin text-[#00AEEF]" size={50} />
        </div>
      }
    >
      <ViewMoreContent />
    </Suspense>
  );
}