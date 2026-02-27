"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import {
  MapPin, Phone, Mail, Star, MessageCircle,
  Store, Loader2,
  ChevronDown, ChevronUp, Send, ShieldCheck,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard"; // Using the shared component
import toast from "react-hot-toast";

export default function BusinessProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [business, setBusiness] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Auth & Review States
  const [user, setUser] = useState<any>(null);
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [userRating, setUserRating] = useState(5);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    if (id) {
      fetchBusinessData();
      checkUser();
    }
  }, [id]);

  const fetchBusinessData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Business Profile
      const { data: bizData } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("id", id)
        .single();
      setBusiness(bizData);

      // 2. Fetch Products with business reviews (for the rating badge on ProductCard)
      const { data: prodData } = await supabase
        .from("products")
        .select(`
            *,
            business_profiles (
                shop_name,
                business_reviews (rating)
            )
        `)
        .eq("business_id", id)
        .eq("status", "active");
      setProducts(prodData || []);

      // 3. Fetch Business Reviews for the review section
      const { data: revData } = await supabase
        .from("business_reviews")
        .select("*")
        .eq("business_id", id)
        .order("created_at", { ascending: false });
      setReviews(revData || []);

    } catch (err) { 
        console.error(err); 
        toast.error("Failed to load business profile");
    } finally { 
        setLoading(false); 
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to leave a review");
      return;
    }
    if (!userComment.trim()) return;

    setSubmittingReview(true);
    try {
      const { error } = await supabase
        .from("business_reviews")
        .insert({
          business_id: id,
          user_id: user.id,
          user_email: user.email,
          rating: userRating,
          comment: userComment
        });

      if (error) {
        if (error.code === "23505") toast.error("You have already reviewed this shop!");
        else throw error;
      } else {
        setUserComment("");
        fetchBusinessData();
        toast.success("Review posted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error posting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-[#fcfcfd]">
        <Loader2 className="animate-spin text-[#ff3d00] mb-4" size={48} />
        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Loading Profile...</p>
    </div>
  );

  const memberSince = business?.created_at ? new Date(business.created_at).getFullYear() : "2024";
  const displayedProducts = showAllProducts ? products : products.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">

      {/* --- HERO SECTION --- */}
      <section className="relative bg-gradient-to-r from-[#ff3d00] to-orange-400 pt-28 pb-40 px-6 overflow-hidden">
        <div className="max-w-[1400px] mx-auto relative z-10">
            <button
            onClick={() => router.back()}
            className="group mb-8 flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/30 p-2 pr-4 rounded-full text-white hover:bg-white hover:text-slate-900 transition-all shadow-xl w-fit"
            >
            <div className="bg-white/20 group-hover:bg-slate-900 group-hover:text-white p-2 rounded-full transition-colors">
                <ChevronLeft size={18} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Go Back</span>
            </button>

            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/10">
                    <ShieldCheck size={14} /> {business?.is_approved ? "Verified Merchant" : "Pending Verification"}
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter capitalize leading-tight">
                    {business?.shop_name}
                </h1>
                <p className="text-white/90 max-w-2xl mx-auto font-medium text-lg leading-relaxed">
                    {business?.description || "Welcome to our premium marketplace collection."}
                </p>
            </div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
      </section>

      <main className="max-w-[1400px] mx-auto px-6 -mt-24 relative z-20">
        
        {/* --- BUSINESS INFO CARDS --- */}
        {/* --- BUSINESS INFO CARDS --- */}
<div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-16">
  {/* Address Card (Manual for special PIN styling) */}
  <div className="bg-white p-5 md:p-8 rounded-[1.8rem] md:rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col items-center text-center space-y-2 md:space-y-3 hover:translate-y-[-5px] transition-transform">
    <div className="w-10 h-10 md:w-14 md:h-14 bg-orange-50 rounded-xl md:rounded-2xl flex items-center justify-center text-[#ff3d00] shadow-inner">
      <MapPin size={20} className="md:w-6 md:h-6" />
    </div>
    <div className="space-y-1">
      <h4 className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</h4>
      <p className="text-slate-900 font-bold text-xs md:text-base leading-tight line-clamp-2">{business?.address}</p>
      <p className="text-[#ff3d00] text-[10px] font-black">PIN: {business?.pincode}</p>
    </div>
  </div>

  <DetailCard
    icon={<Phone size={20} />}
    title="Contact"
    value={business?.phone}
    subValue={business?.owner_name}
    isAction
  />
  
  <DetailCard
    icon={<Store size={20} />}
    title="Type"
    value={business?.business_type}
    subValue="Category"
  />

  <DetailCard
    icon={<Mail size={20} />}
    title="Email"
    value={business?.email}
    subValue={`Est. ${memberSince}`}
  />
</div>

        {/* --- PRODUCTS GRID SECTION --- */}
        <section className="bg-white rounded-[3rem] p-6 md:p-12 shadow-2xl shadow-slate-200/50 mb-16 border border-slate-50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter">
              Products by <span className="text-[#ff3d00]">{business?.shop_name}</span>
            </h2>
            {products.length > 4 && (
              <button
                onClick={() => setShowAllProducts(!showAllProducts)}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[#ff3d00] transition-all shadow-lg active:scale-95"
              >
                {showAllProducts ? <>View Less <ChevronUp size={16} /></> : <>Show All {products.length} <ChevronDown size={16} /></>}
              </button>
            )}
          </div>

          {/* GRID: 2 Columns on Mobile, 4 on Desktop */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
            {displayedProducts.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>

        {/* --- REVIEWS & FEEDBACK SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Review List */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <MessageCircle className="text-[#ff3d00]" /> Verified Reviews
            </h3>
            <div className="space-y-4">
              {reviews.length > 0 ? reviews.map((rev) => (
                <div key={rev.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                  <div className="flex justify-between mb-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-1 text-orange-400">
                        {[...Array(5)].map((_, i) => (
                            <Star 
                                key={i} 
                                size={12} 
                                fill={i < rev.rating ? "currentColor" : "none"} 
                                className={i >= rev.rating ? "text-slate-200" : ""} 
                            />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 lowercase">{rev.user_email}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(rev.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-600 font-medium text-sm leading-relaxed">"{rev.comment}"</p>
                </div>
              )) : (
                <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No feedback yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-xl border border-slate-50 h-fit sticky top-10">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Write a Review</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Tell us what you think of this shop</p>

            {!user ? (
              <div className="p-8 bg-slate-50 rounded-3xl text-center border border-slate-100">
                <p className="text-slate-600 font-bold text-sm mb-4">You need to be logged in to leave a review.</p>
                <Link href="/login" className="px-8 py-3 bg-[#ff3d00] text-white rounded-xl font-black text-xs uppercase tracking-widest inline-block hover:bg-slate-900 transition-colors">Sign In</Link>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div className="flex justify-between md:justify-start gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button" key={star}
                      onClick={() => setUserRating(star)}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${userRating >= star ? 'bg-[#ff3d00] text-white shadow-lg' : 'bg-slate-50 text-slate-300 hover:text-orange-200'}`}
                    >
                      <Star size={20} fill={userRating >= star ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Your feedback matters..."
                  className="w-full bg-slate-50 border-none rounded-[1.5rem] p-6 text-slate-900 font-medium focus:ring-2 focus:ring-[#ff3d00] outline-none min-h-[120px] transition-all shadow-inner"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                />
                <button
                  disabled={submittingReview}
                  className="w-full bg-slate-900 hover:bg-[#ff3d00] text-white py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  {submittingReview ? <Loader2 className="animate-spin" /> : <>Post Review <Send size={16} /></>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// Helper Component for Info Cards
function DetailCard({ icon, title, value, subValue, isAction }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col items-center text-center space-y-3 hover:translate-y-[-5px] transition-transform">
      <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-[#ff3d00] shadow-inner">{icon}</div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h4>
        <p className="text-slate-900 font-black text-lg">{value || "N/A"}</p>
        <p className="text-slate-400 text-xs font-bold">{subValue}</p>
      </div>
      {isAction && value && (
        <a href={`tel:${value}`} className="mt-2 text-[#ff3d00] text-[10px] font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Click to Call</a>
      )}
    </div>
  );
}