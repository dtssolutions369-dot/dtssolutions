"use client";

import React from "react";
import { SlidersHorizontal, RotateCcw, Store } from "lucide-react";

interface FilterProps {
  selectedSort: string;
  onSortChange: (value: string) => void;
  priceRange: [number, number];
  onPriceChange: (range: [number, number]) => void;
  onReset: () => void;
}

export default function ProductFilters({
  selectedSort,
  onSortChange,
  priceRange,
  onPriceChange,
  onReset
}: FilterProps) {
  
  const sortOptions = [
    { label: "Most Relevant", value: "relevance" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Newest Arrivals", value: "newest" },
  ];

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-xl shadow-slate-200/40 border border-slate-100 w-full sticky top-10">
      
      {/* Tightened Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={16} className="text-[#ff3d00]" />
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Refine</h2>
        </div>
        
        <button 
          onClick={onReset}
          className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#ff3d00] transition-colors"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* Sort By Section - More Compact Grid */}
      <div className="space-y-3 mb-8">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Sort Results</h3>
        <div className="grid grid-cols-1 gap-2">
          {sortOptions.map((option) => (
            <label 
              key={option.value} 
              className={`
                flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all border
                ${selectedSort === option.value 
                  ? "border-[#ff3d00] bg-orange-50/30" 
                  : "border-slate-100 bg-white hover:border-slate-200"}
              `}
            >
              <span className={`text-[11px] font-bold ${selectedSort === option.value ? 'text-[#ff3d00]' : 'text-slate-600'}`}>
                {option.label}
              </span>
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={selectedSort === option.value}
                onChange={(e) => onSortChange(e.target.value)}
                className="hidden"
              />
              {selectedSort === option.value && <div className="w-1.5 h-1.5 bg-[#ff3d00] rounded-full" />}
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Section - Combined View */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Price Budget</h3>
        
        <div className="bg-slate-50/80 rounded-2xl p-4 space-y-6">
          {/* Min Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400">Min</span>
              <span className="text-slate-900">₹{priceRange[0].toLocaleString()}</span>
            </div>
            <input 
              type="range" min="0" max="25000" step="100"
              value={priceRange[0]}
              onChange={(e) => onPriceChange([Math.min(parseInt(e.target.value), priceRange[1] - 100), priceRange[1]])}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ff3d00]"
            />
          </div>

          {/* Max Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold">
              <span className="text-slate-400">Max</span>
              <span className="text-slate-900">₹{priceRange[1].toLocaleString()}</span>
            </div>
            <input 
              type="range" min="0" max="50000" step="500"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 100)])}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#ff3d00]"
            />
          </div>
        </div>

        {/* Quick Range Chips - Smaller */}
        <div className="flex flex-wrap gap-1.5 pt-2">
           {[5000, 10000].map((val) => (
             <button
               key={val}
               onClick={() => onPriceChange([0, val])}
               className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[9px] font-bold text-slate-500 hover:border-orange-200 hover:text-[#ff3d00] transition-all"
             >
               Under ₹{val/1000}k
             </button>
           ))}
        </div>
      </div>
    </div>
  );
}