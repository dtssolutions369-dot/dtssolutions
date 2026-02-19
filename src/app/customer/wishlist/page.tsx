"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("wishlist")
      .select(`
        id,
        products (
          id,
          name,
          price,
          images,
          business_profiles (shop_name)
        )
      `)
      .eq("user_id", user.id);

    if (error) toast.error("Could not load wishlist");
    else setItems(data || []);
    setLoading(false);
  };

  const removeFromWishlist = async (wishlistId: string) => {
    const { error } = await supabase.from("wishlist").delete().eq("id", wishlistId);
    if (!error) {
      setItems(items.filter(item => item.id !== wishlistId));
      toast.success("Removed from wishlist");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 space-y-4">
          <Link href="/customer/categories" className="flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-[#ff3d00] transition-colors">
            <ArrowLeft size={16} /> Back to Shopping
          </Link>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter">
            My <span className="text-[#ff3d00]">Wishlist</span>
          </h1>
        </header>

        {loading ? (
          <div className="h-[40vh] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#ff3d00]" size={40} />
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  key={item.id} 
                  className="bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative group"
                >
                  <button 
                    onClick={() => removeFromWishlist(item.id)}
                    className="absolute top-6 right-6 z-10 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                  
                  <div className="aspect-square rounded-[2rem] overflow-hidden mb-4 bg-slate-50">
                    <img src={item.products.images?.[0]} className="w-full h-full object-cover" alt="" />
                  </div>
                  
                  <div className="px-2">
                    <p className="text-[10px] font-black text-[#ff3d00] uppercase tracking-widest mb-1">
                      {item.products.business_profiles?.shop_name}
                    </p>
                    <h3 className="font-bold text-slate-900 truncate mb-2">{item.products.name}</h3>
                    <div className="flex items-center justify-between">
                       <span className="text-xl font-black text-slate-900">₹{item.products.price}</span>
                       <Link 
                        href={`/customer/product/${item.products.id}`}
                        className="p-3 bg-slate-900 text-white rounded-xl hover:bg-[#ff3d00] transition-colors"
                       >
                        <ShoppingBag size={18} />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[4rem] border border-dashed border-slate-200">
            <Heart className="mx-auto text-slate-200 mb-4" size={60} />
            <h2 className="text-2xl font-black text-slate-800">Your wishlist is empty</h2>
            <p className="text-slate-400 mt-2 mb-8">Save items you love to find them easily later.</p>
            <Link href="/customer/categories" className="bg-[#ff3d00] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
              Explore Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}