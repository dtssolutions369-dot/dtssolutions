"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Phone,
  Building2,
  Search,
  Award,
  Gem,
  Factory,
  Mail,
  Zap,
  Activity,
  ArrowRight,
  Filter,
  ChevronRight,
  ChevronLeft,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServiceCategoryPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [vendors, setVendors] = useState<any[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      const { data: cat } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single();

      if (cat?.name) setCategoryName(cat.name);

      const { data: vendorData, error } = await supabase
        .from("vendor_register")
        .select("*")
        .eq("status", "approved")
        .or(`categories.ilike.%${id}%,categories.ilike.%${cat?.name}%`);

      if (!error && vendorData) {
        setVendors(vendorData);
      }
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const filteredVendors = vendors.filter((v) =>
    v.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getPlanStyles = (plan: string) => {
    const p = plan?.toLowerCase() || "";
    if (p.includes("diamond"))
      return { color: "text-cyan-500", bg: "bg-cyan-500/10", icon: <Gem size={18} /> };
    if (p.includes("gold"))
      return { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: <Award size={18} /> };
    return { color: "text-[#74cb01]", bg: "bg-[#74cb01]/10", icon: <Zap size={18} /> };
  };

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
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Professional Network</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              {categoryName || "Industrial"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Directory.</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Access the most comprehensive hub of verified industrial experts and digital creators in this category.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#00AEEF]/40 transition-all"
            >
              <ChevronLeft size={20} className="text-[#00AEEF]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Navigation</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">Back to Categories</span>
              </div>
            </button>

            {/* Search Input */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 focus-within:border-[#F26522]/40 transition-all">
              <Search size={20} className="text-[#F26522]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Search</label>
                <input 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company name..."
                  className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-slate-600 w-full mt-0.5"
                />
              </div>
            </div>

            {/* Stats Display */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5">
              <Factory size={20} className="text-[#74cb01]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Vendors</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">{vendors.length}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- VENDOR GRID --- */}
      <div className="max-w-7xl mx-auto px-6 mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => {
                const style = getPlanStyles(vendor.subscription_plan || "basic");

                return (
                  <motion.div
                    key={vendor.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="group bg-white rounded-[2.5rem] border border-slate-100 hover:border-[#74cb01] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
                  >
                    {/* Visual Header */}
                    <div className="relative h-48 bg-slate-50 overflow-hidden border-b border-slate-100">
                       <div className="absolute inset-0 opacity-10 group-hover:scale-110 transition-transform duration-700 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
                       
                       <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                          <div className="w-14 h-14 rounded-2xl bg-white shadow-md p-2 flex items-center justify-center border border-slate-50">
                            {vendor.company_logo ? (
                              <img src={vendor.company_logo} alt="logo" className="w-full h-full object-contain" />
                            ) : (
                              <Building2 className="text-slate-200" size={24} />
                            )}
                          </div>
                          <div className={`${style.bg} ${style.color} p-2.5 rounded-xl border border-white/50 backdrop-blur-sm`}>
                            {style.icon}
                          </div>
                       </div>

                       {/* Animated Tag matching your Banners design */}
                       <div className="absolute bottom-4 left-4">
                          <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-2">
                             <div className="w-1.5 h-1.5 rounded-full bg-[#74cb01] animate-pulse" />
                             <span className="text-[8px] font-black text-white uppercase tracking-widest">Active Vendor</span>
                          </div>
                       </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex-1">
                      <h2 className="text-xl font-black text-slate-900 mb-2 group-hover:text-[#74cb01] transition-colors tracking-tighter uppercase line-clamp-1">
                        {vendor.company_name}
                      </h2>
                      
                      <div className="flex items-center gap-2 text-slate-400 mb-6">
                        <MapPin size={12} className="text-[#74cb01]" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          {vendor.city}, {vendor.state}
                        </span>
                      </div>

                      {/* Info Row */}
                      <div className="grid grid-cols-2 gap-2 mt-auto">
                        <a href={`tel:${vendor.mobile_number}`} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl border border-slate-100 transition-all">
                           <Phone size={14} className="text-slate-900" />
                           <span className="text-[9px] font-black uppercase text-slate-900">Call</span>
                        </a>
                        <a href={`mailto:${vendor.email}`} className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 py-3 rounded-xl border border-slate-100 transition-all">
                           <Mail size={14} className="text-slate-900" />
                           <span className="text-[9px] font-black uppercase text-slate-900">Email</span>
                        </a>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <button
                      onClick={() => router.push(`/vendor/view/${vendor.id}`)}
                      className="m-4 mt-0 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-2 hover:bg-[#74cb01] transition-all shadow-lg active:scale-95"
                    >
                      Explore Profile <ChevronRight size={14} />
                    </button>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-32 flex flex-col items-center justify-center">
                <div className="bg-white p-12 rounded-[4rem] border border-slate-100 text-center shadow-sm">
                  <Search size={48} className="mx-auto text-slate-100 mb-4" />
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">No Experts Found</h3>
                  <p className="text-slate-400 font-bold uppercase text-[9px] tracking-[0.2em] mt-2">Try a different search term</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}