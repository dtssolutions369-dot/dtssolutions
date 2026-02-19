"use client";

import React, { useState } from "react";
import { MapPin, ArrowRight, Loader2, Navigation, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";

interface LocationModalProps {
  isOpen: boolean;
  onSelect: (data: { city: string; pincode: string; area?: string; state?: string }) => void;
}

export default function LocationModal({ isOpen, onSelect }: LocationModalProps) {
  const [pincode, setPincode] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [area, setArea] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchLocationFromDB = async (code: string) => {
    if (code.length === 6) {
      setLoading(true);
      setError("");
      try {
        // 1. Check if any approved businesses exist in this pincode
        const { count, error: businessError } = await supabase
          .from("business_profiles")
          .select("id", { count: 'exact', head: true })
          .eq("pincode", code)
          .eq("is_approved", true); // Only show pincodes with approved shops

        if (businessError) throw businessError;

        if (count === 0) {
          setError("No shops available in this area yet.");
          setCity("");
          return;
        }

        // 2. Fetch City/State details (Either from your pincodes table or an external API)
        const { data: geoData, error: geoError } = await supabase
          .from("pincodes")
          .select("city, state, area_locality")
          .eq("pincode", code)
          .single();

        if (geoError || !geoData) {
          // Fallback: If not in your pincodes table, we know shops exist, 
          // so we could just say "Verified Area"
          setCity("Verified Location");
          setState("Active Zone");
        } else {
          setCity(geoData.city);
          setState(geoData.state);
          setArea(geoData.area_locality);
        }

      } catch (err) {
        console.error(err);
        setError("Location verification failed.");
      } finally {
        setLoading(false);
      }
    }
  };
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);

    if (value.length === 6) {
      fetchLocationFromDB(value);
    } else {
      setCity("");
      setState("");
      setArea("");
      setError("");
    }
  };

  const handleContinue = () => {
    if (city && pincode) {
      // Passes the validated data back to your Page/Header
      onSelect({
        city,
        pincode,
        area,
        state
      });
    }
  };

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
              <div className="relative mx-auto w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center">
                <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-ping" />
                <MapPin className="text-[#ff3d00] relative z-10" size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Set Location</h2>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Enter your pincode to see shops and products near you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 110001"
                    className={`w-full p-5 bg-slate-50 border-2 rounded-2xl outline-none font-bold text-center text-xl transition-all ${city ? 'border-green-500 ring-4 ring-green-50' : 'border-slate-100 focus:border-[#ff3d00]'
                      }`}
                    value={pincode}
                    onChange={handlePincodeChange}
                  />
                  {loading && <Loader2 className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-orange-500" size={20} />}
                  {city && <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 text-green-500" size={24} />}
                </div>

                <AnimatePresence>
                  {/* Inside the AnimatePresence where city is displayed */}
                  {city && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-orange-50 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 border border-orange-100"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-[#ff3d00]" />
                        <span className="text-slate-800 font-black text-sm uppercase tracking-wider">
                          {city}, {state}
                        </span>
                      </div>
                      <p className="text-[#ff3d00] text-[11px] font-black uppercase">
                        Verified Shops available in your area
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && <p className="text-red-500 text-xs font-bold uppercase tracking-wide">{error}</p>}
              </div>

              <button
                disabled={!city || loading}
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-[#ff3d00] to-[#ff6200] text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-orange-200 hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3"
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