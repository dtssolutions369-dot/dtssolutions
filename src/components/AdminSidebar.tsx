"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation"; // Added useRouter
import { supabase } from "@/lib/supabaseClient"; // Import your supabase client
import { 
  LayoutDashboard, Box, MapPin, CreditCard, 
  CheckCircle, Store, Image as ImageIcon, 
  MessageSquare, Settings
} from "lucide-react";
import { motion } from "framer-motion";

const menuItems = [
  { name: "Dashboard", icon: <LayoutDashboard size={22} />, path: "/admin/dashboard" },
  { name: "Categories", icon: <Box size={22} />, path: "/admin/categories" },
  { name: "Pincodes", icon: <MapPin size={22} />, path: "/admin/pincodes" },
  { name: "Business Plans", icon: <CreditCard size={22} />, path: "/admin/plans" },
  { name: " Businesses Approvals", icon: <Store size={22} />, path: "/admin/approvals" },
 // { name: "Businesses", icon: <Store size={22} />, path: "/admin/businesses" },
  { name: "Banners", icon: <ImageIcon size={22} />, path: "/admin/banners" },
  { name: "Complaints", icon: <MessageSquare size={22} />, path: "/admin/complaints" },
 // { name: "Settings", icon: <Settings size={22} />, path: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();



  return (
    <div className="w-72 h-screen bg-[#ff3d00] flex flex-col text-white sticky top-0 left-0">
      {/* LOGO SECTION */}
      <div className="p-8 flex items-center gap-4">
        <div className="w-12 h-12 bg-black rounded-lg overflow-hidden flex-shrink-0 border border-white/20">
          <img 
            src="/logo.png" 
            alt="DTS Logo" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-xl font-black leading-none tracking-tight">DTS Admin</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Control Panel</p>
        </div>
      </div>

      {/* NAVIGATION ITEMS */}
      <nav className="flex-grow px-4 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <motion.div
                whileHover={{ x: 5 }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  isActive 
                    ? "bg-white text-[#ff3d00] shadow-xl" 
                    : "text-white hover:bg-white/10"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </motion.div>
            </Link>
          );
        })}

      </nav>

      {/* ADMIN USER FOOTER */}
      <div className="p-4 border-t border-white/10 bg-[#e63600]">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-black text-lg border-2 border-white/20">
            A
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-black truncate">Admin User</h4>
            <p className="text-[10px] font-bold opacity-70 truncate lowercase">admin@dts.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}