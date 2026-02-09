"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiOutlineVideoCamera, HiOutlineHome, HiOutlineOfficeBuilding,
  HiOutlineClipboardList, HiOutlineLogout, HiOutlinePhotograph,
  HiOutlineTemplate, HiOutlineShieldCheck, HiOutlineChatAlt2
} from "react-icons/hi";
import { FaUserTie, FaUserFriends, FaTruckMoving, FaPodcast } from "react-icons/fa";

export default function AdminSidebar() {
  const [role, setRole] = useState<"admin" | "subadmin" | "loading">("loading");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("user_role");
    setRole((savedRole as any) || "admin");
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/adminlogin");
  };

  if (role === "loading") {
    return <aside className="w-72 h-screen bg-white border-r border-slate-200 animate-pulse" />;
  }

  const isActive = (path: string) => pathname === path;

  const NavLink = ({ href, icon: Icon, children }: any) => {
    const active = isActive(href);
    return (
      <Link href={href} className="block px-4 mb-1 group">
        <div className={`
          flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative
          ${active
            ? "bg-slate-900 text-white shadow-lg shadow-slate-200" 
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
        `}>
          <Icon size={20} className={`transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
          <span className={`text-sm font-medium ${active ? "font-bold" : ""}`}>
            {children}
          </span>
          {/* Replaced yellow indicator with a subtle white/slate dot */}
          {active && (
            <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white/30" />
          )}
        </div>
      </Link>
    );
  };

  return (
    <aside className="w-72 h-screen bg-white flex flex-col sticky top-0 border-r border-slate-200 shadow-sm overflow-hidden">

      {/* 1. HEADER SECTION */}
      <div className="flex-none p-6 space-y-6 bg-white z-10">
        <div className="flex justify-start">
          <Image
            src="/logo.png"
            alt="Logo"
            width={130}
            height={40}
            priority
            className="contrast-125 brightness-0" // Makes logo black to match theme
          />
        </div>

        {/* Replaced Yellow Badge with Slate-900 */}
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-900 flex-none flex items-center justify-center text-white font-bold shadow-sm">
            {role[0].toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">System Role</p>
            <p className="text-sm font-bold text-slate-800 truncate uppercase">{role} Access</p>
          </div>
        </div>
      </div>

      <div className="h-px bg-slate-100 mx-6 flex-none" />

      {/* 2. SCROLLABLE NAVIGATION */}
      <div className="flex-1 overflow-y-auto no-scrollbar py-4">
        <Section title="Main Menu">
          <NavLink href="/admin/dashboard" icon={HiOutlineHome}>Overview</NavLink>
          <NavLink href="/admin/category" icon={HiOutlineOfficeBuilding}>Categories</NavLink>
          {role === "admin" && (
            <NavLink href="/admin/plans" icon={HiOutlineClipboardList}>Subscription</NavLink>
          )}
        </Section>

        <Section title="Marketing">
          <NavLink href="/admin/site-home/digital-branding" icon={HiOutlineTemplate}>Branding Reels</NavLink>
          <NavLink href="/admin/site-home/digital-banner" icon={HiOutlinePhotograph}>Site Banners</NavLink>
        </Section>

        <Section title="Media Content">
          <NavLink href="/admin/site-home/videos" icon={HiOutlineVideoCamera}>Videos</NavLink>
        </Section>

        <Section title="Operations">
          {role === "admin" && <NavLink href="/admin/customers" icon={FaUserFriends}>Customers</NavLink>}
          <NavLink href="/admin/vendors" icon={FaUserTie}>Vendors</NavLink>
          <NavLink href="/admin/enquiry" icon={HiOutlineChatAlt2}>Inquiries</NavLink>
        </Section>
      </div>

      {/* 3. PINNED LOGOUT FOOTER */}
      <div className="flex-none p-6 border-t border-slate-100 bg-white z-20">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center justify-center gap-3 h-12 rounded-xl transition-all duration-300 border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100"
        >
          <HiOutlineLogout size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold text-xs uppercase tracking-widest">Sign Out</span>
        </button>
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </aside>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="px-8 text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}