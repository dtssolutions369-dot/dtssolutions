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
      <div className="min-h-screen bg-[#FFFDF5] pb-20">

        {/* ---------- HEADER ---------- */}
        <header className="relative z-20 bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-28 px-6 border-b border-yellow-200">
          <div className="max-w-7xl mx-auto">

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-yellow-800 mb-10"
            >
              <ChevronLeft size={16} />
              <span className="text-[10px] text-black font-extraboldtracking-widest uppercase">
                Back
              </span>
            </button>

            <div className="flex flex-col lg:flex-row gap-10 items-start justify-between">

              {/* TITLE + SEARCH */}
              <div className="flex-1">

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full mb-6 border border-yellow-300">
                    <Sparkles size={14} className="text-yellow-600" />
                    <span className="text-[10px] text-black font-extrabold tracking-widest uppercase">
                      Premium Directory
                    </span>
                  </div>

                  <h1 className="text-5xl md:text-7xl text-black font-extrabold tracking-tight leading-tight">
                    {pageTitle.split(" ")[0]} <br />
                    <span className="text-red-600 text-black font-extrabold tracking-tighter">
                      {pageTitle.split(" ").slice(1).join(" ")}
                    </span>
                  </h1>

                </div>



                {/* 🔍 SEARCH BAR */}
                <div className="mt-8 max-w-md relative">
                  <Search
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search here..."
                    className="w-full text-black pl-12 pr-4 py-3 rounded-full bg-white/80 border border-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm font-semibold"
                  />
                </div>
              </div>

              {/* RIGHT CARD */}
              <div className="hidden lg:block bg-white p-10 rounded-[3rem] shadow-xl border border-yellow-100">
                <ShieldCheck size={70} className="text-yellow-600" />
              </div>

            </div>
          </div>
        </header>

        {/* ---------- GRID ---------- */}
        <main className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-40">
              <Loader2 className="animate-spin text-yellow-600" size={40} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {filteredData.map((item) => {
                const mediaUrl =
                  item.media_url || item.image_url || item.video_url;
                const isVideo =
                  item.media_type === "video" || item.video_url;

                return (
                  <div key={item.id} className="group">

                    <div className="relative aspect-video rounded-3xl overflow-hidden border bg-white">
                      {isVideo ? (
                        <div
                          onClick={() => setActiveVideo(mediaUrl)}
                          className="cursor-pointer w-full h-full"
                        >
                          <video
                            src={mediaUrl}
                            className="w-full h-full object-cover"
                            muted
                            autoPlay
                            loop
                            playsInline
                            preload="metadata"
                          />

                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
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
                            alt=""
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <h3 className="mt-4 text-lg font-extrabold text-black uppercase">
                      {item.name || item.title}
                    </h3>

                    {type === "categories" && (
                      <Link
                        href={`/user/services/${item.id}`}
                        className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-yellow-700"
                      >
                        Explore <ArrowRight size={16} />
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* MODALS */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div
            className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center"
            onClick={() => setActiveVideo(null)}
          >
            <motion.div
              className="relative bg-black rounded-3xl p-4 w-full max-w-3xl aspect-video mx-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              {/* CLOSE BUTTON */}
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute -top-4 -right-4 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white"
              >
                <X size={18} />
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
            className="fixed inset-0 bg-black/90 z-[999] flex items-center justify-center"
            onClick={() => setActiveImage(null)}
          >
            <img src={activeImage} className="max-w-[90vw] max-h-[90vh] rounded-2xl" />
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
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="animate-spin text-yellow-600" size={40} />
        </div>
      }
    >
      <ViewMoreContent />
    </Suspense>
  );
}
