"use client";

import React from "react";
import { ShoppingBag } from "lucide-react";

export default function EmptyState({ onReset }: { onReset: () => void }) {
    return (
        <div className="py-32 text-center bg-white rounded-[4rem] border border-slate-100 px-10 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="text-slate-200" size={40} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tighter">Nothing found.</h3>
            <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-tight">Try adjusting your filters to find what you need</p>
            <button 
                onClick={onReset} 
                className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ff3d00] transition-all active:scale-95 shadow-lg"
            >
                Reset Filters
            </button>
        </div>
    );
}