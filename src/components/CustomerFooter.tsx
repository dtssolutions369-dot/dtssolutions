"use client";

import React from "react";
import { 
  Facebook, Twitter, Instagram, MapPin, 
  Phone, Mail, ArrowRight, ShieldCheck, 
  ExternalLink, MessageSquare, Store 
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white pt-20 pb-10 px-6 relative overflow-hidden border-t border-slate-800">
      {/* Decorative Glow Background */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ff3d00]/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group w-fit">
              <div className="relative w-12 h-12 transition-transform duration-500 group-hover:rotate-[360deg]">
                <Image 
                  src="/logo.png" 
                  alt="DTS Logo" 
                  fill 
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tighter leading-none">DTS</span>
                <span className="text-[10px] font-black text-[#ff3d00] uppercase tracking-[0.2em]">Solutions</span>
              </div>
            </Link>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm font-medium">
              Revolutionizing local commerce by bridging the gap between neighborhood shops and digital convenience. Support local, shop smart.
            </p>
            
            <div className="flex gap-4">
              <SocialIcon icon={<Facebook size={18} />} href="#" />
              <SocialIcon icon={<Twitter size={18} />} href="#" />
              <SocialIcon icon={<Instagram size={18} />} href="#" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            {/* Navigation Section */}
            <div>
              <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs border-l-4 border-[#ff3d00] pl-3">
                Quick Links
              </h4>
              <ul className="space-y-4">
                <FooterLink href="/" label="Home" />
                <FooterLink href="/customer/dashboard" label="Dashboard" />
                <FooterLink href="/customer/wishlist" label="My Vault" />
                <FooterLink href="/customer/product-gallery" label="Marketplace" />
              </ul>
            </div>

            {/* Legal & Support Section */}
            <div>
              <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs border-l-4 border-[#ff3d00] pl-3">
                Legal & Support
              </h4>
              <ul className="space-y-4">
                <FooterLink href="/terms" label="Terms & Conditions" />
                <FooterLink href="/privacy" label="Privacy Policy" />
                
                {/* Highlighted Business Link */}
                <li className="pt-2">
                  <Link 
                    href="/businessregister" 
                    className="flex items-center gap-2 text-[#ff3d00] hover:text-white transition-all duration-300 text-sm font-black group"
                  >
                    <Store size={16} className="group-hover:scale-110 transition-transform" />
                    Register Business
                  </Link>
                </li>

                {/* Complaint Link */}
                <li>
                  <Link 
                    href="/customer/complaints" 
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 text-sm font-bold group"
                  >
                    <MessageSquare size={16} className="text-slate-500 group-hover:text-[#ff3d00] transition-colors" />
                    Lodge Complaint
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Contact Column */}
          <div className="lg:col-span-3">
            <h4 className="text-white font-black mb-8 uppercase tracking-widest text-xs border-l-4 border-[#ff3d00] pl-3">
              Contact Us
            </h4>
            <div className="bg-white/5 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/10 space-y-6">
              <ContactItem 
                icon={<MapPin size={18} className="text-[#ff3d00]" />} 
                text="123 Business Street, Tech Park, Bangalore" 
              />
              <ContactItem 
                icon={<Phone size={18} className="text-[#ff3d00]" />} 
                text="+91 9876543210" 
              />
              <ContactItem 
                icon={<Mail size={18} className="text-[#ff3d00]" />} 
                text="support@dts.com" 
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col gap-2">
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center md:text-left">
              © {currentYear} DTS SOLUTIONS. ALL RIGHTS RESERVED.
            </p>
            <Link 
              href="https://rakvih.in/" 
              target="_blank" 
              className="flex items-center gap-2 group/dev text-slate-400 hover:text-white transition-colors justify-center md:justify-start"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest">Developed by</span>
              <span className="text-[11px] font-black text-[#ff3d00] group-hover/dev:underline decoration-white underline-offset-4 flex items-center gap-1">
                RAKVIH <ExternalLink size={10} />
              </span>
            </Link>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="flex items-center gap-2 text-[#ff3d00] font-black text-[10px] uppercase tracking-tighter">
              <ShieldCheck size={14} />
              Secure Local Shopping
            </div>
            <div className="flex gap-6 text-[10px] font-black uppercase text-slate-500">
               <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
               <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// --- SUB-COMPONENTS ---

function FooterLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={href} className="group flex items-center gap-2 text-slate-400 hover:text-white transition-all duration-300 text-sm font-bold">
        <ArrowRight size={12} className="opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all text-[#ff3d00]" />
        {label}
      </Link>
    </li>
  );
}

function ContactItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex gap-4 group cursor-default">
      <div className="shrink-0 mt-0.5">{icon}</div>
      <span className="text-slate-300 text-xs font-bold leading-snug group-hover:text-white transition-colors">
        {text}
      </span>
    </div>
  );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
  return (
    <Link 
      href={href}
      className="w-11 h-11 bg-white/5 hover:bg-[#ff3d00] rounded-2xl flex items-center justify-center cursor-pointer transition-all duration-500 text-white border border-white/10 hover:shadow-[0_10px_20px_-5px_#ff3d00] hover:-translate-y-1"
    >
      {icon}
    </Link>
  );
}