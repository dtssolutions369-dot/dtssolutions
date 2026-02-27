"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  ChevronRight,
  Loader2, ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Layers,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [activeParent, setActiveParent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name", { ascending: true });

    if (!error && data) {
      setCategories(data);
      const parents = data.filter((cat: any) => !cat.parent_id);
      if (parents.length > 0) setActiveParent(parents[0].id);
    }
    setLoading(false);
  };

  const parentCategories = categories.filter((cat) => !cat.parent_id);
  const activeSubCategories = categories.filter((cat) => cat.parent_id === activeParent);
  const currentParent = parentCategories.find(p => p.id === activeParent);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-4 md:py-10 px-4 md:px-8">
      <div className="max-w-[1600px] mx-auto">

        {/* --- HEADER SECTION --- */}
        <header className="mb-8 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#ff3d00] border border-orange-100"
            >
              <Sparkles size={14} className="fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-[0.15em]">Premium Curation</span>
            </motion.div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[0.9] text-slate-900">
              The <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3d00] to-orange-400">Collections</span>
            </h1>
          </div>
          <div className="max-w-sm hidden md:block">
            <p className="text-slate-500 font-medium text-lg leading-relaxed">
              Explore our meticulously organized categories to find exactly what you need from trusted local vendors.
            </p>
          </div>
        </header>

        {loading ? (
          <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
            <p className="text-slate-400 font-black animate-pulse uppercase text-xs tracking-widest">Organizing Aisle...</p>
          </div>
        ) : (
          /* Main Container: Flex-col on mobile, Flex-row on desktop */
          <div className="flex flex-col lg:flex-row gap-4 bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl shadow-slate-200/40 border border-white overflow-hidden min-h-[500px] md:min-h-[700px]">

            {/* --- SIDEBAR / TOP NAV --- */}
            <nav className="w-full lg:w-[900px] bg-slate-50/50 border-b lg:border-r lg:border-b-0 border-slate-100 p-4 md:p-8 flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto custom-scrollbar no-scrollbar">
              <div className="hidden lg:flex items-center gap-2 mb-8 px-2">
                <Layers size={18} className="text-slate-400" />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Main Categories</span>
              </div>

              {parentCategories.map((parent) => (
                <button
                  key={parent.id}
                  onClick={() => setActiveParent(parent.id)}
                  className={`flex-shrink-0 lg:w-full flex items-center gap-3 md:gap-4 p-3 md:p-5 rounded-2xl md:rounded-[2rem] transition-all duration-500 group relative ${activeParent === parent.id
                    ? "bg-white shadow-xl shadow-orange-500/10 text-[#ff3d00]"
                    : "hover:bg-white/60 text-slate-500 bg-transparent"
                    }`}
                >
                  {/* Active Indicator (Desktop only) */}
                  {activeParent === parent.id && (
                    <motion.div
                      layoutId="active-pill"
                      className="hidden lg:block absolute left-0 w-1.5 h-8 bg-[#ff3d00] rounded-r-full"
                    />
                  )}

                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all duration-500 ${activeParent === parent.id ? "border-[#ff3d00] scale-110 shadow-lg" : "border-white"
                    }`}>
                    <img src={parent.image_url || "/placeholder.png"} className="w-full h-full object-cover" alt={parent.name} />
                  </div>

                  <div className="text-left">
                    <span className="font-black text-xs md:text-sm block tracking-tight uppercase whitespace-nowrap">{parent.name}</span>
                    <span className="hidden md:block text-[10px] font-bold text-slate-400 italic">Explore Items</span>
                  </div>

                  <ChevronRight size={18} className={`hidden lg:block ml-auto transition-transform duration-500 ${activeParent === parent.id ? "translate-x-1 opacity-100" : "opacity-0 -translate-x-2"
                    }`} />
                </button>
              ))}
            </nav>

            {/* --- MAIN CONTENT AREA --- */}
            <main className="flex-grow bg-white p-6 md:p-12">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeParent}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Sub-Header */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 md:mb-12">
                    <div>
                      <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight capitalize">
                        {currentParent?.name}
                      </h2>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-8 h-[2px] bg-orange-200" />
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
                          {activeSubCategories.length} Specialized Sub-Collections
                        </p>
                      </div>
                    </div>

                    {/* --- In AllCategoriesPage.tsx --- */}
                    <Link
                      href={`/customer/product-gallery?category=${activeParent}`}
                      className="group flex items-center justify-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-xl hover:bg-[#ff3d00] transition-all shadow-lg active:scale-95"
                    >
                      <span className="font-bold text-[10px] md:text-xs uppercase tracking-widest whitespace-nowrap">
                        See All Products
                      </span>
                      <ArrowUpRight size={18} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>

                  {/* Sub-Category Grid */}
                  {activeSubCategories.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-8">
                      {activeSubCategories.map((sub, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={sub.id}
                        >
                          <Link
                            href={`/customer/product-gallery?category=${activeParent}&subCategory=${sub.id}`}
                            className="group block relative"
                          > <div className="relative aspect-square rounded-[1.5rem] md:rounded-[2rem] overflow-hidden bg-slate-100 shadow-sm border border-slate-100 transition-all group-hover:shadow-2xl md:group-hover:-translate-y-2 duration-500">
                              <img
                                src={sub.image_url || "/placeholder.png"}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                alt={sub.name}
                              />
                              {/* Dark overlay for text readability */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity" />

                              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8">
                                <p className="hidden md:block text-white/60 text-[10px] font-black uppercase tracking-widest mb-1">Explore</p>
                                <h4 className="text-sm md:text-2xl font-bold text-white tracking-tight">{sub.name}</h4>
                              </div>

                              {/* Desktop Arrow Button */}
                              <div className="absolute top-4 right-4 md:top-6 md:right-6 w-8 h-8 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                                <ArrowRight size={18} />
                              </div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 md:py-32 border-2 border-dashed border-slate-100 rounded-[2rem] md:rounded-[3rem]">
                      <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <ShoppingBag size={32} className="text-slate-300" />
                      </div>
                      <h3 className="text-xs md:text-lg font-bold text-slate-400 uppercase tracking-widest">Collection Empty</h3>
                      <p className="text-slate-400 text-[10px] md:text-sm">Check back soon for new additions.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        )}
      </div>
      {/* Spacer for bottom mobile menu if you have one */}
      <div className="h-20 md:hidden" />
    </div>
  );
}