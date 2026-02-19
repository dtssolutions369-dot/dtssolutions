"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Box, Eye, TrendingUp, ShoppingBag, 
  BarChart3, PieChart as PieChartIcon, Loader2 
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function BusinessAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    stats: { totalProducts: 0, totalViews: 0, avgViews: 0, totalCategories: 0 },
    topProducts: [],
    categoryDistribution: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch Products for this business
      const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", session.user.id);

      if (error) throw error;

      // 2. Process Stats
      const totalViews = products?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;
      const categories = [...new Set(products?.map(p => p.category))];
      
      // 3. Process Category Distribution
      const catMap: any = {};
      products?.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      });
      const catData = Object.keys(catMap).map(key => ({
        name: key,
        value: catMap[key]
      }));

      setData({
        stats: {
          totalProducts: products?.length || 0,
          totalViews: totalViews,
          avgViews: products?.length ? (totalViews / products.length).toFixed(1) : 0,
          totalCategories: categories.length
        },
        topProducts: products?.sort((a, b) => b.views - a.views).slice(0, 5) || [],
        categoryDistribution: catData,
        allProducts: products || []
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa'];

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#fffcfb]">
      <Loader2 className="animate-spin text-orange-500" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffcfb] p-4 md:p-8 space-y-8 font-sans">
      <div>
        <h1 className="text-3xl font-black text-orange-600 tracking-tight">Analytics</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Track your product performance and insights</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<Box size={20}/>} label="Total Products" value={data.stats.totalProducts} color="text-blue-600" bg="bg-blue-600" />
        <StatCard icon={<Eye size={20}/>} label="Total Views" value={data.stats.totalViews} color="text-purple-600" bg="bg-purple-600" />
        <StatCard icon={<TrendingUp size={20}/>} label="Average Views" value={data.stats.avgViews} color="text-green-600" bg="bg-green-600" />
        <StatCard icon={<ShoppingBag size={20}/>} label="Categories" value={data.stats.totalCategories} color="text-orange-600" bg="bg-orange-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BAR CHART */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800">Top Performing Products</h3>
            <p className="text-xs text-slate-400">Products with the most views</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.topProducts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} angle={-45} textAnchor="end" height={60} />
                <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                <Tooltip cursor={{fill: '#fff7ed'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                <Bar dataKey="views" fill="#f97316" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART */}
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
          <div className="mb-6">
            <h3 className="font-bold text-slate-800">Category Distribution</h3>
            <p className="text-xs text-slate-400">Products by category</p>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.categoryDistribution} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {data.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" layout="vertical" align="right" verticalAlign="middle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ALL PRODUCTS PERFORMANCE LIST */}
      <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="mb-8">
          <h3 className="font-bold text-slate-800">All Products Performance</h3>
          <p className="text-xs text-slate-400">Detailed view of all your products</p>
        </div>
        <div className="space-y-4">
          {data.allProducts?.map((product: any) => (
            <div key={product.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
              <div className="flex flex-col">
                <span className="font-bold text-slate-700 group-hover:text-orange-600 transition-colors">{product.name}</span>
                <span className="text-xs text-slate-400 font-medium">{product.category} • {product.sub_category} • ₹{product.price}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5 text-slate-600 font-bold">
                      <Eye size={14} />
                      <span>{product.views || 0}</span>
                   </div>
                   <span className="text-[10px] text-slate-400 uppercase tracking-tighter">views</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-slate-300 group-hover:bg-orange-400 transition-all" 
                    style={{ width: `${Math.min((product.views / (data.stats.totalViews || 1)) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className={`w-10 h-10 rounded-xl ${bg} bg-opacity-10 flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-800 mt-1">{value}</p>
      </div>
    </div>
  );
}