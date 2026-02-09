"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Users,
  Store,
  Truck,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  LayoutGrid,
  Image as ImageIcon,
  UserPlus,
  ArrowUpRight,
  LogOut,
  Search
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function AdminDashboard() {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalVendors, setTotalVendors] = useState(0);
  const [totalTransport, setTotalTransport] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCounts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/count-users");
      const userData = await res.json();
      setTotalCustomers(userData.totalCustomers || 0);

      const { count: vendors, error: vendorError } = await supabase
        .from("vendor_register")
        .select("*", { count: "exact", head: true });

      if (vendorError) throw vendorError;
      setTotalVendors(vendors || 0);

      const { count: transport, error: transportError } = await supabase
        .from("travel_requests")
        .select("*", { count: "exact", head: true });

      if (transportError) throw transportError;
      setTotalTransport(transport || 0);
    } catch (error) {
      console.error("Dashboard Count Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();
  }, []);

  const stats = [
    { label: "Total Customers", val: totalCustomers, link: "/admin/customers", desc: "Active Accounts", Icon: Users },
    { label: "Partner Vendors", val: totalVendors, link: "/admin/vendors", desc: "Registered Entities", Icon: Store },
    { label: "Transit Requests", val: totalTransport, link: "/admin/transportation", desc: "Logistics Data", Icon: Truck }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-10 selection:bg-slate-200">
      
      {/* --- TOP NAV BAR --- */}
      <nav className="bg-white px-6 md:px-10 py-4 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-8">
          <div className="font-black tracking-tighter text-xl uppercase italic">Qick<span className="text-slate-400">Tick</span></div>
          <div className="hidden md:flex relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search terminal..." 
              className="bg-slate-50 border border-slate-100 rounded-full py-2 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-slate-200 w-64"
            />
          </div>
        </div>
        <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-600 transition-colors">
          Terminate Session <LogOut size={16} />
        </button>
      </nav>

      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-16 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-50/50 backdrop-blur-md border border-slate-200/60 rounded-[2.5rem] p-8 md:p-10 mb-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-slate-200 rounded-full shadow-sm">
                  <ShieldCheck className="text-slate-900" size={14} />
                  <span className="text-slate-900 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Secure Administrative Terminal
                  </span>
                </div>

                <div>
                  <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tighter leading-none mb-2">
                    Overview <span className="font-semibold text-slate-400">Panel</span>
                  </h1>
                  <p className="text-slate-500 text-sm max-w-md leading-relaxed font-medium opacity-80">
                    Real-time operational intelligence and logistics management.
                  </p>
                </div>
              </div>

              <button
                onClick={fetchCounts}
                disabled={loading}
                className="group h-16 bg-slate-900 hover:bg-black text-white flex items-center gap-4 px-10 rounded-[1.25rem] transition-all shadow-lg active:scale-95 font-bold text-[11px] uppercase tracking-[0.15em]"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
                {loading ? "Syncing..." : "Refresh Console"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CORE METRICS SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-20 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
            >
              <div className="flex justify-between items-center mb-6">
                {/* ICON BOX: Icon remains black even on hover */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all duration-300 group-hover:bg-slate-100">
                   <stat.Icon 
                    size={24} 
                    className="text-black" 
                   />
                </div>
                <ArrowUpRight className="text-slate-200 group-hover:text-slate-400 transition-colors" size={24} />
              </div>

              <div className="space-y-1">
                <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</h2>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-semibold text-slate-900 tracking-tighter">{stat.val}</p>
                  <span className="text-[10px] font-black text-emerald-500 uppercase">{stat.desc}</span>
                </div>
              </div>

              <Link href={stat.link} className="mt-6 flex items-center justify-between px-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-900 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                Enter Database <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* --- OPERATIONS GRID --- */}
        <div className="bg-white rounded-[3rem] border border-slate-100 p-2 shadow-sm">
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-6 w-1 bg-slate-900 rounded-full" />
              <h3 className="text-lg font-bold text-slate-900 uppercase tracking-tight">System Operations</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Manage Categories", href: "/admin/category", Icon: LayoutGrid },
                { name: "Website Banners", href: "/admin/site-home/digital-banner", Icon: ImageIcon },
                { name: "Payment Tracking", href: "/admin/payment-tracking", Icon: CreditCard },
                { name: "Sub Admin Panel", href: "/admin/subadmins", Icon: UserPlus },
              ].map((task) => (
                <Link key={task.name} href={task.href} className="group p-8 bg-white border border-slate-50 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:border-slate-900 hover:shadow-lg active:scale-95 shadow-sm">
                  <div className="mb-4 w-14 h-14 flex items-center justify-center bg-slate-50 rounded-2xl transition-all duration-300">
                    <task.Icon size={22} className="text-black" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-900 transition-colors">
                    {task.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}