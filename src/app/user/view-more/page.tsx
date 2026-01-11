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
  Info,
  ArrowRight,
  Layers,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Loader2,
  Maximize2,
  X
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
  
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!type || !PAGE_CONFIG[type]) {
      router.push("/user");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      const { table } = PAGE_CONFIG[type];
      let query = supabase.from(table).select("*");
      const { data, error } = await query;
      if (!error) setData(data || []);
      setLoading(false);
    };

    fetchData();
  }, [type, router]);

  const pageTitle = type ? PAGE_CONFIG[type]?.title : "";

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveVideo(null);
        setActiveImage(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  return (
    <>
      <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans selection:bg-yellow-200 pb-20">
        
        {/* ---------- HEADER ---------- */}
        <header className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-200">
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
              
              <div className="flex-1">
                <button onClick={() => router.back()} className="flex items-center gap-2 text-yellow-800 hover:text-black transition-all mb-12 group w-fit">
                  <div className="p-2 rounded-full border border-yellow-300 bg-white/50 backdrop-blur-md group-hover:border-yellow-500 transition-colors">
                    <ChevronLeft size={16} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Hub</span>
                </button>

                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-8 shadow-sm border border-yellow-300"
                >
                  <Sparkles size={14} className="text-yellow-600" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Premium Directory</span>
                </motion.div>

                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 uppercase leading-none">
                  {pageTitle.split(' ')[0]} <br />
                  <span className="text-red-600 italic">{pageTitle.split(' ').slice(1).join(' ')}</span>
                </h1>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: -3 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="hidden lg:block bg-white p-10 rounded-[3.5rem] shadow-2xl border-2 border-yellow-100 relative"
              >
                <div className="absolute -top-3 -right-3 bg-red-600 text-white p-3 rounded-2xl animate-bounce shadow-xl">
                  <ShieldCheck size={28} strokeWidth={2.5} />
                </div>
                <div className="bg-yellow-50 p-6 rounded-[2rem]">
                  <Layers size={80} className="text-yellow-600" strokeWidth={1.5} />
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[7px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-full whitespace-nowrap">
                  VERIFIED ASSETS
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* ---------- GRID ---------- */}
        <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <Loader2 className="w-10 h-10 text-yellow-600 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {data.map((item) => {
                const isVideo = item.media_type === "video" || (type !== 'influencers' && item.video_url);
                const mediaUrl = item.media_url || item.image_url || item.video_url;

                return (
                  <div key={item.id} className="group flex flex-col">
                    <div className="relative aspect-video overflow-hidden rounded-3xl bg-white border border-yellow-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-2">
                      {isVideo ? (
                        <div className="w-full h-full cursor-pointer relative" onClick={() => setActiveVideo(mediaUrl)}>
                          <video src={mediaUrl} className="w-full h-full object-cover" muted loop playsInline />
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/40 transition-all">
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-full border border-white/40 text-white group-hover:bg-yellow-500 group-hover:text-black transition-all">
                              <PlayCircle size={24} fill="currentColor" fillOpacity={0.2} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full cursor-pointer relative" onClick={() => setActiveImage(mediaUrl)}>
                          <Image src={mediaUrl || "/placeholder.jpg"} alt={item.name || "Item"} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                             <div className="p-3 bg-white rounded-full shadow-lg scale-90 group-hover:scale-100 transition-transform">
                                <Maximize2 size={20} className="text-gray-900" />
                             </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 flex flex-col gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="h-[1.5px] w-6 bg-yellow-500 group-hover:w-10 transition-all" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{type}</span>
                        </div>
                        <h3 className="text-xl font-black text-gray-950 uppercase">{item.name || item.title}</h3>
                      </div>

                      {/* CATEGORY EXPLORE LINK SECTION */}
                      {type === "categories" && (
                        <Link
                          href={`/user/services/${item.id}`}
                          className="flex items-center justify-between group/link pt-4 border-t border-gray-100"
                        >
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center group-hover/link:bg-black group-hover/link:text-white transition-all">
                              <ArrowRight size={18} className="-rotate-45 group-hover/link:rotate-0 transition-transform duration-500" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">Explore Entry</span>
                          </div>
                          <ExternalLink size={14} className="text-gray-300 group-hover:text-yellow-600 transition-colors" />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* ---------- MODALS ---------- */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveVideo(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative w-[90vw] max-w-4xl aspect-video rounded-3xl overflow-hidden bg-black border border-white/10">
              <button onClick={() => setActiveVideo(null)} className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-red-600 text-white p-2 rounded-full transition"><X size={20} /></button>
              <video src={activeVideo} controls autoPlay className="w-full h-full" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeImage && (
          <motion.div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActiveImage(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="relative max-w-[85vw] max-h-[85vh]">
              <button onClick={() => setActiveImage(null)} className="absolute -top-12 right-0 text-white flex items-center gap-2 font-bold uppercase tracking-widest text-[10px] hover:text-red-500 transition-colors"><X size={20} /> Close Preview</button>
              <img src={activeImage} alt="Fullscreen Preview" className="w-full h-full object-contain rounded-2xl shadow-2xl border border-white/10" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function ViewMorePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFFDF5]"><Loader2 className="animate-spin text-yellow-600" size={40} /></div>}>
      <ViewMoreContent />
    </Suspense>
  );
}