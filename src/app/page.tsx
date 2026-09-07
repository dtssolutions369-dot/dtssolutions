"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress bar animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    // Redirect after loading completes
    const timer = setTimeout(() => {
      window.location.href = "/customer/dashboard";
    }, 2800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [router]);

  const handleSkip = () => {
    window.location.href = "/customer/dashboard";
  };

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-white via-orange-50/30 to-orange-100/20 flex flex-col items-center justify-center p-6 overflow-hidden select-none font-sans">
      
      {/* Glowing background ambient lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#ff3d00]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-orange-400/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full flex flex-col items-center text-center space-y-8">
        
        {/* Animated Brand Logo Container */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative"
        >
          <div className="relative p-6 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-orange-500/10 border border-white/80">
            <div className="relative w-44 h-16 md:w-56 md:h-20 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="DTS Solutions Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          
          {/* Subtle pulsating ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#ff3d00]/20 to-orange-400/20 rounded-[3rem] blur-md -z-10 animate-pulse" />
        </motion.div>

        {/* Welcome Message & Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/80 text-[#ff3d00] text-xs font-black uppercase tracking-widest border border-orange-200/50 shadow-sm">
            <Sparkles size={13} className="animate-spin" />
            <span>Local Stores • Fast Delivery</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3d00] to-orange-500">DTS Solutions</span>
          </h1>
          
          <p className="text-slate-500 text-sm md:text-base font-medium max-w-xs mx-auto leading-relaxed">
            Your trusted marketplace for local stores, verified businesses, and direct neighborhood shopping.
          </p>
        </motion.div>

        {/* Progress Loading Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full max-w-xs space-y-2 pt-2"
        >
          <div className="w-full bg-slate-200/70 h-2.5 rounded-full overflow-hidden p-0.5 shadow-inner">
            <motion.div
              className="bg-gradient-to-r from-[#ff3d00] to-orange-400 h-full rounded-full shadow-md shadow-orange-300"
              style={{ width: `${progress}%` }}
              transition={{ ease: "easeInOut" }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">
            <span>Loading Experience...</span>
            <span className="text-[#ff3d00] font-black">{Math.min(100, Math.round(progress))}%</span>
          </div>
        </motion.div>

        {/* Instant Skip Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          onClick={handleSkip}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-[#ff3d00] transition-colors py-2 px-4 rounded-xl hover:bg-white/60 cursor-pointer"
        >
          <span>Enter Directly</span>
          <ArrowRight size={14} />
        </motion.button>

      </div>
    </div>
  );
}