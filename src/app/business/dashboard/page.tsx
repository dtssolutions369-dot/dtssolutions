"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Package, Eye, Calendar, CheckCircle2, 
  PlusCircle, Store, BarChart3, ArrowRight 
} from "lucide-react";
import Link from "next/link";

export default function BusinessDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalViews: 0, // Placeholder for future analytics
    daysRemaining: 45,
    isApproved: false,
    businessName: "Business"
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Get Business Profile Info
      const { data: profile } = await supabase
        .from("business_profiles")
        .select("id, shop_name, is_approved, created_at")
        .eq("user_id", user.id)
        .single();

      if (profile) {
        // 2. Count Products for this business
        const { count, error } = await supabase
          .from("products")
          .select("*", { count: 'exact', head: true })
          .eq("business_id", profile.id);

        // 3. Calculate Trial Days (Simple Logic)
        const createdAt = new Date(profile.created_at);
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - createdAt.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const remaining = Math.max(0, 45 - diffDays);

        setStats({
          totalProducts: count || 0,
          totalViews: 0, 
          daysRemaining: remaining,
          isApproved: profile.is_approved,
          businessName: profile.shop_name
        });
      }
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-10 animate-pulse text-slate-400">Loading Dashboard...</div>;

  return (
    <div className="p-8 bg-[#f8fafc] min-h-screen w-full">
      {/* Welcome Header */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-[#ff3d00]">
          Welcome back, {stats.businessName}!
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your business today.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={<Package className="text-blue-600" />} label="Total Products" value={stats.totalProducts} color="blue" />
        <StatCard icon={<Calendar className="text-green-600" />} label="Days Remaining" value={stats.daysRemaining} color="green" />
        <StatCard 
          icon={<CheckCircle2 className={stats.isApproved ? "text-emerald-600" : "text-amber-600"} />} 
          label="Status" 
          value={stats.isApproved ? "Approved" : "Pending"} 
          color={stats.isApproved ? "emerald" : "amber"} 
        />
      </div>

      {/* Subscription Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-2 text-blue-800 font-bold mb-2">
          <BarChart3 size={18} />
          <span>Subscription Status</span>
        </div>
        <p className="text-blue-600 text-sm mb-4">Free Trial - {stats.daysRemaining} days remaining</p>
        <div className="bg-white rounded-xl p-4 text-sm text-slate-600 border border-blue-100">
          You're currently on a <span className="font-bold text-slate-900">free trial</span>. Upgrade to a paid plan before it expires to continue enjoying all features.
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <ActionCard href="/business/products" icon={<PlusCircle className="text-orange-500" />} title="Add Product" desc="Upload new products to your catalog" />
        <ActionCard href="/business/profile" icon={<Store className="text-violet-500" />} title="Business Profile" desc="Update your business information" />
        <ActionCard href="/business/analytics" icon={<BarChart3 className="text-blue-500" />} title="View Analytics" desc="Track your business performance" />
      </div>

      {/* Recent Products Header */}
      <div className="flex justify-between items-center border-t pt-8">
        <h3 className="font-bold text-slate-800">Recent Products</h3>
        <Link href="/business/products" className="text-[#ff3d00] text-sm font-bold flex items-center gap-1 hover:underline">
          View All <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
    </div>
  );
}

function ActionCard({ icon, title, desc, href }: any) {
  return (
    <Link href={href} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:border-orange-200 transition-all group">
      <div className="bg-slate-50 w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900">{title}</h4>
      <p className="text-slate-500 text-xs mt-1">{desc}</p>
    </Link>
  );
}