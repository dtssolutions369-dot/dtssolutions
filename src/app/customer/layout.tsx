"use client";

import React, { useState, useEffect, useCallback } from "react";
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

    // Sync location across all tabs & events
    const loadSavedLocation = useCallback(() => {
        const savedLocation = localStorage.getItem("user_location");
        if (savedLocation) {
            try {
                setLocation(JSON.parse(savedLocation));
            } catch (e) {
                console.error("Error parsing saved location", e);
                setLocation(null);
            }
        } else {
            setLocation(null);
        }
    }, []);

    useEffect(() => {
        loadSavedLocation();

        // Global event listeners to open/clear location modal from any component
        const handleOpenModal = () => setIsLocationModalOpen(true);
        const handleClearModal = () => {
            localStorage.removeItem("user_location");
            setLocation(null);
            setIsLocationModalOpen(false);
            window.location.reload();
        };
        const handleLocationUpdated = () => {
            loadSavedLocation();
        };

        window.addEventListener("open-location-modal", handleOpenModal);
        window.addEventListener("clear-user-location", handleClearModal);
        window.addEventListener("location-updated", handleLocationUpdated);
        window.addEventListener("storage", loadSavedLocation);

        return () => {
            window.removeEventListener("open-location-modal", handleOpenModal);
            window.removeEventListener("clear-user-location", handleClearModal);
            window.removeEventListener("location-updated", handleLocationUpdated);
            window.removeEventListener("storage", loadSavedLocation);
        };
    }, [loadSavedLocation]);

    const handleLocationSelect = (loc: any) => {
        setLocation(loc);
        localStorage.setItem("user_location", JSON.stringify(loc));
        setIsLocationModalOpen(false);
        window.dispatchEvent(new Event("location-updated"));
        // Clean page reload to re-fetch location-scoped data smoothly
        window.location.reload();
    };

    const handleClearLocation = () => {
        setLocation(null);
        localStorage.removeItem("user_location");
        setIsLocationModalOpen(false);
        window.dispatchEvent(new Event("location-updated"));
        // Clean page reload so all components show all products without location filter
        window.location.reload();
    };

    return (
        <div className="relative flex flex-col min-h-screen">
            {/* STICKY HEADER - Z-index ensures it stays on top of banners */}
            <div className="sticky top-0 z-[100] w-full bg-white/80 backdrop-blur-md border-b border-slate-100">
                <CustomerHeader
                    location={location}
                    onLocationClick={() => setIsLocationModalOpen(true)}
                    onClearLocation={handleClearLocation}
                />
            </div>

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onSelect={handleLocationSelect}
                onClear={handleClearLocation}
                currentLocation={location}
            />

            {/* Main Content Area */}
            <main className="flex-grow pt-4">
                {children}
            </main>

            <CustomerFooter />
        </div>
    );
}