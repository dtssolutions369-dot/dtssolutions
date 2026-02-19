"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import { supabase } from "@/lib/supabaseClient";
import {
  CheckCircle2, Zap, ArrowRight,
  Loader2, Star, Crown, Trophy, 
  Calendar, ShieldCheck, Sparkles, Clock, Check,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function SubscriptionPlans() {
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  useEffect(() => {
    initData();
    // Fallback: Check if Razorpay already exists in window (prevents stuck "loading" state)
    if ((window as any).Razorpay) {
      setIsSdkLoaded(true);
    }
  }, []);

  const initData = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const [planRes, profileRes] = await Promise.all([
        supabase.from("subscription_plans").select("*").order("base_price", { ascending: true }),
        supabase.from("business_profiles").select("*").eq("user_id", session.user.id).single()
      ]);

      setPlans(planRes.data || []);
      setProfile(profileRes.data);
    } catch (error) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  };

const handlePayment = async (plan: any) => {
    if (!isSdkLoaded && !(window as any).Razorpay) {
      toast.error("Payment system is still initializing. Please wait 2 seconds.");
      return;
    }

    setProcessingId(plan.id);
    const totalPrice = Number(plan.base_price) * (1 + Number(plan.tax_percent) / 100);

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SC36vr8GUe7tVz",
      amount: Math.round(totalPrice * 100),
      currency: "INR",
      // DYNAMIC: Uses the selected plan name for Razorpay popup
      name: plan.name, 
      description: `Upgrade to ${plan.name} Tier`,
      handler: async function (response: any) {
        try {
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + plan.duration_months);

          const { error } = await supabase
            .from("business_profiles")
            .update({
              current_plan_id: parseInt(plan.id),
              subscription_status: 'active',
              subscription_start_date: new Date().toISOString(),
              subscription_end_date: expiryDate.toISOString(),
            })
            .eq("id", profile.id);

          if (error) throw error;
          
          // DYNAMIC: Uses the selected plan name in the success message
          toast.success(`Welcome to the ${plan.name} Tier! Products Activated.`);
          initData();
        } catch (err: any) {
          console.error(err);
          toast.error("Activation failed. Please contact support.");
        }
      },
      prefill: {
        name: profile?.owner_name || "",
        email: profile?.email || "",
      },
      theme: { color: "#ea580c" }
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Could not open Razorpay gateway.");
    } finally {
      setProcessingId(null);
    }
  };

  const isPremium = profile?.subscription_status === 'active';
  const currentPlan = plans.find(p => p.id === profile?.current_plan_id);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-orange-50">
      <Loader2 className="animate-spin text-orange-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20 font-sans text-slate-900">
      <Toaster position="top-center" />
      
      {/* Script with strategy to load faster */}
      <Script 
        id="razorpay-checkout"
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="afterInteractive"
        onLoad={() => setIsSdkLoaded(true)} 
        onError={() => toast.error("Failed to load payment gateway.")}
      />

      <div className="bg-white border-b border-orange-100 shadow-sm px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-slate-900 leading-tight">
              Unlock Your <span className="text-orange-600">Growth</span>
            </h1>
            <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Upgrade your business profile</p>
          </div>

          <div className="flex items-center gap-3 bg-orange-600 text-white px-6 py-3 rounded-2xl shadow-lg shadow-orange-200">
             {isPremium ? <Crown size={20} /> : <Zap size={20} />}
             <div className="leading-none">
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">Active Status</p>
                <p className="text-sm font-bold">{isPremium ? currentPlan?.name : "Trial Period"}</p>
             </div>
             <div className="h-8 w-[1px] bg-white/20 mx-2" />
             <div className="text-right leading-none">
                <p className="text-[10px] font-black opacity-80 uppercase tracking-widest">
                    {isPremium ? "Renew On" : "Trial Ends"}
                </p>
                <p className="text-sm font-bold">
                    {new Date(isPremium ? profile.subscription_end_date : profile.trial_end_date).toLocaleDateString()}
                </p>
             </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const isCurrent = profile?.current_plan_id === plan.id;
            const isPopular = plan.is_popular;
            
            return (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`bg-white rounded-[2.5rem] p-8 border-2 flex flex-col relative transition-all ${
                  isPopular 
                  ? 'border-orange-500 shadow-2xl shadow-orange-100' 
                  : 'border-white shadow-xl shadow-slate-200/50'
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 right-10 bg-orange-600 text-white text-[10px] font-black px-4 py-2 rounded-b-xl uppercase tracking-widest">
                    Best Seller
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${isPopular ? 'bg-orange-50 text-orange-600' : 'bg-slate-50 text-slate-400'}`}>
                  {plan.medals === 'Crown' ? <Crown size={30} /> : <Trophy size={30} />}
                </div>

                <h3 className="text-2xl font-black text-slate-900">{plan.name}</h3>
                <div className="flex items-baseline gap-1 my-6">
                  <span className="text-5xl font-black text-slate-900">₹{plan.base_price}</span>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">/ {plan.duration_months} Months</span>
                </div>

                <div className="space-y-4 mb-10 flex-grow border-t border-slate-50 pt-8">
                  {plan.benefits.map((b: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1 bg-orange-100 rounded-full p-0.5">
                        <Check size={14} className="text-orange-600 stroke-[4px]" />
                      </div>
                      <span className="text-slate-600 font-bold text-sm">{b}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handlePayment(plan)}
                  disabled={processingId === plan.id || isCurrent}
                  className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    isCurrent 
                    ? 'bg-slate-100 text-slate-400'
                    : isPopular
                      ? 'bg-orange-600 text-white hover:bg-slate-900 shadow-lg shadow-orange-200'
                      : 'bg-slate-900 text-white hover:bg-orange-600'
                  }`}
                >
                  {processingId === plan.id ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : isCurrent ? (
                    "Plan Active"
                  ) : (
                    <>Activate Plan <ArrowRight size={16} /></>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}