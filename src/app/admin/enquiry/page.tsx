"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Eye, X, Calendar, Mail, Search, RefreshCw, Loader2, 
  Hash, ShieldCheck, ArrowRight, Trash2, AlertTriangle,
  MessageSquare, Inbox
} from "lucide-react";

type Enquiry = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  created_at: string | null;
};

export default function EnquiriesPage() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [enquiryToDelete, setEnquiryToDelete] = useState<Enquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchEnquiries = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enquiries")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setEnquiries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEnquiries(); }, []);

  const deleteEnquiry = async () => {
    if (!enquiryToDelete) return;
    setIsDeleting(true);
    const { error } = await supabase.from("enquiries").delete().eq("id", enquiryToDelete.id);

    if (!error) {
      setEnquiries(enquiries.filter(e => e.id !== enquiryToDelete.id));
      setEnquiryToDelete(null);
      if (selectedEnquiry?.id === enquiryToDelete.id) setSelectedEnquiry(null);
    }
    setIsDeleting(false);
  };

  const filteredEnquiries = useMemo(() => {
    return enquiries.filter(e =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [enquiries, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-20">
      
      {/* --- HEADER SECTION --- */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-24 px-6 md:px-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShieldCheck className="text-slate-400" size={14} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Communication Hub</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Customer <span className="font-semibold text-slate-400">Enquiries</span>
                </h1>
                <p className="text-slate-500 text-xs max-w-sm font-medium leading-relaxed">
                  Management interface for inbound signals and client correspondence.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 min-w-[160px] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Signals</p>
                    <MessageSquare size={14} className="text-blue-500" />
                  </div>
                  <p className="text-4xl font-semibold text-slate-900">{enquiries.length}</p>
                </div>
                
                <button 
                  onClick={fetchEnquiries} 
                  className="bg-slate-900 hover:bg-black text-white p-6 rounded-2xl transition-all shadow-xl active:scale-95 group"
                >
                  <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        <div className="mb-10 max-w-2xl">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input 
                placeholder="Search by name or email identity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none shadow-sm font-medium text-sm transition-all"
              />
           </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Sender Identity</th>
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Contact Email</th>
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Received</th>
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center text-slate-300">
                      <Loader2 className="animate-spin mx-auto mb-4" size={32} />
                      <p className="text-[10px] font-bold uppercase tracking-widest">Scanning Network...</p>
                    </td>
                  </tr>
                ) : filteredEnquiries.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                      <Inbox className="mx-auto mb-4 text-slate-200" size={40} />
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No signals detected</p>
                    </td>
                  </tr>
                ) : filteredEnquiries.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center text-white text-xs font-bold shadow-md">
                          {e.name.charAt(0)}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm tracking-tight">{e.name}</h4>
                      </div>
                    </td>
                    <td className="p-8 text-xs font-semibold text-slate-500">{e.email}</td>
                    <td className="p-8">
                      <div className="flex items-center gap-2 text-slate-400 font-bold text-[11px]">
                        <Calendar size={12} />
                        {e.created_at ? new Date(e.created_at).toLocaleDateString() : "N/A"}
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEnquiryToDelete(e)} className="p-3 text-slate-300 hover:text-red-600 transition-colors">
                          <Trash2 size={16} />
                        </button>
                        <button 
                          onClick={() => setSelectedEnquiry(e)}
                          className="px-5 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all shadow-sm flex items-center gap-2"
                        >
                          <Eye size={12} /> Dossier
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- MODAL: DELETE CONFIRMATION --- */}
      {enquiryToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center z-[100] p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in duration-200 text-center">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-2">Delete Record?</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-8">
              Permanently remove enquiry from <span className="font-bold text-slate-900">{enquiryToDelete.name}</span>? This action is irreversible.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setEnquiryToDelete(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-slate-200 transition-all">Cancel</button>
              <button 
                onClick={deleteEnquiry} 
                className="flex-1 py-4 bg-red-600 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all"
              >
                {isDeleting ? "Processing..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DOSSIER VIEW --- */}
      {selectedEnquiry && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md flex justify-center items-center z-50 p-4">
          <div className="bg-white w-full max-w-3xl rounded-[2.5rem] overflow-hidden shadow-2xl relative animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col md:flex-row min-h-[450px]">
              {/* Sidebar Info */}
              <div className="md:w-1/3 bg-slate-50 p-10 flex flex-col border-r border-slate-100">
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-4">
                    <Hash size={12} /> {selectedEnquiry.id}
                  </div>
                  <h2 className="text-3xl font-light text-slate-900 leading-tight mb-2">Message <span className="font-semibold text-slate-400">Dossier</span></h2>
                </div>
                <div className="mt-auto pt-6 border-t border-slate-200">
                  <button onClick={() => { setEnquiryToDelete(selectedEnquiry); }} className="flex items-center gap-2 text-red-500 font-bold uppercase text-[9px] tracking-widest hover:text-red-700 transition-colors">
                    <Trash2 size={12}/> Erase Record
                  </button>
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 p-10 bg-white relative">
                <button className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors" onClick={() => setSelectedEnquiry(null)}>
                  <X size={20} />
                </button>

                <div className="mb-8">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">Metadata</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Sender</p>
                      <p className="text-xs font-bold text-slate-900">{selectedEnquiry.name}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Timestamp</p>
                      <p className="text-xs font-bold text-slate-900">{new Date(selectedEnquiry.created_at!).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <h4 className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-4">Signal Content</h4>
                  <div className="bg-slate-900 p-8 rounded-2xl">
                    <p className="text-slate-200 text-sm font-medium leading-relaxed italic">
                      "{selectedEnquiry.message}"
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setSelectedEnquiry(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all">Dismiss</button>
                  <button 
                    onClick={() => window.location.href = `mailto:${selectedEnquiry.email}`} 
                    className="flex-[2] py-4 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                  >
                    Send Response <ArrowRight size={14}/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}