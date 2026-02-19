"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Users, Store, Clock, AlertCircle, 
  TrendingUp, CheckCircle2, Box, 
  ChevronRight, ArrowUpRight, Activity
} from "lucide-react";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalBusinesses: 0,
    pendingApprovals: 0,
    activeTrials: 0,
    totalProducts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGlobalStats();
  }, []);

  const fetchGlobalStats = async () => {
    try {
      setLoading(true);
      const { data: businesses } = await supabase.from("business_profiles").select("is_approved");
      const { count: productCount } = await supabase.from("products").select('*', { count: 'exact', head: true });

      const pending = businesses?.filter(b => !b.is_approved).length || 0;

      setStats({
        totalBusinesses: businesses?.length || 0,
        pendingApprovals: pending,
        activeTrials: businesses?.filter(b => b.is_approved).length || 0,
        totalProducts: productCount || 0
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900">
      <div className="max-w-[1600px] mx-auto space-y-10">
        
        {/* TOP BAR / HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">System Live</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Command Center</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-black text-slate-400 uppercase">Last Sync</p>
              <p className="text-xs font-bold text-slate-600">Just now</p>
            </div>
            <button 
              onClick={fetchGlobalStats}
              className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all shadow-sm"
            >
              <Activity size={20} className="text-slate-600" />
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard 
            label="Total Partners" 
            value={stats.totalBusinesses} 
            icon={<Store size={24} />} 
            color="blue"
            trend="+5.2%"
          />
          <DashboardCard 
            label="Verification" 
            value={stats.pendingApprovals} 
            icon={<Clock size={24} />} 
            color="orange"
            warning={stats.pendingApprovals > 0}
          />
          <DashboardCard 
            label="Inventory" 
            value={stats.totalProducts} 
            icon={<Box size={24} />} 
            color="purple"
            trend="+124"
          />
          <DashboardCard 
            label="Live Tiers" 
            value={stats.activeTrials} 
            icon={<CheckCircle2 size={24} />} 
            color="green"
          />
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* NEEDS ATTENTION SECTION */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="text-orange-600" size={20} />
                  </div>
                  Critical Actions
                </h3>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {stats.pendingApprovals} Issues
                </span>
              </div>
              
              {stats.pendingApprovals > 0 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-slate-50 border border-slate-100 p-6 rounded-[2rem] flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-orange-200 transition-all"
                >
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
                       <Users className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-black text-slate-900">Pending Business Approvals</p>
                      <p className="text-sm text-slate-500 font-medium">Verification required for {stats.pendingApprovals} new outlets.</p>
                    </div>
                  </div>
                  <button className="w-full sm:w-auto bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all flex items-center justify-center gap-2">
                    Review Queue <ChevronRight size={16} />
                  </button>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">All Systems Nominal</p>
                </div>
              )}
            </div>
          </div>

          {/* QUICK LINKS / SYSTEM INFO */}
          <div className="space-y-6">
            <div className="bg-slate-400 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                  <h4 className="text-lg font-black mb-2 italic">Pro Tip</h4>
                  <p className="text-white text-sm leading-relaxed font-medium mb-6">
                    You can manage subscription pricing and benefits in the Tiers tab.
                  </p>
                  <button className="flex items-center gap-2 text-[#ff3d00] font-black text-[10px] uppercase tracking-widest hover:translate-x-2 transition-transform">
                    Go to Plans <ArrowUpRight size={14} />
                  </button>
               </div>
               <div className="absolute top-[-20%] right-[-20%] w-40 h-40 bg-[#ff3d00]/10 rounded-full blur-3xl" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, icon, trend, warning, color }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50",
    orange: "text-orange-600 bg-orange-50",
    purple: "text-purple-600 bg-purple-50",
    green: "text-green-600 bg-green-50"
  };

  return (
    <motion.div 
      whileHover={{ y: -5, shadow: "0 20px 40px rgba(0,0,0,0.04)" }}
      className={`bg-white p-8 rounded-[2.5rem] border-2 transition-all ${
        warning ? 'border-orange-200' : 'border-white shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`p-4 rounded-2xl ${colorMap[color] || 'bg-slate-50'}`}>
          {icon}
        </div>
        {trend && (
          <div className="flex items-center gap-1 text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full">
            <TrendingUp size={12} /> {trend}
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter mt-1">{value}</p>
      </div>
    </motion.div>
  );
}