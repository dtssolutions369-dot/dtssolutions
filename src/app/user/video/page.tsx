"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Play, X, Clock, Sparkles, Search, Video,
  MonitorPlay, MapPin, ChevronRight, User
} from "lucide-react";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedArea, setSelectedArea] = useState("All Areas");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchAllVideos = async () => {
      setLoading(true);
      const { data: registerData } = await supabase
        .from("vendor_register")
        .select("id, company_name, video_files, sector, area")
        .not("video_files", "is", null);

      const { data: standaloneData } = await supabase
        .from("vendor_videos")
        .select("*");

      const normalizedRegister = (registerData || []).flatMap((vendor: any) => {
        if (!Array.isArray(vendor.video_files)) return [];
        return vendor.video_files.map((video: any, index: number) => {
          const ytMatch = video.url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
          const ytId = ytMatch && ytMatch[2]?.length === 11 ? ytMatch[2] : null;

          return {
            ...video,
            uniqueId: `reg-${vendor.id}-${index}`,
            title: vendor.company_name || "Company Showcase",
            vendorId: vendor.id,
            sector: vendor.sector || "General",
            area: vendor.area || "N/A",
            isYouTube: !!ytId,
            ytId,
            source: "register",
          };
        });
      });

      const normalizedStandalone = (standaloneData || []).map((video: any) => {
        const ytMatch = video.video_url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        const ytId = ytMatch && ytMatch[2]?.length === 11 ? ytMatch[2] : null;

        return {
          uniqueId: `sta-${video.id}`,
          title: video.video_title || "Official Tutorial",
          url: video.video_url,
          vendorId: null,
          sector: Array.isArray(video.business_sector) ? video.business_sector[0] : video.business_sector || "General",
          area: video.area || "N/A",
          isYouTube: !!ytId,
          ytId,
          source: "standalone",
        };
      });

      setVideos([...normalizedRegister, ...normalizedStandalone]);
      setLoading(false);
    };

    fetchAllVideos();
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const filteredVideos = videos.filter((v) => {
    const matchesSearch = v.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === "All Sectors" || v.sector === selectedSector;
    const matchesArea = selectedArea === "All Areas" || v.area === selectedArea;
    return matchesSearch && matchesSector && matchesArea;
  });

  const sectors = ["All Sectors", ...new Set(videos.flatMap(v => v.sector).filter(Boolean))];
  const areas = ["All Areas", ...new Set(videos.map(v => v.area).filter(Boolean))];

  // --- MOBILE REELS VIEW (AUTOPLAY) ---
  if (isMobile && !loading) {
    return (
      <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {filteredVideos.map((video) => (
          <div key={video.uniqueId} className="h-screen w-full snap-start relative flex items-center justify-center bg-black overflow-hidden">
            <div className="absolute inset-0">
              {video.isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=1&loop=1&playlist=${video.ytId}&controls=0&modestbranding=1&rel=0`}
                  className="w-full h-full scale-[1.7] pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video 
                  src={video.url} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover" 
                />
              )}
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />

            <div className="absolute bottom-10 left-5 right-16 z-20 text-white">
               <div className="flex items-center gap-2 mb-3">
                  <span className="bg-red-600 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest">
                    {video.sector}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-bold text-yellow-400">
                    <MapPin size={12} /> {video.area}
                  </span>
               </div>
               <h3 className="text-2xl font-black leading-tight mb-6 drop-shadow-lg">{video.title}</h3>
               
               {video.vendorId && (
                 <Link 
                   href={`/vendor/view/${video.vendorId}`} 
                   className="inline-flex items-center justify-center gap-2 bg-yellow-400 text-black px-6 py-3 rounded-full text-sm font-black shadow-xl active:scale-95 transition-transform"
                 >
                    <User size={18} /> VIEW PROFILE
                 </Link>
               )}
            </div>

            <div className="absolute bottom-28 right-4 flex flex-col items-center z-30 opacity-80">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 shadow-lg mb-1">
                  <Sparkles className="text-yellow-400" size={20} />
                </div>
                <span className="text-[10px] font-black text-white uppercase">Quick</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- DESKTOP VIEW (GRID AUTOPLAY) ---
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 pb-20 font-sans">
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-20 px-6 border-b border-yellow-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter">
              Video <span className="text-red-600 italic">Hub</span>
            </h1>
          </div>
          <MonitorPlay size={50} className="text-yellow-600 hidden md:block opacity-40" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        {/* Filters */}
        <div className="bg-white p-3 rounded-2xl shadow-xl border border-yellow-100 mb-10">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-600" size={18} />
              <input
                type="text"
                placeholder="SEARCH TUTORIALS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-yellow-50/50 rounded-xl outline-none font-bold text-xs uppercase"
              />
            </div>
            <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="bg-yellow-50/50 px-4 py-3 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer">
              {sectors.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="bg-yellow-50/50 px-4 py-3 rounded-xl text-[10px] font-black uppercase border-none cursor-pointer">
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
          {filteredVideos.map((video) => (
            <motion.div key={video.uniqueId} className="group bg-white rounded-[2.5rem] border border-yellow-100 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-xl transition-all duration-300">
              <div className="relative h-60 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedVideo(video)}>
                {video.isYouTube ? (
                  <iframe 
                    src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=1&loop=1&playlist=${video.ytId}&controls=0`} 
                    className="w-full h-full pointer-events-none" 
                  />
                ) : (
                  <video src={video.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Play size={48} className="text-white fill-current" />
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{video.sector}</span>
                </div>
                <h3 className="text-xl font-black mt-1 line-clamp-1">{video.title}</h3>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-gray-500">
                    <MapPin size={14} className="text-yellow-600" />
                    <span className="text-sm font-bold">{video.area}</span>
                  </div>
                  {video.vendorId && (
                    <Link href={`/vendor/view/${video.vendorId}`} className="text-gray-300 hover:text-red-600 transition-colors">
                      <ChevronRight size={22} />
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal with high-quality autoplay */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div className="fixed inset-0 bg-black/95 z-[999] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedVideo(null)}>
            <motion.div className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="aspect-video w-full bg-black">
                {selectedVideo.isYouTube ? (
                  <iframe src={`https://www.youtube.com/embed/${selectedVideo.ytId}?autoplay=1`} className="w-full h-full" allowFullScreen allow="autoplay" />
                ) : (
                  <video src={selectedVideo.url} controls autoPlay className="w-full h-full" />
                )}
              </div>
              <div className="p-6 flex justify-between items-center">
                <h2 className="text-xl font-black uppercase">{selectedVideo.title}</h2>
                <button onClick={() => setSelectedVideo(null)} className="bg-gray-100 text-gray-500 px-5 py-2 rounded-xl text-xs font-black">CLOSE</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}