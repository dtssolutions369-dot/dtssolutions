"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Play, X, MapPin, Video, MonitorPlay, 
  Layers, Filter, ArrowUpRight, Search, 
  ChevronDown, Info, Loader2
} from "lucide-react";

// --- Types ---
interface VideoItem {
  uniqueId: string;
  title: string;
  url?: string;
  vendorId: string | null;
  sector: string;
  area: string;
  isYouTube: boolean;
  ytId: string | null;
}

export default function VideoShowcase() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedArea, setSelectedArea] = useState("All Areas");

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [regRes, staRes] = await Promise.all([
          supabase.from("vendor_register").select("id, company_name, video_files, sector, area").not("video_files", "is", null),
          supabase.from("vendor_videos").select("*")
        ]);

        const normalizedRegister = (regRes.data || []).flatMap((vendor: any) => {
          if (!Array.isArray(vendor.video_files)) return [];
          return vendor.video_files.map((v: any, i: number) => parseVideoData(v.url, vendor.company_name, vendor.id, vendor.sector, vendor.area, `reg-${vendor.id}-${i}`));
        });

        const normalizedStandalone = (staRes.data || []).map((v: any) => 
          parseVideoData(v.video_url, v.video_title, null, v.business_sector, v.area, `sta-${v.id}`)
        );

        setVideos([...normalizedRegister, ...normalizedStandalone]);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  // Utility to parse YT IDs and normalize structure
  const parseVideoData = (url: string, title: string, vendorId: any, sector: any, area: any, uid: string): VideoItem => {
    const ytMatch = url?.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/user\/\S+|\/ytscreeningroom\?v=))([\w\-]{11})/);
    const ytId = ytMatch ? ytMatch[1] : null;
    return {
      uniqueId: uid,
      title: title || "Untitled Presentation",
      url,
      vendorId,
      sector: sector || "General",
      area: area || "Global",
      isYouTube: !!ytId,
      ytId
    };
  };

  const filteredVideos = useMemo(() => {
    return videos.filter(v => {
      const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = selectedSector === "All Sectors" || v.sector === selectedSector;
      const matchesArea = selectedArea === "All Areas" || v.area === selectedArea;
      return matchesSearch && matchesSector && matchesArea;
    });
  }, [videos, searchQuery, selectedSector, selectedArea]);

  const sectors = ["All Sectors", ...Array.from(new Set(videos.map(v => v.sector)))];
  const areas = ["All Areas", ...Array.from(new Set(videos.map(v => v.area)))];

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-[#00AEEF] mb-4" size={40} />
      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Loading Experience...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-20">
      
      {/* --- HERO SECTION --- */}
      <header className="relative pt-24 pb-40 overflow-hidden">
        <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-bl from-[#74cb01]/10 via-transparent to-transparent -z-10" />
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#74cb01] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#74cb01]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Showreel Hub</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Visual <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Stories.</span>
            </h1>
            <p className="max-w-xl text-slate-500 text-lg font-medium">
              Explore the next generation of businesses through high-impact video presentations and tutorials.
            </p>
          </motion.div>
        </div>
      </header>

      {/* --- FILTER BAR --- */}
      <section className="max-w-6xl mx-auto px-6 -mt-20 relative z-40">
        <div className="bg-white/70 backdrop-blur-3xl border border-white p-3 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search companies..."
              className="w-full pl-14 pr-6 py-4 bg-slate-100/50 rounded-[1.8rem] outline-none font-bold text-xs uppercase tracking-tight focus:bg-white transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <CustomSelect icon={<Layers size={16}/>} value={selectedSector} options={sectors} onChange={setSelectedSector} />
            <CustomSelect icon={<MapPin size={16}/>} value={selectedArea} options={areas} onChange={setSelectedArea} />
          </div>
        </div>
      </section>

      {/* --- GRID --- */}
      <main className="max-w-7xl mx-auto px-6 mt-24">
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence>
            {filteredVideos.map((video) => (
              <VideoCard key={video.uniqueId} video={video} onClick={() => setSelectedVideo(video)} />
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredVideos.length === 0 && (
          <div className="py-40 text-center">
            <Info className="mx-auto text-slate-300 mb-4" size={48} />
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No videos match your criteria</p>
          </div>
        )}
      </main>

      {/* --- VIDEO MODAL --- */}
      <AnimatePresence>
        {selectedVideo && (
          <VideoModal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Sub-Components ---

function VideoCard({ video, onClick }: { video: VideoItem, onClick: () => void }) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="group bg-white rounded-[2.5rem] p-4 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500"
    >
      <div 
        className="relative aspect-[16/10] rounded-[2rem] overflow-hidden bg-slate-200 cursor-pointer"
        onClick={onClick}
      >
        {video.isYouTube ? (
          <img 
            src={`https://img.youtube.com/vi/${video.ytId}/maxresdefault.jpg`} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            alt={video.title}
          />
        ) : (
          <video src={video.url} className="w-full h-full object-cover" />
        )}
        
        <div className="absolute inset-0 bg-slate-900/20 group-hover:bg-slate-900/40 transition-colors flex items-center justify-center">
          <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-75 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300">
            <Play fill="currentColor" size={24} />
          </div>
        </div>

        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter">
            {video.sector}
          </span>
        </div>
      </div>

      <div className="mt-6 px-2 flex justify-between items-start">
        <div>
          <h3 className="text-xl font-black uppercase tracking-tighter leading-tight group-hover:text-[#00AEEF] transition-colors">
            {video.title}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-slate-400">
            <MapPin size={12} />
            <span className="text-[10px] font-bold uppercase tracking-widest">{video.area}</span>
          </div>
        </div>
        
        {video.vendorId && (
          <Link href={`/vendor/view/${video.vendorId}`} className="p-3 bg-slate-50 rounded-2xl hover:bg-[#74cb01] hover:text-white transition-colors">
            <ArrowUpRight size={20} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

function CustomSelect({ icon, value, options, onChange }: any) {
  return (
    <div className="relative min-w-[160px]">
      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#74cb01] pointer-events-none">
        {icon}
      </div>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-12 pr-10 py-4 bg-slate-100/50 rounded-[1.5rem] border-none font-black text-[10px] uppercase tracking-widest cursor-pointer outline-none hover:bg-white transition-all appearance-none"
      >
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function VideoModal({ video, onClose }: { video: VideoItem, onClose: () => void }) {
  return (
    <motion.div 
      className="fixed inset-0 bg-slate-950/90 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div 
        className="w-full max-w-5xl bg-white rounded-[3rem] overflow-hidden shadow-2xl"
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="aspect-video bg-black relative">
          <button onClick={onClose} className="absolute top-6 right-6 z-10 h-12 w-12 bg-white/10 hover:bg-white text-white hover:text-black rounded-full transition-all flex items-center justify-center backdrop-blur-md">
            <X size={20} />
          </button>
          
          {video.isYouTube ? (
            <iframe src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay" />
          ) : (
            <video src={video.url} controls autoPlay className="w-full h-full" />
          )}
        </div>

        <div className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[#00AEEF]">
              <MonitorPlay size={28} />
            </div>
            <div>
              <p className="text-[10px] font-black text-[#74cb01] uppercase tracking-[0.2em]">{video.sector}</p>
              <h2 className="text-3xl font-black uppercase tracking-tighter">{video.title}</h2>
            </div>
          </div>
          
          {video.vendorId && (
            <Link 
              href={`/vendor/view/${video.vendorId}`}
              className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#00AEEF] transition-all text-center"
            >
              Visit Vendor Profile
            </Link>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}