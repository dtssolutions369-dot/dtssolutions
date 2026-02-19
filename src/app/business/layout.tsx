"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Sidebar from "@/components/BusinessSidebar";
import { LogOut, User, Mail, Shield } from "lucide-react";

const businessMenuItems = [
  { name: "Dashboard", path: "/business/dashboard" },
  { name: "Products Gallery", path: "/business/products" },
  { name: "Order History", path: "/business/orders" },
  { name: "Business Profile", path: "/business/profile" },
  { name: "Subscription", path: "/business/subscription" },
];

export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>("");

  useEffect(() => {
    // Get the logged-in user's email
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || "Guest User");
    };
    getUser();
  }, []);

  const currentTab = businessMenuItems.find((item) => item.path === pathname)?.name || "Storefront";

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/businessregister");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* 1. STICKY SIDEBAR CONTAINER */}
      <aside className="sticky top-0 h-screen hidden md:block border-r border-slate-200 bg-white z-50">
        <div className="h-full flex flex-col justify-between">
          <Sidebar />

          {/* USER EMAIL CARD (Bottom of Sidebar) */}
          <div className="p-4 border-t border-white/10 bg-[#e63600]">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm">
          <div className="w-8 h-8 rounded-full bg-[#ff3d00] flex items-center justify-center text-white">
                <User size={14} strokeWidth={3} />
              </div>
              <div className="overflow-hidden">
                <p className="text-[9px] font-black text-white uppercase tracking-widest">Active Store</p>
                <p className="text-[10px] font-bold opacity-70 truncate lowercase">{userEmail}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* STICKY HEADER */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Trigger could go here */}
            <div>
              <h1 className="text-2xl font-black text-[#ff3d00] tracking-tight mt-0.5 ">
                {currentTab}
              </h1>
              <h2 className="text-xs font-black  text-slate-900 tracking-widest leading-none">
                Manage your DTS platform
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-6">
             <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[11px] tracking-widest hover:bg-[#ff3d00] transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 lg:p-10">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}