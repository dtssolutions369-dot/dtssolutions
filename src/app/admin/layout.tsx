"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";
import { LogOut } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/admin/dashboard" },
  { name: "Categories", path: "/admin/categories" },
  { name: "Pincodes", path: "/admin/pincodes" },
  { name: "Business Plans", path: "/admin/plans" },
  { name: "Businesses Approvals", path: "/admin/approvals" },
  { name: "Banners", path: "/admin/banners" },
  { name: "Complaints", path: "/admin/complaints" },
  { name: "Settings", path: "/admin/settings" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Find the current tab name based on the current URL path
  const currentTab = menuItems.find((item) => item.path === pathname)?.name || "Dashboard";

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/admin-login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fffcfb]">
      {/* Fixed Sidebar */}
      <AdminSidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* --- DYNAMIC HEADER --- */}
        <header className="h-20 bg-white border-b border-slate-100 sticky top-0 z-10 px-8 flex items-center justify-between shadow-sm">
          <div>
              <h1 className="text-xl font-bold text-[#ff3d00] uppercase  mt-1 capitalize">
              {currentTab}
            </h1>
            <h2 className="text-xs font-black  text-slate-900 tracking-widest leading-none">
             Manage your DTS platform
            </h2>
          
          </div>

          <div className="flex items-center">
            {/* Header Logout Button - Notifications Removed */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs hover:bg-[#ff3d00] transition-all shadow-lg shadow-slate-200"
            >
              <LogOut size={16} />
              LOGOUT
            </button>
          </div>
        </header>

        {/* Page Content - Uniform Padding (md removed) */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}