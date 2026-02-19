"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  AlertCircle, CheckCircle2, Clock, 
  MessageSquare, Search, Eye, Filter, Loader2, X 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function ComplaintsPage() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [stats, setStats] = useState({ open: 0, pending: 0, resolved: 0 });

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setComplaints(data || []);

      setStats({
        open: data?.filter(c => c.status === 'Open').length || 0,
        pending: data?.filter(c => c.status === 'In-Progress').length || 0,
        resolved: data?.filter(c => c.status === 'Resolved').length || 0,
      });
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("complaints")
      .update({ status: newStatus })
      .eq("id", id);
    
    if (!error) {
      toast.success(`Status updated to ${newStatus}`);
      fetchComplaints();
      setSelectedTicket(null);
    }
  };

  const filtered = complaints.filter(c => 
    c.ticket_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-6 space-y-8 bg-[#fcfcfc] min-h-screen">
      <Toaster />
      
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Complaints & Support</h1>
        <p className="text-slate-500 text-sm font-medium">Manage and resolve user grievances</p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Open Tickets" value={stats.open} icon={<AlertCircle className="text-red-500" />} color="border-red-500" />
        <StatCard label="In Progress" value={stats.pending} icon={<Clock className="text-orange-500" />} color="border-orange-500" />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="text-green-500" />} color="border-green-500" />
      </div>

      {/* SEARCH AND FILTER */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by Ticket ID, User, or Subject..."
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl outline-none focus:ring-2 ring-orange-500/10 font-bold text-sm shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="px-6 py-4 bg-white border border-slate-100 rounded-2xl font-bold text-sm text-slate-600 flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
          <Filter size={18} /> Filter
        </button>
      </div>

      {/* COMPLAINTS TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-50">
                <th className="p-6">Ticket & User</th>
                <th className="p-6">Issue Subject</th>
                <th className="p-6">Priority</th>
                <th className="p-6">Category</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={6} className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-orange-500" /></td></tr>
              ) : filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-6">
                    <div className="font-black text-slate-900 text-sm">{item.ticket_id}</div>
                    <div className="text-[11px] text-slate-400 font-bold">{item.user_name}</div>
                  </td>
                  <td className="p-6">
                    <div className="font-bold text-slate-700 text-sm max-w-[200px] truncate">{item.subject}</div>
                    <div className="text-[10px] text-slate-400 font-medium italic">
                        {new Date(item.created_at).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="p-6">
                    <PriorityBadge priority={item.priority} />
                  </td>
                  <td className="p-6 text-xs font-bold text-slate-500 uppercase tracking-tight">
                    {item.category}
                  </td>
                  <td className="p-6">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => setSelectedTicket(item)}
                        className="p-3 bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL VIEW MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-800">{selectedTicket.ticket_id}</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ticket Details</p>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <InfoBox label="Customer" value={selectedTicket.user_name} />
                    <InfoBox label="Email" value={selectedTicket.user_email} />
                    <InfoBox label="Category" value={selectedTicket.category} />
                    <InfoBox label="Date" value={new Date(selectedTicket.created_at).toLocaleString()} />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Description</label>
                    <div className="p-4 bg-slate-50 rounded-2xl text-slate-700 text-sm leading-relaxed">
                        {selectedTicket.description}
                    </div>
                </div>

                <div className="flex gap-3 pt-4">
                    <button onClick={() => updateStatus(selectedTicket.id, 'In-Progress')} className="flex-1 bg-orange-50 text-orange-600 py-4 rounded-2xl font-black text-xs hover:bg-orange-100 transition-all">Mark In-Progress</button>
                    <button onClick={() => updateStatus(selectedTicket.id, 'Resolved')} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black text-xs hover:bg-green-700 shadow-lg shadow-green-100 transition-all">Resolve Ticket</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// UI HELPERS
function StatCard({ label, value, icon, color }: any) {
    return (
      <div className={`bg-white p-8 rounded-3xl border border-slate-100 border-l-[8px] ${color} shadow-sm flex items-center gap-6`}>
        <div className="p-4 bg-slate-50 rounded-2xl">{icon}</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-4xl font-black text-slate-800 tracking-tighter">{value}</p>
        </div>
      </div>
    );
}

function PriorityBadge({ priority }: { priority: string }) {
    const colors: any = {
        High: "bg-red-50 text-red-600 border-red-100",
        Medium: "bg-orange-50 text-orange-600 border-orange-100",
        Low: "bg-blue-50 text-blue-600 border-blue-100"
    };
    return <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase ${colors[priority]}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
    const colors: any = {
        Open: "text-red-500",
        'In-Progress': "text-orange-500",
        Resolved: "text-green-500",
        Closed: "text-slate-400"
    };
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-slate-400'} animate-pulse`} />
            <span className="text-xs font-black text-slate-700">{status}</span>
        </div>
    );
}

function InfoBox({ label, value }: any) {
    return (
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-bold text-slate-800 mt-0.5">{value || 'N/A'}</p>
        </div>
    );
}