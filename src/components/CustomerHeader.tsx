"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Search, MapPin, Heart, User, Bell,
    ChevronDown, LogOut, Settings, UserCircle,
    Home, Shapes, ShoppingBag, Menu, X
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AuthModal from "@/components/AuthModal";

interface HeaderProps {
    location: { city: string; pincode: string; state?: string } | null;
    onLocationClick: () => void;
}

export default function CustomerHeader({ location, onLocationClick }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getInitialSession();

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) setIsAuthModalOpen(false);
        });

        return () => authListener.subscription.unsubscribe();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setShowDropdown(false);
        router.push("/customer/dashboard");
    };

    const navTabs = [
        { label: "Home", href: "/customer/dashboard", icon: <Home size={20} /> },
        { label: "Categories", href: "/customer/categories", icon: <Shapes size={20} /> },
        { label: "Products", href: "/customer/product-gallery", icon: <ShoppingBag size={20} /> },
    ];

    return (
        <>
            {/* TOP NAVBAR */}
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[60] border-b border-slate-100 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between">
                    
                    {/* LOGO & LOCATION */}
                    <div className="flex items-center gap-4 md:gap-10 lg:ml-40">
                        <Link href="/customer/dashboard" className="flex items-center">
                            <div className="relative w-28 h-8 md:w-56 md:h-20">
                                <Image src="/logo.png" alt="Logo" fill className="object-contain object-left scale-110" priority />
                            </div>
                        </Link>

                        {/* Desktop Location Only */}
                        <button onClick={onLocationClick} className="hidden xl:flex items-center gap-3 pl-8 border-l-2 border-slate-200 group text-left">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 group-hover:text-[#ff3d00] text-slate-400 transition-all">
                                <MapPin size={20} />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Serviceable At</p>
                                <div className="flex items-center gap-1 font-extrabold text-sm text-slate-800">
                                    {location ? location.city : "Select Location"} <ChevronDown size={14} />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* DESKTOP NAVIGATION */}
                    <div className="hidden lg:flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
                        {navTabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            return (
                                <Link key={tab.href} href={tab.href}
                                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${isActive ? "bg-white text-[#ff3d00] shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                                >
                                    {tab.icon} {tab.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* PROFILE & ACTIONS */}
                    <div className="flex items-center gap-2 md:gap-4">
                        {/* Desktop Wishlist Icon */}
                        <Link 
                            href="/customer/wishlist" 
                            className={`hidden md:flex p-3 rounded-2xl transition-all relative ${pathname === '/customer/wishlist' ? "bg-orange-50 text-[#ff3d00]" : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"}`}
                        >
                            <Heart size={24} fill={pathname === '/customer/wishlist' ? "currentColor" : "none"} />
                            {/* Visual indicator for "Saved" - You could later add a real count here */}
                            <span className="absolute top-2 right-2 w-2 h-2 bg-[#ff3d00] rounded-full border-2 border-white"></span>
                        </Link>

                         {/* Mobile Location Trigger (Icon only) */}
                         <button onClick={onLocationClick} className="xl:hidden p-2 text-slate-500 hover:text-[#ff3d00]">
                            <MapPin size={22} />
                        </button>

                        {user ? (
                            <div className="relative">
                                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center p-1 rounded-full border border-slate-200 bg-white shadow-sm hover:border-[#ff3d00] transition-colors">
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#ff3d00] flex items-center justify-center text-white overflow-hidden">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} className="w-full h-full object-cover" />
                                        ) : <User size={18} />}
                                    </div>
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border p-2 z-50">
                                        <div className="px-4 py-3 border-b text-xs font-bold text-slate-800 truncate">{user.email}</div>
                                       
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-bold text-sm transition-colors">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button onClick={() => setIsAuthModalOpen(true)} className="bg-slate-900 text-white px-5 py-2 md:px-7 md:py-3 rounded-xl font-bold text-xs md:text-sm hover:bg-[#ff3d00] transition-colors shadow-lg shadow-slate-200">
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* BOTTOM MOBILE MENU */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                {navTabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link key={tab.href} href={tab.href} 
                            className={`flex flex-col items-center gap-1 transition-all ${isActive ? "text-[#ff3d00]" : "text-slate-400"}`}
                        >
                            <div className={`p-1 rounded-xl transition-all ${isActive ? "bg-orange-50 scale-110" : ""}`}>
                                {tab.icon}
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{tab.label}</span>
                        </Link>
                    );
                })}
                <Link href="/customer/wishlist" className={`flex flex-col items-center gap-1 ${pathname === '/customer/wishlist' ? "text-[#ff3d00]" : "text-slate-400"}`}>
                    <div className={`p-1 rounded-xl transition-all ${pathname === '/customer/wishlist' ? "bg-orange-50 scale-110" : ""}`}>
                        <Heart size={20} fill={pathname === '/customer/wishlist' ? "currentColor" : "none"} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Saved</span>
                </Link>
            </div>

            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
            
            <div className="h-20 lg:hidden" />
        </>
    );
}