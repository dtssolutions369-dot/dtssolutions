"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Upload, MapPin, User, Building, Phone, Mail,
  CheckCircle2, Loader, Briefcase, Sparkles,
  Globe, ShieldCheck, ArrowRight, AlertCircle, X, Image as ImageIcon, Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
type FormData = {
    name: string;
    company: string;
    phone: string;
    email: string;
    state: string;
    city: string;
    address: string;
};

type YellowInputProps = {
    label: string;
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
    type?: string;
};

export default function AddBusinessPage() {
    const [formData, setFormData] = useState<FormData>({
        name: "", company: "", phone: "", email: "", state: "", city: "", address: ""
    });
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastData, setToastData] = useState<{ title: string; subtitle: string; isError?: boolean } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase
            .from("businesses")
            .insert([{
                name: formData.name,
                company: formData.company,
                phone: formData.phone,
                email: formData.email || null,
                country: "India",
                state: formData.state,
                city: formData.city,
                preferred_address: formData.address,
                business_details: "Submitted via add business form",
            }]);

        setIsSubmitting(false);

        if (error) {
            setToastData({ title: "Submission Failed", subtitle: error.message, isError: true });
        } else {
            setToastData({ title: "Submitted Successfully", subtitle: "Your business has been saved" });
            setFormData({ name: "", company: "", phone: "", email: "", state: "", city: "", address: "" });
            setFile(null);
        }
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    return (
        <div className="min-h-screen bg-[#FFFDF5] pb-10 font-sans selection:bg-yellow-200">

            {/* --- COMPACT TOAST --- */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: -20, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        className="fixed bottom-0 inset-x-0 z-[9999] flex justify-center px-4 pointer-events-none"
                    >
                        <div className="bg-gray-900 text-white px-6 py-4 rounded-3xl shadow-2xl flex items-center gap-4 pointer-events-auto border border-white/10">
                            <div className={`${toastData?.isError ? 'bg-red-500' : 'bg-yellow-400'} p-1.5 rounded-full`}>
                                <Zap className="text-black" size={14} fill="currentColor" />
                            </div>
                            <div className="flex flex-col">
                                <span className="font-black italic uppercase tracking-widest text-[10px] leading-tight">
                                    {toastData?.title}
                                </span>
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                    {toastData?.subtitle}
                                </span>
                            </div>
                            <button onClick={() => setShowToast(false)} className="ml-2 text-white/30 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- HEADER (Reduced Height) --- */}
            <div className="bg-gradient-to-b from-[#FEF3C7] to-[#FFFDF5] pt-16 pb-32 px-6 relative overflow-hidden border-b border-yellow-100">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#F59E0B_0.5px,transparent_0.5px)] [background-size:24px_24px]" />
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full mb-4 shadow-sm border border-yellow-300">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-600"></span>
                            </span>
                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-yellow-800">Global Vendor Onboarding</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 leading-none">
                            LIST YOUR <br />
                            <span className="text-red-600 italic">BUSINESS</span>
                        </h1>
                    </div>
                    <div className="hidden lg:block bg-white p-8 rounded-[2.5rem] -rotate-3 shadow-xl border border-yellow-100">
                        <Briefcase size={50} className="text-yellow-600" />
                    </div>
                </div>
            </div>

            {/* --- FORM CONTAINER --- */}
            <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* IDENTITY SECTION */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-yellow-100">
                        <div className="mb-8">
                            <h3 className="text-xl font-black tracking-tighter uppercase italic text-gray-900">1. Identity & Brand</h3>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">Foundational credentials for verification</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <YellowInput label="Full Name" placeholder="OWNER IDENTITY..." value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                            <YellowInput label="Business Name" placeholder="TRADING NAME..." value={formData.company} onChange={(v) => setFormData({ ...formData, company: v })} />
                            <YellowInput label="WhatsApp Number" placeholder="CONTACT NO..." value={formData.phone} onChange={(v) => setFormData({ ...formData, phone: v })} />
                            <YellowInput label="Email Address" placeholder="OFFICIAL EMAIL..." value={formData.email} onChange={(v) => setFormData({ ...formData, email: v })} />
                        </div>

                        <div className="mt-8">
                            <label className="text-[9px] font-black uppercase tracking-widest text-yellow-800/60 ml-2 italic mb-2 block">Branding Assets</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="group relative border border-dashed border-yellow-300 rounded-3xl p-8 flex flex-col items-center justify-center bg-[#FEF3C7]/10 hover:bg-[#FEF3C7]/20 transition-all cursor-pointer"
                            >
                                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                <div className="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center mb-3 text-yellow-500 group-hover:scale-110 transition-transform">
                                    {file ? <CheckCircle2 size={24} className="text-green-500" /> : <ImageIcon size={24} />}
                                </div>
                                <span className="text-[10px] font-black italic uppercase tracking-widest text-gray-700">
                                    {file ? file.name : "CLICK TO UPLOAD STORE LOGO"}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* LOCATION SECTION */}
                    <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-yellow-100">
                        <div className="mb-8">
                            <h3 className="text-xl font-black tracking-tighter uppercase italic text-gray-900">2. Operational Hub</h3>
                            <p className="text-gray-400 font-bold uppercase text-[9px] tracking-widest mt-1">Geographical deployment details</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            <YellowInput label="State" placeholder="REGION..." value={formData.state} onChange={(v) => setFormData({ ...formData, state: v })} />
                            <YellowInput label="City" placeholder="SECTOR/CITY..." value={formData.city} onChange={(v) => setFormData({ ...formData, city: v })} />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-yellow-800/60 ml-2 italic">Deployment Address</label>
                            <textarea
                                rows={3}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full p-4 bg-[#FEF3C7]/15 border border-transparent rounded-2xl focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold uppercase text-[10px] tracking-widest text-gray-700 placeholder:text-yellow-800/20"
                                placeholder="PLOT NO, STREET, LANDMARK, ZIP..."
                            />
                        </div>
                    </div>

                    {/* SUBMIT ACTION */}
                    <div className="flex flex-col items-center gap-4 pt-4">
                        <button
                            type="submit" disabled={isSubmitting}
                            className="w-full max-w-lg bg-gray-900 hover:bg-red-600 text-white py-5 rounded-3xl font-black text-xl italic uppercase tracking-tighter transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader className="animate-spin" size={20} /> : <>Register Business <ArrowRight size={20} /></>}
                        </button>

                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-yellow-100 shadow-sm text-[8px] font-black italic uppercase text-gray-400 tracking-widest">
                            <ShieldCheck size={12} className="text-yellow-500" /> Secure Protocol Verified
                        </div>
                    </div>
                </form>
            </div>

            {/* --- COMPACT FOOTER --- */}
            <div className="max-w-5xl mx-auto px-6 mt-16">
                <div className="bg-gray-900 rounded-[2.5rem] p-8 relative overflow-hidden text-center border border-white/5">
                    <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:15px_15px]" />
                    <h4 className="relative z-10 text-white font-black italic uppercase tracking-widest text-sm">Join the Network</h4>
                    <p className="relative z-10 text-gray-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-1">Verified partners receive priority pulse feed access</p>
                </div>
            </div>
        </div>
    );
}

function YellowInput({ label, value, onChange, placeholder, type = "text" }: YellowInputProps) {
    return (
        <div className="space-y-1.5 w-full">
            <label className="text-[9px] font-black uppercase tracking-widest text-yellow-800/60 ml-2 italic">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full p-4 bg-[#FEF3C7]/15 border border-transparent rounded-2xl focus:border-yellow-400 focus:bg-white outline-none transition-all font-bold uppercase text-[10px] tracking-widest text-gray-700 placeholder:text-yellow-800/20"
            />
        </div>
    );
}