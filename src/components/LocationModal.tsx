"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Search,
  X,
  RotateCcw,
  Globe
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (data: {
    city: string;
    pincode: string;
    area?: string;
    state?: string;
  }) => void;
  onClear?: () => void;
  currentLocation?: {
    city: string;
    pincode: string;
    area?: string;
    state?: string;
  } | null;
}

export default function LocationModal({
  isOpen,
  onClose,
  onSelect,
  onClear,
  currentLocation,
}: LocationModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [checkingShop, setCheckingShop] = useState(false);
  const [error, setError] = useState("");

  // Ref to handle debouncing and prevent multiple rapid network requests
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch City + Pincode suggestions with Debounce
  const fetchSuggestions = (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from("pincodes")
          .select("pincode, city, state, area_locality")
          .or(`pincode.ilike.%${value}%,city.ilike.%${value}%,area_locality.ilike.%${value}%`)
          .eq("is_active", true) // Only show active delivery zones
          .limit(10);

        if (error) throw error;

        // Remove duplicates if multiple entries have the same pincode
        const uniqueResults = data?.filter(
          (v, i, a) => a.findIndex((t) => t.pincode === v.pincode) === i
        );

        setResults(uniqueResults || []);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Could not find location.");
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  // Check if shops exist in that pincode
  const verifyShopsInPincode = async (pincode: string) => {
    setCheckingShop(true);
    setError("");

    try {
      const { count, error: supabaseError } = await supabase
        .from("business_profiles")
        .select("id", { count: "exact", head: true })
        .eq("pincode", pincode)
        .eq("status", "approved");

      if (supabaseError) {
        throw supabaseError;
      }

      if (count === 0 || count === null) {
        setSelected(null);
        setError("No shops available in this area yet.");
        return false;
      }

      return true;
    } catch (err: any) {
      console.error("Full Error Object:", err);
      setError(err.message || "Location verification failed.");
      return false;
    } finally {
      setCheckingShop(false);
    }
  };

  const handleSelectLocation = async (item: any) => {
    setError("");
    setSelected(null);

    // Set query to clean formatted readable string
    const formattedQuery = `${item.area_locality ? item.area_locality + ", " : ""}${item.city} (${item.pincode})`;
    setQuery(formattedQuery);
    setResults([]);

    // Verify shops for the selected pincode
    const isValid = await verifyShopsInPincode(item.pincode);

    if (isValid) {
      setSelected(item);
    }
  };

  const handleContinue = () => {
    if (!selected) return;

    onSelect({
      city: selected.city,
      pincode: selected.pincode,
      state: selected.state,
      area: selected.area_locality,
    });
  };

  // Reset states cleanly when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
      setSelected(null);
      setError("");
      setLoading(false);
      setCheckingShop(false);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-100"
          >
            {/* CLOSE BUTTON */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-all z-20 cursor-pointer"
              aria-label="Close modal"
            >
              <X size={20} />
            </button>

            <div className="p-8 md:p-10 text-center space-y-6">
              {/* ICON */}
              <div className="relative mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                <MapPin className="text-[#ff3d00] relative z-10" size={36} />
              </div>

              {/* TITLE */}
              <div className="space-y-1.5">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Choose Location
                </h2>
                <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-sm mx-auto">
                  Enter your pincode or city to discover verified stores near you, or browse products nationwide.
                </p>
              </div>

              {/* CURRENT ACTIVE LOCATION BANNER */}
              {currentLocation && (
                <div className="bg-orange-50/80 border border-orange-200 rounded-2xl p-4 flex items-center justify-between gap-3 text-left">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-[#ff3d00] text-white rounded-xl flex-shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-black text-[#ff3d00] uppercase tracking-wider">Active Delivery Zone</p>
                      <p className="text-xs md:text-sm font-black text-slate-900 truncate">
                        {currentLocation.area ? `${currentLocation.area}, ` : ""}{currentLocation.city} ({currentLocation.pincode})
                      </p>
                    </div>
                  </div>
                  {onClear && (
                    <button
                      onClick={onClear}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-red-50 text-red-500 border border-red-200 rounded-xl text-xs font-black transition-all shadow-sm flex-shrink-0 cursor-pointer"
                      title="Clear pincode"
                    >
                      <RotateCcw size={13} />
                      <span>Clear</span>
                    </button>
                  )}
                </div>
              )}

              {/* SEARCH INPUT */}
              <div className="space-y-3 relative">
                <div className="relative">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Enter pincode, city, or area (e.g. 560038)"
                    className={`w-full pl-12 pr-12 py-4 md:py-5 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-center text-sm transition-all ${
                      selected
                        ? "border-green-500 ring-4 ring-green-50"
                        : "border-slate-100 focus:border-[#ff3d00]"
                    }`}
                    value={query}
                    onChange={(e) => {
                      const val = e.target.value;
                      setQuery(val);
                      setSelected(null);
                      setError("");
                      fetchSuggestions(val);
                    }}
                  />

                  {(loading || checkingShop) && (
                    <Loader2
                      className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-orange-500"
                      size={20}
                    />
                  )}

                  {selected && !loading && !checkingShop && (
                    <CheckCircle2
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500"
                      size={24}
                    />
                  )}
                </div>

                {/* DROPDOWN RESULTS */}
                <AnimatePresence>
                  {results.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-[68px] left-0 w-full bg-white border border-slate-100 shadow-2xl rounded-2xl overflow-hidden z-50 max-h-60 overflow-y-auto text-left"
                    >
                      {results.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectLocation(item)}
                          className="w-full text-left px-6 py-3.5 hover:bg-orange-50 transition-all border-b last:border-b-0 border-slate-100 cursor-pointer flex items-center justify-between"
                        >
                          <div>
                            <p className="font-black text-slate-800 text-sm">
                              {item.area_locality ? `${item.area_locality}, ` : ""}{item.city}
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                              {item.state} • PIN: {item.pincode}
                            </p>
                          </div>
                          <span className="text-xs font-black text-[#ff3d00] bg-orange-100/60 px-2.5 py-1 rounded-lg">
                            Select
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* VERIFIED DISPLAY */}
                <AnimatePresence>
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-emerald-200"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={18} className="text-emerald-600" />
                        <span className="text-slate-800 font-black text-sm uppercase tracking-wider">
                          {selected.area_locality ? `${selected.area_locality}, ` : ""}{selected.city}, {selected.state}
                        </span>
                      </div>
                      <p className="text-emerald-700 text-xs font-black">
                        ✓ Verified Shops & Delivery available in PIN {selected.pincode}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ERROR */}
                {error && (
                  <p className="text-red-500 text-xs font-bold uppercase tracking-wide">
                    {error}
                  </p>
                )}
              </div>

              {/* ACTION BUTTONS */}
              <div className="space-y-3 pt-2">
                <button
                  disabled={!selected || loading || checkingShop}
                  onClick={handleContinue}
                  className="w-full bg-gradient-to-r from-[#ff3d00] to-[#ff6200] text-white py-4 md:py-5 rounded-2xl font-black text-base md:text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
                >
                  Set Location & Continue <ArrowRight size={20} />
                </button>

                {/* CLEAR / BROWSE ALL BUTTON */}
                {currentLocation ? (
                  <button
                    onClick={onClear}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw size={15} /> Clear Pincode & Browse All Locations
                  </button>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full text-slate-400 hover:text-slate-600 py-2 font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Globe size={14} /> Continue browsing without setting location
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}