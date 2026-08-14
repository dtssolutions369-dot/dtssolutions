"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MapPin,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface LocationModalProps {
  isOpen: boolean;
  onSelect: (data: {
    city: string;
    pincode: string;
    area?: string;
    state?: string;
  }) => void;
}

export default function LocationModal({ isOpen, onSelect }: LocationModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [checkingShop, setCheckingShop] = useState(false);
  const [error, setError] = useState("");

  // Ref to handle debouncing and prevent multiple rapid network requests
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 Fetch City + Pincode suggestions with Debounce (fixes UI freezing / race conditions)
  const fetchSuggestions = (value: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (value.length < 3) {
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
          .or(`pincode.ilike.%${value}%,city.ilike.%${value}%`)
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
    }, 300); // 300ms debounce delay
  };

  // ✅ Check if shops exist in that pincode
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
    
    // Set query to a clean formatted readable string
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
          >
            <div className="p-10 text-center space-y-6">
              {/* ICON */}
              <div className="relative mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                <MapPin className="text-[#ff3d00] relative z-10" size={36} />
              </div>

              {/* TITLE */}
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  Set Location
                </h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Search your city or area to see shops and products near you.
                </p>
              </div>

              {/* SEARCH INPUT */}
              <div className="space-y-4 relative">
                <div className="relative">
                  <Search
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={18}
                  />

                  <input
                    type="text"
                    placeholder="Search city or area (e.g. Indiranagar)"
                    className={`w-full pl-12 pr-12 py-5 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-center text-sm transition-all ${
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
                      className="absolute top-[70px] left-0 w-full bg-white border border-slate-100 shadow-xl rounded-2xl overflow-hidden z-50 max-h-60 overflow-y-auto text-left"
                    >
                      {results.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => handleSelectLocation(item)}
                          className="w-full text-left px-6 py-4 hover:bg-orange-50 transition-all border-b last:border-b-0 border-slate-100 cursor-pointer"
                        >
                          <p className="font-black text-slate-800 text-sm">
                            {item.area_locality}, {item.city}
                          </p>
                          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                            {item.state} • {item.pincode}
                          </p>
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
                      className="bg-orange-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-orange-100"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#ff3d00]" />
                        <span className="text-slate-800 font-black text-sm uppercase tracking-wider">
                          {selected.city}, {selected.state}
                        </span>
                      </div>
                      <p className="text-[#ff3d00] text-[11px] font-black uppercase">
                        Verified Shops available in your area ({selected.pincode})
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

              {/* CONTINUE BUTTON */}
              <button
                disabled={!selected || loading || checkingShop}
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-[#ff3d00] to-[#ff6200] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 cursor-pointer disabled:cursor-not-allowed"
              >
                Continue Shopping <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}