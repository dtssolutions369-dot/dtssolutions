"use client";

import React, { useEffect, useState } from "react";
import { 
  SlidersHorizontal, 
  RotateCcw, 
  Store, 
  ChevronRight, 
  Check,
  IndianRupee,
  LayoutGrid,
  X,
  Filter
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface Category {
  id: string;
  name: string;
  parent_id: string | null;
}

interface FilterProps {
  selectedSort: string;
  onSortChange: (value: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  selectedBusinessType: string;
  onBusinessTypeChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (id: string) => void;
  selectedSubCategory: string;
  onSubCategoryChange: (id: string) => void;
  onReset: () => void;
}

export default function ProductFilters(props: FilterProps) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from("categories").select("id, name, parent_id");
      if (data) setAllCategories(data);
    };
    fetchCategories();
  }, []);

  const businessTypes = ["Wholesaler", "Dealer", "Sub-Dealer", "Retailer"];
  const parentCategories = allCategories.filter(cat => !cat.parent_id);
  const getSubCategories = (parentId: string) => allCategories.filter(cat => cat.parent_id === parentId);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Business Type Chips */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
          <Store size={14} /> Business Type
        </label>
        <div className="flex flex-wrap gap-2">
          {businessTypes.map((type) => (
            <button
              key={type}
              onClick={() => props.onBusinessTypeChange(props.selectedBusinessType === type ? "" : type)}
              className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all border ${
                props.selectedBusinessType === type 
                ? "bg-[#ff3d00] border-[#ff3d00] text-white shadow-lg shadow-orange-200" 
                : "bg-slate-50 border-slate-100 text-slate-600 hover:border-slate-300"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div>
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
          <LayoutGrid size={14} /> Browse Categories
        </label>
        <div className="space-y-2">
          {parentCategories.map((cat) => {
            const isParentSelected = props.selectedCategory === cat.id;
            const subs = getSubCategories(cat.id);
            
            return (
              <div key={cat.id} className="relative overflow-hidden">
                <button
                  onClick={() => {
                    props.onCategoryChange(isParentSelected ? "" : cat.id);
                    props.onSubCategoryChange("");
                  }}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${
                    isParentSelected ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span className="text-xs font-bold">{cat.name}</span>
                  <ChevronRight size={14} className={`transition-transform duration-300 ${isParentSelected ? 'rotate-90' : ''}`} />
                </button>

                <AnimatePresence>
                  {isParentSelected && subs.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-slate-50 rounded-b-2xl -mt-2 pt-4 pb-2 px-2"
                    >
                      {subs.map((sub) => {
                        const isSubSelected = props.selectedSubCategory === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => props.onSubCategoryChange(isSubSelected ? "" : sub.id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-[11px] font-semibold transition-all mb-1 ${
                              isSubSelected 
                              ? "bg-white text-[#ff3d00] shadow-sm ring-1 ring-orange-100" 
                              : "text-slate-500 hover:text-slate-900"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {isSubSelected && <div className="w-1 h-1 rounded-full bg-[#ff3d00]" />}
                              {sub.name}
                            </span>
                            {isSubSelected && <Check size={12} />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget Range */}
      <div className="pt-6 border-t border-slate-100">
        <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 mb-6">
          <IndianRupee size={14} /> Price Range
        </label>
        <div className="px-2 pb-6">
          <div className="flex justify-between mb-4">
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
              <p className="text-[9px] text-slate-400 font-bold uppercase">Max Price</p>
              <p className="text-xs font-black text-slate-900">₹{props.priceRange[1].toLocaleString()}</p>
            </div>
          </div>
          <input 
            type="range" 
            min="0" max="50000" step="500"
            value={props.priceRange[1]}
            onChange={(e) => props.onPriceChange([props.priceRange[0], parseInt(e.target.value)])}
            className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#ff3d00]"
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-transform"
        >
          <Filter size={18} />
          <span className="text-xs font-black uppercase tracking-widest">Filter Products</span>
        </button>
      </div>

      <aside className="hidden lg:block w-full max-w-[320px] sticky top-6">
        <div className="bg-white/80 backdrop-blur-xl border border-white rounded-[2.5rem] p-6 shadow-2xl shadow-slate-200/60">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                <SlidersHorizontal size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Filters</h2>
            </div>
            <button onClick={props.onReset} className="p-2 hover:bg-orange-50 rounded-xl text-slate-400 hover:text-[#ff3d00] transition-all">
              <RotateCcw size={18} />
            </button>
          </div>
          <FilterContent />
        </div>
      </aside>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[3rem] z-[70] lg:hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8 pb-32">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tighter">Filters</h2>
                  <button onClick={() => setIsOpen(false)} className="p-3 bg-slate-50 rounded-2xl">
                    <X size={20} />
                  </button>
                </div>
                <FilterContent />
                <div className="fixed bottom-0 inset-x-0 p-6 bg-gradient-to-t from-white via-white to-transparent">
                  <div className="flex gap-3">
                    <button 
                      onClick={() => { props.onReset(); setIsOpen(false); }}
                      className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest"
                    >
                      Reset
                    </button>
                    <button 
                      onClick={() => setIsOpen(false)}
                      className="flex-[2] bg-[#ff3d00] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-orange-200"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}