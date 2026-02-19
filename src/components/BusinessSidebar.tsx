"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  LayoutGrid, 
  ShoppingBag, 
  Store, 
  BarChart3, 
  CreditCard, 
  LogOut 
} from "lucide-react";

interface SidebarProps {
  userEmail?: string;
  userName?: string;
}

const Sidebar = ({ userEmail = "abc@gmail.com", userName = "abc" }: SidebarProps) => {
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutGrid size={22} />, path: "/business/dashboard" },
    { name: "Products", icon: <ShoppingBag size={22} />, path: "/business/products" },
    { name: "Business Profile", icon: <Store size={22} />, path: "/business/profile" },
 //   { name: "Analytics", icon: <BarChart3 size={22} />, path: "/business/analytics" },
    { name: "Plans", icon: <CreditCard size={22} />, path: "/business/plans" },
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Redirect to login
  };

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
          <h2 className="text-xl font-black leading-none tracking-tight">DTS Business</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">Control Panel</p>
        </div>
      </div>

      {/* Navigation Links */}
     <nav className="flex-grow px-4 space-y-1 mt-4 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.name}
              href={item.path}
             className={`flex items-center gap-4 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all ${
                  isActive 
                    ? "bg-white text-[#ff3d00] shadow-xl" 
                    : "text-white hover:bg-white/10"
                }`}
            >
                {item.icon}
              <span className="font-medium text-[15px]">{item.name}</span>
            </Link>
          );
        })}
      </nav>


    </div>
  );
};

export default Sidebar;