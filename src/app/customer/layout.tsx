"use client";

import React, { useState, useEffect } from "react";
import CustomerFooter from "@/components/CustomerFooter";
import CustomerHeader from "@/components/CustomerHeader";
import LocationModal from "@/components/LocationModal";

export default function CustomerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [location, setLocation] = useState<any>(null);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // Sync location across all tabs
    useEffect(() => {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
            setLocation(JSON.parse(savedLocation));
        } else {
            setIsLocationModalOpen(true);
        }
    }, []);

    const handleLocationSelect = (loc: any) => {
        setLocation(loc);
        localStorage.setItem("user_location", JSON.stringify(loc));
        setIsLocationModalOpen(false);
        // Refresh page to sync data across all components
        window.location.reload(); 
    };

    return (
        <div className="relative flex flex-col min-h-screen">
            {/* STICKY HEADER - Z-index ensures it stays on top of banners */}
            <div className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
                <CustomerHeader
                    location={location}
                    onLocationClick={() => setIsLocationModalOpen(true)}
                    onAuthClick={() => {}}
                />
            </div>

            <LocationModal
                isOpen={isLocationModalOpen}
                onSelect={handleLocationSelect}
            />

            {/* Main Content Area - Added pt-4 to prevent immediate overlap */}
            <main className="flex-grow pt-4">
                {children}
            </main>

            <CustomerFooter />
        </div>
    );
}