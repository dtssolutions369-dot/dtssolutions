"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Sparkles, ShieldCheck, Layers, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  id: string;
  name: string;
  image_url?: string;
}

export default function ViewAllCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!search) {
      setFilteredCategories(categories);
    } else {
      setFilteredCategories(
        categories.filter((cat) =>
          cat.name.toLowerCase().includes(search.toLowerCase())
        )
      );
    }
  }, [search, categories]);

  async function fetchCategories() {
    setLoading(true);
    const { data } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("name");
    if (data) {
      setCategories(data);
      setFilteredCategories(data);
    }
    setLoading(false);
  }

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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Premium Directory</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              All <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Categories.</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Explore our comprehensive collection of verified service categories to find exactly what you need.
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
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">Back to Hub</span>
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
                  placeholder="Search categories..."
                  className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-slate-600 w-full mt-0.5"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MAIN GRID CONTENT --- */}
      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-8">
          <AnimatePresence mode="popLayout">
            {loading ? (
              [...Array(24)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-sm flex flex-col animate-pulse"
                >
                  <div className="relative aspect-square bg-slate-100"></div>
                  <div className="p-6">
                    <div className="h-4 bg-slate-100 rounded mb-4"></div>
                  </div>
                </motion.div>
              ))
            ) : (
              filteredCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -12 }}
                  className="group bg-white border border-slate-100 rounded-[3rem] overflow-hidden hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)] transition-all duration-500 flex flex-col cursor-pointer"
                  onClick={() => router.push(`/user/services/${cat.id}`)}
                >
                  <div className="relative aspect-square bg-slate-100 overflow-hidden">
                    {cat.image_url ? (
                      <Image 
                        src={cat.image_url} 
                        alt={cat.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-200">
                        <Layers size={40} strokeWidth={1} />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2">
                      <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/50 shadow-sm flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-[#74cb01] animate-pulse" />
                          <span className="text-[8px] font-black uppercase text-slate-800 tracking-wider">Active</span>
                      </div>
                    </div>
                    
                    <div className="absolute bottom-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-slate-900 shadow-xl">
                        <Sparkles size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter line-clamp-2 group-hover:text-[#00AEEF] transition-colors leading-[1.1] mb-4">
                      {cat.name}
                    </h3>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                      <div>
                          <p className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Category</p>
                          <p className="text-xs font-black text-[#F26522] tracking-tighter">Service</p>
                      </div>
                      <div className="h-8 w-8 bg-slate-50 group-hover:bg-[#74cb01] group-hover:text-white rounded-lg flex items-center justify-center text-slate-300 transition-all duration-300">
                        <ShieldCheck size={12} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}