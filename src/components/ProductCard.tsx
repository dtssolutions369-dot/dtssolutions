"use client";

import React, { useState, useEffect } from "react";
import { ShoppingBag, Store, ArrowRight, Star, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import AuthModal from "@/components/AuthModal";

interface ProductCardProps {
  product: any;
  onShopClick: (shopName: string) => void;
}

export default function ProductCard({ product, onShopClick }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const reviews = product.business_profiles?.business_reviews || [];
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0
    ? (reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / reviewCount).toFixed(1)
    : null;

  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const finalPrice = discount > 0 ? Math.round(price - (price * discount) / 100) : price;

useEffect(() => {
  const checkStatus = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("wishlist")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();

    if (error) {
      console.log(error);
      return;
    }

    if (data) {
      setIsWishlisted(true);
    }
  };

  checkStatus();
}, [product.id]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAuthOpen(true); return; }

    if (isWishlisted) {
      await supabase.from("wishlist").delete().eq("user_id", user.id).eq("product_id", product.id);
      setIsWishlisted(false);
      toast.success("Removed from Vault");
    } else {
      await supabase.from("wishlist").insert([{ user_id: user.id, product_id: product.id }]);
      setIsWishlisted(true);
      toast.success("Saved to Vault!");
    }
  };

  return (
    <>
      <div className="group relative bg-white rounded-[1.5rem] md:rounded-[2.5rem] p-2 md:p-3 shadow-xl shadow-slate-200/50 hover:shadow-orange-200/40 transition-all duration-500 border border-slate-50 flex flex-col h-full">
        
        <div className="relative aspect-[10/11] rounded-[1.2rem] md:rounded-[2rem] overflow-hidden bg-slate-100 mb-3 md:mb-4">
          <img src={product.images?.[0] || "/placeholder-product.png"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] ease-in-out" />

          {/* RATING */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20">
            <div className="bg-white/90 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl flex items-center gap-1 shadow-sm border border-white/40">
              <Star size={10} className="text-[#ff3d00] fill-[#ff3d00]" />
              <span className="text-[10px] md:text-[11px] font-black text-slate-900">{averageRating || "5.0"}</span>
            </div>
          </div>

          {/* DISCOUNT */}
          {discount > 0 && (
            <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20">
              <div className="bg-[#ff3d00] text-white px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black shadow-lg">-{discount}%</div>
            </div>
          )}

          {/* WISHLIST */}
          <button onClick={handleWishlistClick} className={`absolute bottom-2 right-2 md:bottom-4 md:right-4 w-9 h-9 md:w-11 md:h-11 backdrop-blur-xl rounded-full flex items-center justify-center transition-all duration-300 z-30 shadow-xl active:scale-90 ${isWishlisted ? "bg-[#ff3d00] text-white" : "bg-white/90 text-slate-400 hover:text-[#ff3d00]"}`}>
            <ShoppingBag size={16} className={isWishlisted ? "fill-current" : ""} />
          </button>

          {/* SHOP TAG - CLICKING THIS NOW FORCES PRODUCT MODE IN GALLERY */}
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const shopName = product.business_profiles?.shop_name;
              if (shopName) onShopClick(shopName);
            }}
            className="absolute bottom-2 left-2 bg-slate-900/80 cursor-pointer hover:bg-[#ff3d00] transition-colors z-30 px-2 py-1.5 md:px-3 md:py-2 rounded-lg md:rounded-xl flex items-center gap-1.5 border border-white/10 max-w-[100px] md:max-w-[140px]"
          >
            <Store size={10} className="text-orange-400 shrink-0" />
            <span className="text-[8px] md:text-[9px] font-bold text-white uppercase truncate tracking-tight">
              {product.business_profiles?.shop_name || "Official"}
            </span>
          </div>
        </div>

        <div className="px-1 md:px-3 flex-grow flex flex-col justify-between">
          <h3 className="font-bold text-slate-900 text-sm md:text-lg leading-tight group-hover:text-[#ff3d00] transition-colors line-clamp-2 md:line-clamp-1 mb-2">{product.name}</h3>
          <div className="space-y-1">
            <div className="flex flex-wrap items-baseline gap-1 md:gap-2">
              <span className="text-lg md:text-2xl font-black text-slate-900 tracking-tighter">₹{finalPrice.toLocaleString()}</span>
              {discount > 0 && <span className="text-[10px] md:text-xs font-bold text-slate-300 line-through">₹{price.toLocaleString()}</span>}
            </div>
            <div className="flex items-center gap-1.5">
              {product.business_profiles?.is_verified && <ShieldCheck size={12} className="text-blue-500 shrink-0" />}
              <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{product.business_profiles?.business_type || "Retail"}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 md:mt-6">
          <Link href={`/customer/product/${product.id}`} className="group/btn w-full bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white py-3 md:py-4 rounded-xl md:rounded-[1.5rem] font-black text-[9px] md:text-[10px] uppercase tracking-widest text-center transition-all duration-300 flex items-center justify-center gap-2">
            <span>View Details</span>
            <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}