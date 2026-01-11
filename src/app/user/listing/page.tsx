"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Zap,
  ArrowRight,
  Loader2,
  Search,
  ShieldCheck,
  TrendingUp,
  Award,
  Hash,
  MapPin,
  Briefcase,
  ArrowUpDown
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function VendorProductsPage() {
  const [findInput, setFindInput] = useState("");
  const [cityInput, setCityInput] = useState("");
  const [typeInput, setTypeInput] = useState("");
  const [sortOrder, setSortOrder] = useState("newest"); // 'newest', 'price_low', 'price_high'
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("vendor_products")
        .select(`
          id, product_name, description, price, product_image, vendor_id, created_at,
          vendor:vendor_register!inner(company_name, city, user_type)
        `)
        .eq("is_active", true);

      // --- FILTERS ---
      if (findInput) query = query.ilike("product_name", `%${findInput}%`);
      if (cityInput) query = query.ilike("vendor.city", `%${cityInput}%`);
      if (typeInput) query = query.contains("vendor.user_type", [typeInput]);

      // --- SORTING LOGIC ---
      if (sortOrder === "price_low") {
        query = query.order("price", { ascending: true });
      } else if (sortOrder === "price_high") {
        query = query.order("price", { ascending: false });
      } else {
        // Default: Newest
        query = query.order("created_at", { ascending: false });
      }

      const { data, error } = await query;
      if (error) throw error;

      const processedProducts = (data || []).map((p) => {
        let imageUrl: string | null = null;
        if (p.product_image) {
          const firstPath = p.product_image.split("|||")[0];
          if (firstPath.startsWith("http") || firstPath.startsWith("data:")) {
            imageUrl = firstPath;
          } else {
            const { data: urlData } = supabase.storage.from("products").getPublicUrl(firstPath);
            imageUrl = urlData?.publicUrl || null;
          }
        }
        return { ...p, product_image: imageUrl };
      });

      setProducts(processedProducts);
    } catch (err: any) {
      console.error("Fetch error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [findInput, cityInput, typeInput, sortOrder]); // Added sortOrder dependency

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <div className="min-h-screen bg-[#FFFDF5] pb-16 font-sans selection:bg-yellow-200">
      
      {/* --- COMPACT HERO --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-100">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
        <div className="max-w-6xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="inline-flex items-center gap-2 px-3 py-1 mb-4 bg-white/80 backdrop-blur-md border border-yellow-300 text-yellow-800 text-[9px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
              <Zap size={10} fill="currentColor" /> Marketplace Inventory
            </span>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none">
              VENDOR <br /> <span className="text-red-600 italic">INVENTORY</span>
            </h1>
          </div>
          <div className="hidden lg:block bg-white p-8 rounded-[2.5rem] rotate-3 shadow-xl border border-yellow-100">
            <Package size={50} className="text-yellow-600" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        
        {/* --- OPTIMIZED FILTER BAR --- */}
        <div className="bg-gray-900 shadow-2xl p-3 md:p-4 rounded-[2rem] border border-white/10 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            
            {/* Search Input */}
            <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-yellow-500/50 transition-all">
              <Search size={16} className="text-yellow-500 mr-3" />
              <div className="flex flex-col flex-1">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Identify Item</span>
                <input
                  value={findInput}
                  onChange={(e) => setFindInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-gray-600"
                  placeholder="SKU or Name..."
                />
              </div>
            </div>

            {/* City Input */}
            <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-red-500/50 transition-all">
              <MapPin size={16} className="text-red-500 mr-3" />
              <div className="flex flex-col flex-1">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Region</span>
                <input
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-xs placeholder:text-gray-600"
                  placeholder="City search..."
                />
              </div>
            </div>

            {/* Category Select */}
            <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-yellow-500/50 transition-all">
              <Briefcase size={16} className="text-yellow-500 mr-3" />
              <div className="flex flex-col flex-1">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Category</span>
                <select
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-xs appearance-none cursor-pointer"
                >
                  <option value="" className="text-black">All Sectors</option>
                  <option value="Manufacturer" className="text-black">Manufacturer</option>
                  <option value="Distributer" className="text-black">Distributor</option>
                  <option value="Retailers" className="text-black">Retailers</option>
                  <option value="Service Sector" className="text-black">Service Sector</option>
                </select>
              </div>
            </div>

            {/* NEW: Price Sorting Filter */}
            <div className="flex items-center px-5 py-2 bg-white/5 rounded-xl border border-white/5 focus-within:border-blue-500/50 transition-all">
              <ArrowUpDown size={16} className="text-blue-400 mr-3" />
              <div className="flex flex-col flex-1">
                <span className="text-[7px] font-black text-gray-500 uppercase tracking-widest">Sort By</span>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="bg-transparent border-none outline-none text-white font-bold text-xs appearance-none cursor-pointer"
                >
                  <option value="newest" className="text-black">Recently Added</option>
                  <option value="price_low" className="text-black">Price: Low to High</option>
                  <option value="price_high" className="text-black">Price: High to Low</option>
                </select>
              </div>
            </div>

            <button
              onClick={fetchProducts}
              className="bg-yellow-500 hover:bg-white text-black font-black uppercase tracking-widest text-[9px] px-8 py-4 rounded-xl transition-all active:scale-95"
            >
              Update Feed
            </button>
          </div>
        </div>

        {/* --- PRODUCT GRID --- */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-yellow-600 mb-3" />
              <p className="font-black uppercase tracking-widest text-[9px] text-yellow-800">Syncing Catalog...</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {products.map((product) => (
                    <motion.div
                      key={product.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      className="group bg-white rounded-[2rem] border border-yellow-100 hover:border-yellow-400 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col"
                    >
                      <Link href={`/vendor/view/${product.vendor_id}`} className="flex flex-col h-full">
                        
                        <div className="relative h-56 bg-[#FEF3C7]/10 overflow-hidden">
                          {product.product_image ? (
                            <img src={product.product_image} alt={product.product_name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-yellow-600/20"><Package size={48} /></div>
                          )}
                          <div className="absolute top-4 left-4 flex flex-col gap-1.5">
                            <span className="bg-white/90 backdrop-blur-md text-gray-900 px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest shadow-sm border border-yellow-50">
                              {product.vendor?.company_name}
                            </span>
                            <span className="bg-black/80 text-white px-2.5 py-1 rounded-lg text-[7px] font-bold uppercase tracking-widest self-start">
                              {product.vendor?.city}
                            </span>
                          </div>
                        </div>

                        <div className="p-7 flex flex-col flex-1">
                          <h3 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2 line-clamp-1 group-hover:text-red-600 transition-colors">
                            {product.product_name}
                          </h3>
                          <p className="text-gray-500 text-[11px] font-medium leading-relaxed mb-6 line-clamp-2">
                            {product.description || "Premium quality catalog item available for verified procurement."}
                          </p>
                          
                          <div className="mt-auto flex items-center justify-between pt-5 border-t border-gray-50">
                            <div>
                              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Procurement Price</span>
                              <p className="text-2xl font-black tracking-tighter text-gray-900">₹{Number(product.price).toLocaleString()}</p>
                            </div>
                            <div className="bg-gray-900 group-hover:bg-red-600 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:-rotate-6">
                              <ArrowRight size={18} />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {products.length === 0 && (
                <div className="bg-white p-16 rounded-[3rem] border-2 border-dashed border-yellow-100 text-center">
                  <Package size={48} className="text-yellow-200 mx-auto mb-4" />
                  <h2 className="text-2xl font-black tracking-tighter text-yellow-800/40 uppercase">No Data Found</h2>
                  <p className="font-bold text-yellow-700/30 mt-1 uppercase text-[9px] tracking-[0.2em]">Adjust filters for regional availability</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* --- TRUST FOOTER --- */}
        <div className="mt-20 flex justify-center gap-12 border-t border-yellow-100 pt-10">
          <TrustCard icon={<ShieldCheck size={16} />} label="Secure" />
          <TrustCard icon={<Hash size={16} />} label="Tracked" />
          <TrustCard icon={<Award size={16} />} label="Verified" />
          <TrustCard icon={<TrendingUp size={16} />} label="Growth" />
        </div>
      </div>
    </div>
  );
}

function TrustCard({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition-opacity cursor-default">
      <div className="text-yellow-600">{icon}</div>
      <span className="font-black uppercase tracking-widest text-[8px]">{label}</span>
    </div>
  );
}