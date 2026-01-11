"use client";

import React, { useEffect, useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import toast, { Toaster } from 'react-hot-toast';
import {
  X, Lock, Check, ShieldCheck, Zap,
  ArrowRight, Loader, Star, Eye, PhoneCall, Sparkles, Briefcase,
} from "lucide-react";

type SubscriptionPlan = {
  id: number;
  name: string;
  base_price: number;
  tax_percent: number;
  duration_months: number;
  benefits: string[];
  color: string | null;
};

export default function SubscriptionPlanPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userStatus, setUserStatus] = useState<{ active: boolean, expiry: string | null, currentPlanId: number | null }>({ active: false, expiry: null, currentPlanId: null });
  const [isVendor, setIsVendor] = useState(false);

  useEffect(() => {
    fetchPlans();
    checkUserAndSubscription();
  }, []);

  const checkUserAndSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsLoggedIn(false);
      setLoading(false);
      return;
    }
    setIsLoggedIn(true);

    const { data: vendor } = await supabase
      .from("vendor_register")
      .select("subscription_expiry, subscription_plan_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!vendor) {
      setIsVendor(false);
      setLoading(false);
      return;
    }
    setIsVendor(true);

    if (vendor?.subscription_expiry) {
      const expiryDate = new Date(vendor.subscription_expiry);
      if (expiryDate > new Date()) {
        setUserStatus({
          active: true,
          expiry: expiryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          currentPlanId: vendor.subscription_plan_id
        });
      }
    }
    setLoading(false);
  };

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .order("base_price", { ascending: true });
    setPlans(data || []);
  };

  const calculateTotal = (base: number, tax: number) =>
    Math.round(base + (base * tax) / 100);

  const handleAction = async (plan: SubscriptionPlan) => {
    if (!isLoggedIn) {
      setShowAuthModal(true);
      return;
    }
    if (!isVendor) {
      toast.error("Please register as a vendor first.");
      router.push('/provider/register');
      return;
    }
    handlePayment(plan);
  };

  const handlePayment = async (plan: SubscriptionPlan) => {
    if (!(window as any).Razorpay) {
      toast.error("Payment system loading...");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const totalAmount = calculateTotal(plan.base_price, plan.tax_percent) * 100;

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: totalAmount,
      currency: "INR",
      name: "QickTick",
      description: `Subscription to ${plan.name}`,
      handler: async function (response: any) {
        const paymentId = response.razorpay_payment_id;
        const currentExpiry = userStatus.active ? new Date(userStatus.expiry!) : new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setMonth(newExpiry.getMonth() + plan.duration_months);

        const { error } = await supabase
          .from("vendor_register")
          .update({
            subscription_expiry: newExpiry.toISOString().split('T')[0],
            subscription_plan_id: plan.id,
            payment_id: paymentId
          })
          .eq("user_id", user?.id);

        if (error) {
          toast.error("Error updating subscription.");
        } else {
          toast.success("Subscription updated successfully!");
          window.location.reload();
        }
      },
      prefill: { name: user?.user_metadata?.full_name || "", email: user?.email },
      theme: { color: "#F59E0B" },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF5]">
        <Loader className="animate-spin text-yellow-600" size={40} />
        <p className="text-gray-900 font-black uppercase tracking-[0.3em] text-[10px] mt-4">Initializing Marketplace</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-gray-900 font-sans selection:bg-yellow-200 pb-16 overflow-x-hidden">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Toaster position="top-right" />

      {/* --- AUTH MODAL (Compact) --- */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] shadow-2xl max-w-xs w-full relative z-10 p-8 text-center border-t-4 border-yellow-500">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                <X size={20} />
              </button>
              <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock size={22} className="text-yellow-600" />
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2 uppercase tracking-tighter">Identity Check</h2>
              <p className="text-gray-500 text-xs mb-6">Please login to access ecosystem pricing.</p>
              <button onClick={() => router.push('/login')} className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold text-sm">
                Go to Login
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HERO SECTION (Reduced Padding) --- */}
      <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-12 pb-32 px-6 relative border-b border-yellow-100">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {userStatus.active && (
            <div className="inline-flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full mb-4 border border-green-200">
              <span className="h-1.5 w-1.5 rounded-full bg-green-600 animate-pulse" />
              <span className="text-[9px] font-black uppercase tracking-widest text-green-700">
                Active until {userStatus.expiry}
              </span>
            </div>
          )}
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none uppercase">
            SCALE YOUR <br /> <span className="text-red-600 italic">BUSINESS</span>
          </h1>
          <p className="mt-4 text-gray-500 font-bold text-sm max-w-xl mx-auto leading-relaxed">
            Choose a protocol to unlock verified leads and priority ecosystem support.
          </p>
        </div>
      </div>

      {/* --- PLANS GRID (Compact Widths) --- */}
      <div className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-center">
          {plans.map((plan, idx) => {
            const totalPrice = calculateTotal(plan.base_price, plan.tax_percent);
            const isCurrentPlan = userStatus.active && plan.id === userStatus.currentPlanId;
            
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex"
              >
                <div className={`w-full bg-white rounded-[2.5rem] shadow-lg p-8 flex flex-col border-2 transition-all ${isCurrentPlan ? 'border-green-500 ring-4 ring-green-50' : 'border-white hover:border-yellow-300'}`}>
                  
                  {isCurrentPlan ? (
                    <div className="bg-green-500 text-white text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full w-fit mb-3">
                      Current Active Protocol
                    </div>
                  ) : (
                    <div className="text-[8px] font-black uppercase tracking-widest text-gray-400 mb-3 italic">
                      Tier {idx + 1} System
                    </div>
                  )}

                  <h3 className="text-xl font-black text-gray-900 mb-1 leading-tight uppercase tracking-tight">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-black text-gray-900 tracking-tighter">₹{totalPrice}</span>
                    <span className="text-gray-400 font-bold text-[10px]">/ {plan.duration_months}MO</span>
                  </div>

                  <div className="space-y-3 mb-8 flex-grow border-t border-gray-50 pt-6">
                    {plan.benefits.map((benefit, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="bg-green-50 p-0.5 rounded-sm mt-0.5 shrink-0">
                          <Check size={10} className="text-green-600" />
                        </div>
                        <span className="text-gray-600 text-[11px] font-bold uppercase tracking-tight">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAction(plan)}
                    disabled={isCurrentPlan}
                    className={`w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 
                      ${isCurrentPlan 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                        : 'bg-gray-900 text-white hover:bg-red-600 hover:-translate-y-1 shadow-md active:scale-95'}`}
                  >
                    {!isLoggedIn ? "Login to Purchase" : !isVendor ? "Vendor Registry Req." : isCurrentPlan ? "Active Protocol" : "Deploy Plan"} 
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}