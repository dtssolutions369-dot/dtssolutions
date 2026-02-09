"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Youtube,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Globe,
  ArrowUpRight,
  ShieldCheck
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-[#080808] text-zinc-400 pt-16 pb-8 border-t border-white/5 overflow-hidden">
      {/* Subtle Background Glow to match Logo colors */}
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-amber-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* MAIN SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <div className="relative inline-block">
              <Image
                src="/blacklogo.png" 
                alt="Dtssolutions"
                width={160}
                height={50}
                className="brightness-125 drop-shadow-[0_0_15px_rgba(245,158,11,0.2)]"
              />
            </div>
            <p className="text-sm leading-relaxed text-zinc-500 max-w-xs">
              Connecting <span className="text-zinc-300">India's local experts</span> with digital speed. Verified, trusted, and hyper-local solutions for your everyday needs.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Instagram size={18} />, href: "https://instagram.com/Dtssolutions4", color: "hover:bg-pink-500" },
                { icon: <Youtube size={18} />, href: "https://youtube.com/@Dtssolutions", color: "hover:bg-red-600" },
                { icon: <MessageCircle size={18} />, href: "https://WA.me/917892999063", color: "hover:bg-green-500" }
              ].map((social, i) => (
                <a 
                  key={i} 
                  href={social.href} 
                  className={`w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 ${social.color} hover:text-white transition-all duration-300 group`}
                >
                  <span className="group-hover:scale-110 transition-transform">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-amber-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">Platform</h4>
              <nav className="flex flex-col gap-4">
                {['Home', 'Plans', 'Add Business', 'Transport'].map((item) => (
                  <Link key={item} href="#" className="text-sm hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-lime-500 transition-colors" />
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
            <div>
              <h4 className="text-blue-500 text-xs font-bold uppercase tracking-[0.2em] mb-6">Services</h4>
              <nav className="flex flex-col gap-4">
                {['Enquiry', 'Listing', 'Video Services', 'Help & Earn'].map((item) => (
                  <Link key={item} href="#" className="text-sm hover:text-white transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-blue-500 transition-colors" />
                    {item}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Regional Card */}
          <div className="lg:col-span-3">
            <h4 className="text-zinc-100 text-xs font-bold uppercase tracking-[0.2em] mb-6">Presence</h4>
            <div className="p-5 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent border border-white/10 backdrop-blur-sm space-y-4">
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                   <Globe size={16} className="text-amber-500" />
                </div>
                <div>
                    <p className="text-[10px] text-zinc-500 leading-none mb-1">Country</p>
                    <span className="font-medium">India (English)</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm text-zinc-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                   <MapPin size={16} className="text-blue-500" />
                </div>
                <div>
                    <p className="text-[10px] text-zinc-500 leading-none mb-1">Headquarters</p>
                    <span className="font-medium">Haveri, Karnataka</span>
                </div>
              </div>
              <div className="pt-2 mt-2 border-t border-white/5 flex items-center gap-2 text-[10px] text-lime-500 font-bold uppercase tracking-wider">
                <ShieldCheck size={12} /> Google Verified Partner
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT STRIP */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 py-8 border-y border-white/5">
          <div className="flex flex-wrap justify-center lg:justify-start gap-8">
            <a href="mailto:Dtssolutions2025@gmail.com" className="group flex items-center gap-3 text-sm hover:text-white transition-colors">
              <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                <Mail size={14} className="text-amber-500" />
              </div>
              Dtssolutions2025@gmail.com
            </a>
            <a href="tel:+917892999063" className="group flex items-center gap-3 text-sm hover:text-white transition-colors">
               <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-blue-500/50 transition-colors">
                <Phone size={14} className="text-blue-500" />
              </div>
              +91 78929 99063
            </a>
          </div>
          
          <div className="flex gap-8 text-[11px] font-bold uppercase tracking-[0.2em]">
            <Link href="/terms" className="text-zinc-500 hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="text-zinc-500 hover:text-white transition-colors">Privacy</Link>
          </div>
        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[11px] text-zinc-600 font-medium">
            © {currentYear} <span className="text-zinc-400">DTSSOLUTIONS INDIA PVT LTD.</span> ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-600">
            <span>Design by</span>
            <a href="https://rakvih.in/" className="text-zinc-400 hover:text-lime-500 transition-colors font-bold underline underline-offset-4 decoration-white/10">Rakivh</a>
          </div>
        </div>

      </div>
    </footer>
  );
}