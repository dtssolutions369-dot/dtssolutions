"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Loader2, ShoppingBag, ArrowLeft, Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import AuthModal from "@/components/AuthModal";
// Import your existing ProductCard component
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchWishlist(user.id);
    else setLoading(false);
  };

  const fetchWishlist = async (userId: string) => {
    setLoading(true);
    // We select products and their nested business profile/reviews 
    // to satisfy the ProductCard's logic requirements
    const { data, error } = await supabase
      .from("wishlist")
      .select(`
        id,
        products (
          *,
          business_profiles (
            *,
            business_reviews (*)
          )
        )
      `)
      .eq("user_id", userId);

    if (error) {
      toast.error("Could not load wishlist");
    } else {
      // Map the data so we pass the actual product object to the card
      const formattedProducts = (data || []).map((item: any) => item.products);
      setItems(formattedProducts);
    }
    setLoading(false);
  };

  // This handles removing the item from the UI list if the user 
  // clicks the "ShoppingBag" button inside the ProductCard
  const handleRemoveFromUI = (productId: string) => {
    setItems((prev) => prev.filter((p) => p.id !== productId));
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#ff3d00] mb-4" size={48} />
        <p className="text-slate-400 font-bold animate-pulse">Syncing your favorites...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#fcfcfc] flex items-center justify-center px-6">
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        <div className="max-w-md w-full text-center space-y-8 p-10 bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <div className="relative mx-auto w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center text-[#ff3d00]">
            <Lock size={40} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Members Only</h1>
          <button onClick={() => setIsAuthModalOpen(true)} className="w-full bg-[#ff3d00] text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest">
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfc] pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-6 pt-12">
        <header className="mb-10 space-y-6">
          <Link href="/customer/categories" className="inline-flex items-center gap-2 text-slate-400 font-bold text-sm hover:text-[#ff3d00] transition-colors group">
            <div className="p-2 rounded-full bg-white shadow-sm group-hover:bg-orange-50 transition-colors">
                <ArrowLeft size={16} /> 
            </div>
            Back to Shopping
          </Link>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-none">
            My <span className="text-[#ff3d00]">Wishlist</span>
          </h1>
        </header>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence mode="popLayout">
              {items.map((product) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  key={product.id}
                >
                  {/* Reusing the component from your local path */}
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[3.5rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
             <ShoppingBag className="text-slate-200 mb-6" size={48} />
             <h2 className="text-3xl font-black text-slate-800 tracking-tight">Your wishlist is empty</h2>
             <Link href="/customer/categories" className="mt-8 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#ff3d00] transition-all">
               Start Exploring
             </Link>
          </div>
        )}
      </div>
    </div>
  );
}