"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Mail,
  Globe,
  Building2,
  Star,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export default function VendorDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [vendorRes, productRes] = await Promise.all([
          supabase.from("vendor_register").select("*").eq("id", id).single(),
          supabase
            .from("vendor_products")
            .select("*")
            .eq("vendor_id", id)
            .eq("is_active", true),
        ]);

        if (vendorRes.data) setVendor(vendorRes.data);
        if (productRes.data) setProducts(productRes.data);
      } catch (error) {
        console.error("Error fetching vendor details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) return <LoadingSkeleton />;
  if (!vendor) return <EmptyState />;

  const getProductImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const { data } = supabase.storage.from("products").getPublicUrl(path);
    return data?.publicUrl || "";
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* NAVIGATION BAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <button
            onClick={() => router.back()}
            className="group flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#74cb01] transition-colors"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Marketplace
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative">
        <div className="h-64 md:h-80 w-full bg-slate-900 relative overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#74cb01] to-cyan-600/40 z-10" />
          <img 
            src="/banner.jpg" 
            className="w-full h-full object-cover opacity-50"
            alt="Banner"
          />
        </div>

        {/* COMPANY FLOAT CARD */}
        <div className="max-w-7xl mx-auto px-6">
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 p-6 md:p-8 -mt-24 relative z-20 flex flex-col md:flex-row gap-8 items-center md:items-start"
          >
            {/* LOGO */}
            <div className="relative group">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-slate-50 border-4 border-white flex items-center justify-center overflow-hidden shadow-xl">
                {vendor.company_logo ? (
                  <img src={vendor.company_logo} className="w-full h-full object-contain p-2" alt="Logo" />
                ) : (
                  <Building2 size={56} className="text-slate-200" />
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-[#74cb01] text-white p-2 rounded-full shadow-lg border-2 border-white">
                <ShieldCheck size={20} />
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1 text-center md:text-left pt-2">
              <div className="flex flex-col md:flex-row md:items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                  {vendor.company_name}
                </h1>
                <span className="inline-flex items-center self-center px-3 py-1 rounded-full text-xs font-bold bg-[#74cb01] text-black uppercase tracking-wider">
                  Verified Vendor
                </span>
              </div>

              <p className="text-slate-500 mt-4 max-w-2xl text-lg leading-relaxed">
                {vendor.profile_info || "A premier provider of high-quality industrial solutions and services."}
              </p>

              <div className="flex flex-wrap gap-5 mt-6 justify-center md:justify-start">
                <Badge icon={<MapPin size={14} />} label={`${vendor.city}, ${vendor.state}`} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-6 mt-12 grid lg:grid-cols-12 gap-10 pb-20">
        {/* PRODUCTS SECTION */}
        <div className="lg:col-span-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              Featured Products <span className="text-slate-400 font-medium text-sm">({products.length})</span>
            </h2>
          </div>

          <AnimatePresence>
            {products.length ? (
              <div className="grid sm:grid-cols-2 gap-6">
                {products.map((p, idx) => (
                  <ProductCard key={p.id} product={p} index={idx} getUrl={getProductImageUrl} />
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 py-20 text-center">
                <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-medium">No products listed yet.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* SIDEBAR: CONTACT & DETAILS */}
        <div className="lg:col-span-4 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-28"
          >
            <h3 className="text-xl font-bold mb-8">Direct Contact</h3>

            <div className="space-y-6">
              <ContactItem icon={<Phone size={20} />} label="Call Support" value={vendor.mobile_number} isLink={`tel:${vendor.mobile_number}`} />
              <ContactItem icon={<Mail size={20} />} label="Email Address" value={vendor.email} isLink={`mailto:${vendor.email}`} />
              <ContactItem icon={<Globe size={20} />} label="Official Website" value={vendor.website} isLink={vendor.website} />
            </div>

            <button 
              onClick={() => window.open(`tel:${vendor.mobile_number}`)}
              className="w-full mt-10 bg-[#74cb01] hover:bg-[#74cb01] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#74cb01] transition-all active:scale-[0.98]"
            >
              Contact Now
            </button>
          </motion.div>

          <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-4">Headquarters</h3>
            <div className="flex gap-3 text-slate-600">
              <MapPin size={20} className="text-slate-400 shrink-0 mt-1" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold text-slate-800">{vendor.building}</span><br />
                {vendor.flat_no}, {vendor.street}<br />
                {vendor.area}, {vendor.city}<br />
                {vendor.state} - {vendor.pincode}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- HELPER COMPONENTS ---------------- */

function ProductCard({ product, index, getUrl }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200 transition-all duration-300 overflow-hidden"
    >
      <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
        {product.product_image ? (
          <img
            src={getUrl(product.product_image.split("|||")[0])}
            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
            alt={product.product_name}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <ShoppingBag size={40} />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-sm">
          <p className="text-[#74cb01] font-bold text-sm">
            ₹{Number(product.price).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="p-6">
        <h4 className="font-bold text-slate-800 text-lg group-hover:text-[#74cb01] transition-colors truncate">
          {product.product_name}
        </h4>
        <p className="text-slate-500 text-sm mt-2 line-clamp-2">
          {product.description || "High-quality product from our verified collection."}
        </p>
      </div>
    </motion.div>
  );
}

function ContactItem({ icon, label, value, isLink }: any) {
  if (!value) return null;
  return (
    <div className="group flex items-start gap-4 cursor-pointer" onClick={() => isLink && window.open(isLink)}>
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#74cb01] group-hover:bg-[#74cb01] group-hover:text-white transition-all">
        {icon}
      </div>
      <div className="flex-1 border-b border-white/5 pb-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-sm font-medium text-white flex items-center gap-1">
          {value} {isLink && <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </p>
      </div>
    </div>
  );
}

function Badge({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-slate-600 font-medium text-sm">
      <span className="text-[#74cb01]">{icon}</span>
      {label}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      <div className="h-64 bg-slate-100 w-full" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-40 bg-white shadow-lg rounded-3xl -mt-20 border p-8">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-slate-200 rounded-2xl" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-8 bg-slate-200 w-1/3 rounded" />
              <div className="h-4 bg-slate-100 w-2/3 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400">
      <Building2 size={64} className="mb-4 opacity-20" />
      <h3 className="text-xl font-bold text-slate-900">Vendor Not Found</h3>
      <p>The profile you are looking for does not exist.</p>
    </div>
  );
}