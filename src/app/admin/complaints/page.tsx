"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  AlertCircle, CheckCircle2, Clock, 
  Search, Eye, Filter, Loader2, X, Phone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

export default function ComplaintsAdmin() {
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [stats, setStats] = useState({ open: 0, pending: 0, resolved: 0 });

  // Add real-time listener or just fetch on mount
  useEffect(() => { 
    fetchComplaints(); 
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      // Ensure we select all columns exactly as they are in the DB
      const { data, error } = await supabase
        .from("complaints")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Supabase Error:", error);
        throw error;
      }

      console.log("Fetched Data:", data); // Check your console to see what the DB returns
      setComplaints(data || []);

      setStats({
        open: data?.filter(c => c.status === 'Open').length || 0,
        pending: data?.filter(c => c.status === 'In-Progress').length || 0,
        resolved: data?.filter(c => c.status === 'Resolved').length || 0,
      });
    } catch (err: any) {
      toast.error(`Fetch failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("complaints")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;

      toast.success(`Ticket marked as ${newStatus}`);
      fetchComplaints(); // Refresh list
      setSelectedTicket(null); // Close modal
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Improved filtering
  const filtered = complaints.filter(c => 
    (c.ticket_id?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (c.user_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
    (c.subject?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-[1600px] mx-auto p-1 space-y-4 bg-[#fcfcfc] min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Support Vault</h1>
          <p className="text-slate-500 text-sm font-bold">Monitor and resolve neighborhood grievances</p>
        </div>
        <button 
          onClick={fetchComplaints}
          className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#ff3d00] transition-all"
        >
          Refresh Data
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Critical / Open" value={stats.open} icon={<AlertCircle size={20} />} accent="#ef4444" />
        <StatCard label="Active Investigation" value={stats.pending} icon={<Clock size={20} />} accent="#f97316" />
        <StatCard label="Successfully Resolved" value={stats.resolved} icon={<CheckCircle2 size={20} />} accent="#22c55e" />
      </div>

      {/* SEARCH BAR */}
      <div className="relative">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Enter Ticket ID or Customer Name..."
          className="w-full pl-16 pr-6 py-5 bg-white border-2 border-slate-100 rounded-[2rem] outline-none focus:border-[#ff3d00] font-bold text-slate-700 shadow-xl shadow-slate-200/40 transition-all"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                <th className="p-8">Reference</th>
                <th className="p-8">Issue Details</th>
                <th className="p-8">Priority</th>
                <th className="p-8">Status</th>
                <th className="p-8 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="animate-spin mx-auto text-[#ff3d00]" size={40} />
                    <p className="mt-4 font-black text-slate-400 text-xs uppercase tracking-widest">Accessing Database...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center text-slate-400 font-bold italic">No records found.</td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-all group">
                    <td className="p-8">
                      <div className="font-black text-slate-900 text-base">{item.ticket_id}</div>
                      <div className="text-[11px] text-[#ff3d00] font-black uppercase mt-1 tracking-wider">{item.user_name}</div>
                    </td>
                    <td className="p-8">
                      <div className="font-bold text-slate-700 text-sm mb-1">{item.subject}</div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase">
                        <span className="bg-slate-100 px-2 py-0.5 rounded">{item.category}</span>
                        <span>•</span>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-8">
                      <PriorityBadge priority={item.priority} />
                    </td>
                    <td className="p-8">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => setSelectedTicket(item)}
                          className="p-4 bg-slate-900 text-white rounded-2xl hover:bg-[#ff3d00] transition-all shadow-lg hover:shadow-[#ff3d00]/20"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {selectedTicket && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden relative"
            >
              <div className="p-10 bg-slate-50 border-b border-slate-100 flex justify-between items-start">
                <div>
                  <span className="bg-[#ff3d00] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest mb-2 inline-block">
                    Ticket ID: {selectedTicket.ticket_id}
                  </span>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedTicket.subject}</h2>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="p-3 hover:bg-white rounded-full transition-colors text-slate-400">
                  <X size={24}/>
                </button>
              </div>

              <div className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                    <InfoBox label="Customer Name" value={selectedTicket.user_name} />
                    <InfoBox label="Contact (Phone/Email)" value={selectedTicket.user_email} />
                </div>
                
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Issue Description</label>
                    <div className="p-6 bg-slate-50 rounded-[2rem] text-slate-700 text-sm font-medium leading-relaxed border border-slate-100">
                        {selectedTicket.description}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                      onClick={() => updateStatus(selectedTicket.id, 'In-Progress')} 
                      className="flex-1 bg-white border-2 border-slate-100 text-slate-900 py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-all"
                    >
                      Move to Progress
                    </button>
                    <button 
                      onClick={() => updateStatus(selectedTicket.id, 'Resolved')} 
                      className="flex-1 bg-green-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-600 shadow-xl shadow-green-200 transition-all"
                    >
                      Mark Resolved
                    </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon, accent }: any) {
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/30 flex items-center gap-6 relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: accent }} />
      <div className="p-5 rounded-3xl group-hover:scale-110 transition-transform" style={{ backgroundColor: `${accent}10`, color: accent }}>{icon}</div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-4xl font-black text-slate-900 tracking-tighter">{value}</p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: any = {
    High: "bg-red-50 text-red-600",
    Medium: "bg-orange-50 text-orange-600",
    Low: "bg-blue-50 text-blue-600"
  };
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${styles[priority] || 'bg-slate-50'}`}>{priority}</span>;
}

function StatusBadge({ status }: { status: string }) {
  const dotColor: any = {
    Open: "bg-red-500",
    'In-Progress': "bg-orange-500",
    Resolved: "bg-green-500"
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${dotColor[status] || 'bg-slate-400'} animate-pulse`} />
      <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{status}</span>
    </div>
  );
}

function InfoBox({ label, value }: any) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-900">{value || 'Not Provided'}</p>
    </div>
  );
}