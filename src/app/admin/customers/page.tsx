"use client";

import React, { useEffect, useState } from "react";
import { 
  Users, 
  RefreshCw, 
  Search, 
  Mail, 
  Calendar, 
  Clock, 
  ShieldCheck,
  Activity,
  User,
  ArrowUpRight
} from "lucide-react";

export default function CustomerListPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/get-users")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
        else if (data?.users) setUsers(data.users);
        else setUsers([]);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (u.user_metadata?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans text-slate-900 pb-20">
      
      {/* --- REFINED SLATE HEADER --- */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-24 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-[3rem] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShieldCheck className="text-slate-400" size={14} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Administrative Core</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Member <span className="font-semibold text-slate-400">Database</span>
                </h1>
                <p className="text-slate-500 text-xs max-w-sm font-medium leading-relaxed">
                  Real-time authentication intelligence and user lifecycle monitoring across the unified platform.
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 min-w-[160px] shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Live Users</p>
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  </div>
                  <p className="text-4xl font-semibold text-slate-900">{users.length}</p>
                </div>
                
                <button 
                  onClick={fetchUsers} 
                  className="bg-slate-900 hover:bg-black text-white p-6 rounded-2xl transition-all shadow-xl active:scale-95 group"
                >
                  <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- SEARCH & DATA SECTION --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        
        {/* REFINED SEARCH BAR */}
        <div className="mb-10 max-w-2xl">
           <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Lookup by email, name or identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-2xl focus:border-slate-900 outline-none shadow-sm font-medium text-sm transition-all"
              />
           </div>
        </div>

        {/* DATA TABLE CONTAINER */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">User Identity</th>
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Registration Date</th>
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Last Session</th>
                  <th className="p-8 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 text-right">Security Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                      <RefreshCw className="animate-spin text-slate-200 mx-auto mb-4" size={40} />
                      <p className="font-bold text-[10px] uppercase tracking-widest text-slate-300">Syncing database...</p>
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="text-slate-200" size={32} />
                      </div>
                      <p className="font-bold text-xs uppercase tracking-widest text-slate-400">No matching records found</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="p-8">
                        <div className="flex items-center gap-5">
                          {/* Profile Hex/Circle */}
                          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-md group-hover:scale-105 transition-transform overflow-hidden">
                             {u.user_metadata?.name ? (
                               u.user_metadata.name.charAt(0).toUpperCase()
                             ) : (
                               <User size={18} />
                             )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 leading-none mb-1 text-sm tracking-tight group-hover:text-slate-600 transition-colors">
                              {u.user_metadata?.name || u.email.split('@')[0]}
                            </h4>
                            <div className="flex items-center gap-2 text-slate-400 font-medium text-[11px]">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs ">
                          <Calendar size={13} className="text-slate-300" />
                          {new Date(u.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="p-8">
                        <div className="flex items-center gap-2 text-slate-600 font-semibold text-xs ">
                          <Clock size={13} className="text-slate-300" />
                          {u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "PENDING FIRST SIGN-IN"}
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        {u.last_sign_in_at ? (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-bold uppercase tracking-widest border border-emerald-100">
                            <Activity size={10} className="animate-pulse" />
                            Verified
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-slate-100">
                            Inactive
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* TABLE FOOTER */}
          {!loading && (
            <div className="bg-slate-50/50 p-6 border-t border-slate-100 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Displaying {filteredUsers.length} total identities
              </p>
              <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-300">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Auth Engine Stable
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}