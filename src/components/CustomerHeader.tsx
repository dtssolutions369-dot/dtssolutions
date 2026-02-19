"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    Search, MapPin, Heart, User, Bell,
    ChevronDown, LogOut, Settings, UserCircle,
    Home, Shapes, ShoppingBag
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import AuthModal from "@/components/AuthModal"; // Import your AuthModal

interface HeaderProps {
    location: { city: string; pincode: string; state?: string } | null;
    onLocationClick: () => void;
}

export default function CustomerHeader({ location, onLocationClick }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<any>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); // Local state for Modal

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user ?? null);
        };
        getInitialSession();

        // Listen for auth changes (login/logout)
        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) setIsAuthModalOpen(false); // Auto-close modal on login
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setShowDropdown(false);
        router.push("/customer/dashboard");
        router.refresh();
    };

    const navTabs = [
        { label: "Home", href: "/customer/dashboard", icon: <Home size={18} strokeWidth={2.5} /> },
        { label: "Categories", href: "/customer/categories", icon: <Shapes size={18} strokeWidth={2.5} /> },
        { label: "Products", href: "/customer/product-gallery", icon: <ShoppingBag size={18} strokeWidth={2.5} /> },
    ];

    return (
        <>
            <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-[60] border-b border-slate-100 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-6 h-24 flex items-center justify-between gap-8">

                    {/* LOGO & LOCATION */}
                    <div className="flex items-center gap-10 ml-40"> {/* Added ml-8 to push everything from the left edge */}
                        <Link href="/customer/dashboard" className="flex items-center hover:opacity-90 transition-opacity">
                            {/* Increased width from w-40 (160px) to w-56 (224px) 
            Increased height from h-14 (56px) to h-20 (80px) 
        */}
                            <div className="relative w-56 h-20">
                                <Image
                                    src="/logo.png"
                                    alt="Logo"
                                    fill
                                    className="object-contain object-left scale-110" // Added slight scale for extra pop
                                    priority
                                />
                            </div>
                        </Link>

                        <button onClick={onLocationClick} className="hidden xl:flex items-center gap-3 pl-8 border-l-2 border-slate-200 group">
                            <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-orange-50 group-hover:text-[#ff3d00] text-slate-400 transition-all">
                                <MapPin size={20} /> {/* Slightly larger icon to match larger logo */}
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] leading-none mb-1.5">Serviceable At</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-extrabold text-sm text-slate-800 whitespace-nowrap">
                                        {location ? `${location.city}, ${location.pincode}` : "Select Location"}
                                    </span>
                                    <ChevronDown size={14} className="text-slate-400 group-hover:text-[#ff3d00] transition-colors" />
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* NAVIGATION TABS */}
                    <div className="hidden lg:flex items-center bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
                        {navTabs.map((tab) => {
                            const isActive = pathname === tab.href;
                            return (
                                <Link key={tab.href} href={tab.href}
                                    className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-200 ${isActive ? "bg-white text-[#ff3d00] shadow-sm ring-1 ring-black/5" : "text-slate-500 hover:text-slate-900"
                                        }`}
                                >
                                    <span className={isActive ? "text-[#ff3d00]" : "text-slate-400"}>{tab.icon}</span>
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>


                    {/* ACTIONS */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <Link href="/customer/wishlist"><IconButton icon={<Heart size={22} />} /></Link>
                        </div>

                        <div className="h-10 w-[1px] bg-slate-200 mx-1 hidden md:block" />

                        {user ? (
                            <div className="relative">
                                <button onClick={() => setShowDropdown(!showDropdown)} className="flex items-center gap-2 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#ff3d00] to-orange-400 flex items-center justify-center text-white">
                                        <User size={18} strokeWidth={3} />
                                    </div>
                                    <ChevronDown size={14} className={`text-slate-500 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Signed in as</p>
                                            <p className="text-xs font-bold text-slate-800 truncate">{user.email}</p>
                                        </div>
                                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold">
                                            <LogOut size={18} /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-slate-900 text-white px-7 py-3 rounded-xl font-bold text-sm hover:bg-orange-600 transition-all shadow-md"
                            >
                                Sign In
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {/* Link to your AuthModal component */}
            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
            />
        </>
    );
}

// Helpers
function IconButton({ icon, count }: { icon: React.ReactNode; count?: number }) {
    return (
        <button className="relative p-3 text-slate-500 hover:text-[#ff3d00] hover:bg-orange-50 rounded-xl transition-all">
            {icon}
            {count !== undefined && count > 0 && (
                <span className="absolute top-2 right-2 w-4 h-4 bg-[#ff3d00] text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">
                    {count}
                </span>
            )}
        </button>
    );
}

function DropdownItem({ icon, label, href }: { icon: any, label: string, href: string }) {
    return (
        <Link href={href} className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-[#ff3d00] rounded-xl transition-all text-sm font-semibold">
            {icon} {label}
        </Link>
    );
}