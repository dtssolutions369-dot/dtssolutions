"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Search, MapPin, Loader2, ExternalLink,
  ArrowUpDown, Zap, Box, Hash
} from "lucide-react";

// ✅ Force dynamic rendering to avoid build-time prerender errors
export const dynamic = "force-dynamic";

export default function VendorProductsPage() {
  // ✅ Safe fallback for build-time
  const searchParams = typeof window !== "undefined" ? useSearchParams() : new URLSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [findInput, setFindInput] = useState(searchParams.get("q") || "");
  const [cityInput, setCityInput] = useState(searchParams.get("city") || "");
  const [pincodeInput, setPincodeInput] = useState(searchParams.get("pincode") || "");
  const [sortOrder, setSortOrder] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("vendor_products")
        .select(`
          id, product_name, price, product_image, vendor_id, created_at, is_active, city, pincode,
          vendor:vendor_register(company_name, user_type)
        `)
        .eq("is_active", true);

      if (findInput.trim()) query = query.ilike("product_name", `%${findInput.trim()}%`);
      if (cityInput.trim()) query = query.ilike("city", `%${cityInput.trim()}%`);
      if (pincodeInput.trim()) query = query.ilike("pincode", `%${pincodeInput.trim()}%`);

      if (sortOrder === "price_low") query = query.order("price", { ascending: true });
      else if (sortOrder === "price_high") query = query.order("price", { ascending: false });
      else query = query.order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      const processed = (data || []).map((p) => {
        let displayImage = "/placeholder-img.png";
        if (p.product_image) {
          const firstPath = p.product_image.split("|||")[0];
          displayImage = firstPath.startsWith("http")
            ? firstPath
            : supabase.storage.from("products").getPublicUrl(firstPath)?.data?.publicUrl || "/placeholder-img.png";
        }
        return { ...p, displayImage };
      });

      setProducts(processed);
      setCurrentPage(1); 
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [findInput, cityInput, pincodeInput, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (findInput.trim()) params.set("q", findInput.trim());
    if (cityInput.trim()) params.set("city", cityInput.trim());
    if (pincodeInput.trim()) params.set("pincode", pincodeInput.trim());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const currentItems = useMemo(() => {
    const lastIdx = currentPage * itemsPerPage;
    const firstIdx = lastIdx - itemsPerPage;
    return products.slice(firstIdx, lastIdx);
  }, [products, currentPage]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-24 font-sans">
      <header className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              Inventory <span className="text-[#00AEEF]">Hub.</span>
            </h1>
          </motion.div>
        </div>
      </header>

      {/* SEARCH PANEL */}
      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-30">
        <div className="bg-slate-950 rounded-[2.5rem] p-3 shadow-2xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-2">
            <FilterInput label="Product" icon={<Search size={18} className="text-[#00AEEF]" />} value={findInput} onChange={setFindInput} placeholder="Search..." />
            <FilterInput label="City" icon={<MapPin size={18} className="text-[#F26522]" />} value={cityInput} onChange={setCityInput} placeholder="Location" />
            
            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-[1.5rem] border border-white/5 focus-within:border-[#74cb01]/40 transition-all">
              <Hash size={18} className="text-[#74cb01]" />
              <div className="flex flex-col flex-1">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Pincode</label>
                <input value={pincodeInput} onChange={(e) => setPincodeInput(e.target.value)} placeholder="123456" className="bg-transparent border-none outline-none text-white font-bold text-xs w-full" />
              </div>
            </div>

            <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-[1.5rem] border border-white/5">
              <ArrowUpDown size={18} className="text-slate-400" />
              <div className="flex flex-col flex-1">
                <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Sort</label>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="bg-transparent border-none outline-none text-white font-black text-xs appearance-none w-full cursor-pointer">
                  <option value="newest">Newest</option>
                  <option value="price_low">Price: Low</option>
                </select>
              </div>
            </div>

            <button onClick={handleApplyFilters} className="bg-[#00AEEF] hover:bg-[#74cb01] text-white font-black uppercase text-[10px] rounded-[1.5rem] transition-all lg:col-span-2 h-full min-h-[55px]">
              <Zap size={14} fill="currentColor" className="inline mr-2" /> Apply Filters
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-20">
        {loading ? (
          <div className="flex flex-col items-center py-20"><Loader2 className="animate-spin text-[#00AEEF]" size={40} /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-slate-100">
            <Box className="mx-auto text-slate-200 mb-4" size={50} />
            <h3 className="text-lg font-black text-slate-900 uppercase">No Match Found</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            <AnimatePresence>
              {currentItems.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}

function FilterInput({ label, icon, value, onChange, placeholder }: any) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 bg-white/5 rounded-[1.5rem] border border-white/5 transition-all">
      {icon}
      <div className="flex flex-col flex-1">
        <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest">{label}</label>
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="bg-transparent border-none outline-none text-white font-bold text-xs w-full" />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-lg transition-all flex flex-col group"
    >
      <div className="aspect-square bg-slate-50 relative overflow-hidden">
        <img 
          src={product.displayImage || "/placeholder-img.png"} 
          alt="" 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
        />
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[8px] font-black uppercase shadow-sm">
          {product.pincode}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <h3 className="text-xs font-black text-slate-900 uppercase line-clamp-2 mb-4">{product.product_name}</h3>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-sm font-black text-[#F26522]">₹{product.price}</span>
          <Link href={`/vendor/view/${product.vendor_id}`} className="bg-slate-100 p-2 rounded-full group-hover:bg-[#00AEEF] group-hover:text-white transition-colors">
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
