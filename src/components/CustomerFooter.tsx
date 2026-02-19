"use client";

import React from "react";
import { Facebook, Twitter, Instagram, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

export default function CustomerFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#111827] text-white pt-16 pb-8 px-6">
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* About Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="bg-[#ff3d00] p-2 rounded-lg font-black text-xl italic">D</div>
            <span className="text-2xl font-black tracking-tighter uppercase">DTS</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            Connecting local businesses with customers in your area. 
            Shop local, support your community, and discover amazing products near you.
          </p>
          <div className="flex gap-4">
            <SocialIcon icon={<Facebook size={18} />} />
            <SocialIcon icon={<Twitter size={18} />} />
            <SocialIcon icon={<Instagram size={18} />} />
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-orange-500 font-black mb-6 uppercase tracking-widest text-sm">Quick Links</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/categories" className="hover:text-white transition-colors">Categories</Link></li>
            <li><Link href="/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
            <li><Link href="/login" className="hover:text-white transition-colors">Login</Link></li>
            <li><Link href="/register" className="hover:text-white transition-colors">Register</Link></li>
          </ul>
        </div>

        {/* Categories (Alphabetical) */}
        <div>
          <h4 className="text-orange-500 font-black mb-6 uppercase tracking-widest text-sm">Popular Categories</h4>
          <ul className="space-y-4 text-slate-400 font-bold text-sm">
            <li><Link href="#" className="hover:text-white transition-colors">Beauty & Personal Care</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Electronics</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Fashion</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Grocery</Link></li>
            <li><Link href="#" className="hover:text-white transition-colors">Home & Furniture</Link></li>
          </ul>
        </div>

        {/* Contact Us */}
        <div>
          <h4 className="text-orange-500 font-black mb-6 uppercase tracking-widest text-sm">Contact Us</h4>
          <ul className="space-y-6 text-slate-400 font-bold text-sm">
            <li className="flex gap-3">
              <MapPin className="text-orange-500 shrink-0" size={18} />
              <span>123 Business Street, Tech Park, Bangalore - 560001</span>
            </li>
            <li className="flex gap-3">
              <Phone className="text-orange-500 shrink-0" size={18} />
              <span>+91 9876543210</span>
            </li>
            <li className="flex gap-3">
              <Mail className="text-orange-500 shrink-0" size={18} />
              <span>support@dts.com</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto pt-8 border-t border-slate-800 text-center space-y-4">
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
          © {currentYear} DTS - A Local Shop Everywhere. All rights reserved.
        </p>
        <div className="flex justify-center gap-6 text-[10px] font-black uppercase text-slate-400">
          <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-white">Terms & Conditions</Link>
          <Link href="/refund" className="hover:text-white">Refund Policy</Link>
        </div>
      </div>
    </footer>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="w-10 h-10 bg-[#ff3d00] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform text-white">
      {icon}
    </div>
  );
}