"use client";

import Link from "next/link";
import { ArrowRight, Building2, Store, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#fffcfb] font-sans">
      {/* Simple Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white">
            <Store size={24} />
          </div>
        </div>
        
        {/* Navigation to Business Register/Login */}
        <Link 
          href="/businessregister" 
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-orange-600 transition-all shadow-lg shadow-slate-100 flex items-center gap-2"
        >
          Business Portal <ArrowRight size={18} />
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest">
              <ShieldCheck size={14} /> Trusted by 500+ Businesses
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 leading-[1.1] tracking-tight">
              Manage your <br />
              <span className="text-orange-500">Shop Smarter.</span>
            </h1>
            
            <p className="text-lg text-slate-500 font-medium max-w-lg leading-relaxed">
              The ultimate platform for inventory, analytics, and business growth. 
              Start your 45-day premium trial today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/businessregister" 
                className="bg-orange-500 text-white px-10 py-5 rounded-[2rem] font-bold text-lg hover:bg-orange-600 transition-all shadow-xl shadow-orange-100 flex items-center justify-center gap-3"
              >
                Register Shop <ArrowRight />
              </Link>
              
              <Link 
                href="/businessregister" 
                className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-[2rem] font-bold text-lg hover:border-orange-500 transition-all flex items-center justify-center gap-3"
              >
                Owner Login
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* Decorative element to represent the dashboard */}
            <div className="bg-orange-400 aspect-square rounded-[3rem] rotate-3 relative overflow-hidden shadow-2xl">
                <div className="absolute inset-4 bg-white rounded-[2rem] -rotate-3 p-8 flex flex-col justify-between">
                    <div className="space-y-4">
                        <div className="w-1/2 h-4 bg-slate-100 rounded-full" />
                        <div className="w-3/4 h-4 bg-slate-50 rounded-full" />
                    </div>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl" />
                        <div className="w-12 h-12 bg-blue-100 rounded-xl" />
                        <div className="w-12 h-12 bg-green-100 rounded-xl" />
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}