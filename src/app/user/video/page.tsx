"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play, X, Clock, Sparkles, Search, Video,
  MonitorPlay, Building2, MapPin, Briefcase, Users
} from "lucide-react";

export default function VideoPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("All Sectors");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedUserType, setSelectedUserType] = useState("All Types");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);

    const fetchAllVideos = async () => {
      setLoading(true);

      const { data: registerData } = await supabase
        .from("vendor_register")
        .select("id, company_name, video_files, sector, area, user_type")
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
            title: video.title || "Company Showcase",
            vendorName: vendor.company_name,
            vendorId: vendor.id,
            sector: vendor.sector || "General",
            area: vendor.area || "N/A",
            userType: vendor.user_type || [],
            isYouTube: !!ytId,
            ytId,
            thumbnail: ytId
              ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
              : (video.thumbnail || "/api/placeholder/400/225"),
            category: "Provider",
            duration: "Showcase",
            source: "register",
          };
        });
      });

      const normalizedStandalone = (standaloneData || []).map((video: any) => {
        const ytMatch = video.video_url?.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
        const ytId = ytMatch && ytMatch[2]?.length === 11 ? ytMatch[2] : null;

        return {
          uniqueId: `sta-${video.id}`,
          title: video.video_title,
          url: video.video_url,
          vendorName: "Admin",
          vendorId: null,
          sector: Array.isArray(video.business_sector) ? video.business_sector[0] : video.business_sector || "General",
          area: video.area || "N/A",
          userType: video.legal_type || "All",
          isYouTube: !!ytId,
          ytId,
          thumbnail: ytId
            ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
            : "/api/placeholder/400/225",
          duration: "Tutorial",
          category: "Verified",
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
    const matchesSearch =
      v.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSector = selectedSector === "All Sectors" ||
      (Array.isArray(v.sector) ? v.sector.includes(selectedSector) : v.sector === selectedSector);

    const matchesArea = selectedArea === "All Areas" || v.area === selectedArea;

    const matchesUserType = selectedUserType === "All Types" ||
      (Array.isArray(v.userType) ? v.userType.includes(selectedUserType) : v.userType === selectedUserType);

    return matchesSearch && matchesSector && matchesArea && matchesUserType;
  });

  const sectors = ["All Sectors", ...new Set(videos.flatMap(v => v.sector).filter(Boolean))];
  const areas = ["All Areas", ...new Set(videos.map(v => v.area).filter(Boolean))];
  const userTypes = ["All Types", ...new Set(videos.flatMap(v => v.userType).filter(Boolean))];

  // --- MOBILE VIEW (REELS STYLE) ---
  if (isMobile && !loading) {
    return (
      <div className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
        {filteredVideos.map((video) => (
          <div key={video.uniqueId} className="h-screen w-full snap-start relative flex items-center justify-center bg-black">
            <div className="absolute inset-0 z-0">
              {video.isYouTube ? (
                <iframe
                  src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=1&loop=1&playlist=${video.ytId}&controls=0`}
                  className="w-full h-full pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <video
                  src={video.url}
                  autoPlay loop muted playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80" />
            <div className="absolute bottom-10 left-6 z-10 text-white pr-20">
              <span className="text-red-500 font-black text-xs uppercase tracking-widest">{video.sector}</span>
              <h3 className="font-black text-2xl leading-tight mt-1">{video.title}</h3>
              <p className="text-sm opacity-80 mt-2 flex items-center gap-2">
                <Building2 size={14} /> {video.vendorName}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --- DESKTOP VIEW ---
  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 pb-20 font-sans">
      {/* Header Section */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-24 pb-40 px-6 relative overflow-hidden border-b border-yellow-200">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-left">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full mb-6 shadow-sm border border-yellow-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-800">Verified Tutorials</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-6xl md:text-8xl font-black tracking-tighter text-gray-900 leading-[0.85]">
              Video <br /> <span className="text-red-600 italic">Hub</span>
            </motion.h1>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="hidden lg:block bg-white p-12 rounded-[4rem] shadow-2xl border-2 border-yellow-100 relative rotate-3">
            <MonitorPlay size={100} className="text-yellow-600" strokeWidth={1.5} />
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-20">
        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl border border-yellow-100 mb-16">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-yellow-600" size={20} />
              <input
                type="text"
                placeholder="SEARCH TUTORIALS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-5 bg-[#FEF3C7]/30 border-none rounded-2xl outline-none font-black uppercase text-sm tracking-widest"
              />
            </div>
            {/* Sector, Area, Type Selects (Simplified for space) */}
            <div className="flex gap-2">
              <select value={selectedSector} onChange={(e) => setSelectedSector(e.target.value)} className="bg-yellow-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                {sectors.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="bg-yellow-50 px-4 py-2 rounded-xl text-[10px] font-black uppercase">
                {areas.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mt-10">
          {filteredVideos.map((video) => (
            <motion.div key={video.uniqueId} layout className="group bg-white rounded-[2.5rem] border border-yellow-100 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="relative h-60 w-full overflow-hidden cursor-pointer" onClick={() => setSelectedVideo(video)}>
                {video.isYouTube ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${video.ytId}?autoplay=1&mute=1&loop=1&playlist=${video.ytId}&controls=0`}
                    className="w-full h-full pointer-events-none"
                    allow="autoplay; encrypted-media"
                  />
                ) : (
                  <video
                    src={video.url}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}

                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={48} className="text-white fill-current" />
                </div>
              </div>
              <div className="p-6">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">{video.sector}</span>
                <h3 className="text-xl font-black mt-1 line-clamp-1">{video.title}</h3>
                <div className="flex items-center gap-2 mt-4 text-gray-500">
                  <Building2 size={14} />
                  <span className="text-sm font-bold">{video.vendorName}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-video w-full bg-black">
                {selectedVideo.isYouTube ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.ytId}?autoplay=1`}
                    className="w-full h-full" allowFullScreen
                  />
                ) : (
                  <video src={selectedVideo.url} controls autoPlay className="w-full h-full" />
                )}
              </div>
              <div className="p-8">
                <h2 className="text-2xl font-black uppercase">{selectedVideo.title}</h2>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><MapPin size={14} /> {selectedVideo.area}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500"><Clock size={14} /> {selectedVideo.duration}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}