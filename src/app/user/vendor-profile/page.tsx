"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Phone, MapPin, ShieldCheck, Globe, Building2,
  User, Info, Layers, AlertCircle, Loader2,
  Film, Edit3, X, Save, Plus, Trash2,
  Image as ImageIcon, Briefcase, CreditCard,
  Calendar, Activity, Tag, Smartphone, ExternalLink, Zap,
  Play, Video, Link as LinkIcon, Navigation, Store,
  ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VendorProfileDetail() {
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const sectorOptions = [
    { label: "Manufacturer", value: "manufacturer" },
    { label: "Industrial", value: "industrial" },
    { label: "Distributor", value: "distributor" },
     { label: "Wholesaler", value: "wholesaler" },
    { label: "Dealer", value: "dealer" },
    { label: "Sub-Dealer", value: "sub-dealer" },
    { label: "Retailer", value: "retailer" },
    { label: "Service Provider", value: "service" },
  ];

  const fetchProfileBySession = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Please log in to view your profile.");

      const { data, error: dbError } = await supabase
        .from("vendor_register")
        .select(`
          id, email, first_name, last_name, mobile_number, profile_info, company_name, user_type, media_files, created_at, updated_at, status, subscription_expiry, user_id, owner_name, gst_number, business_keywords, sector, address, city, state, pincode, company_logo, video_files, payment_id, websites, flat_no, floor, building, street, area, landmark, subscription_plan_id, alternate_number, role,
          subscription_plans (
            id, name, base_price, tax_percent, duration_months
          )
        `)
        .eq("email", user.email)
        .single();

      if (dbError) throw dbError;
      setVendor(data);
      setEditForm(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProfileBySession(); }, [fetchProfileBySession]);

  // --- MEDIA HANDLERS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' = 'image') => {
    try {
      setUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      // Basic validation
      if (type === 'video' && file.size > 50 * 1024 * 1024) { // 50MB Limit example
        alert("Video is too large. Please upload a file under 50MB.");
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio/${vendor.id}/${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-videos') // Updated bucket name
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('vendor-videos')
        .getPublicUrl(filePath);

      if (type === 'video') {
        // Adding it to video_files array as an object consistent with your current structure
        setEditForm({
          ...editForm,
          video_files: [...(editForm.video_files || []), { url: publicUrl, title: file.name, type: 'upload' }]
        });
      } else {
        setEditForm({
          ...editForm,
          media_files: [...(editForm.media_files || []), publicUrl]
        });
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    const updated = editForm.media_files.filter((_: any, i: number) => i !== index);
    setEditForm({ ...editForm, media_files: updated });
  };

  const removeVideo = (index: number) => {
    const updated = editForm.video_files.filter((_: any, i: number) => i !== index);
    setEditForm({ ...editForm, video_files: updated });
  };

  const handleUpdate = async () => {
    try {
      setIsSaving(true);
      const { error: updateError } = await supabase
        .from("vendor_register")
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          owner_name: editForm.owner_name,
          company_name: editForm.company_name,
          mobile_number: editForm.mobile_number,
          websites: editForm.websites?.filter((w: string) => w.trim() !== "") || [], // Filter out empty websites
          profile_info: editForm.profile_info,
          flat_no: editForm.flat_no,
          floor: editForm.floor,
          building: editForm.building,
          street: editForm.street,
          area: editForm.area,
          landmark: editForm.landmark,
          city: editForm.city,
          state: editForm.state,
          pincode: editForm.pincode,
          gst_number: editForm.gst_number,
          business_keywords: editForm.business_keywords,
          sector: editForm.sector, // Assuming sector is stored as string, but for multiple, you might need to adjust to array or comma-separated
          media_files: editForm.media_files,
          video_files: editForm.video_files,
        })
        .eq("id", vendor.id);

      if (updateError) throw updateError;
      setVendor(editForm);
      setIsEditing(false);
    } catch (err: any) { alert("Update failed: " + err.message); } finally { setIsSaving(false); }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return "";
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : url;
    }
    return url;
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <EmptyState />;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-slate-900 pb-24 font-sans selection:bg-[#74cb01]/30">
      
      {/* --- PREMIUM CENTERED HEADER --- */}
      <header className="relative pt-24 pb-44 overflow-hidden">
        {/* Ambient background effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
            <div className="absolute top-[-10%] right-[10%] w-[500px] h-[500px] bg-[#00AEEF]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[0%] left-[5%] w-[400px] h-[400px] bg-[#74cb01]/10 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-100 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00AEEF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00AEEF]"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Vendor Profile</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.9]">
              {vendor.company_name} <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00AEEF] to-[#74cb01]">Profile.</span>
            </h1>
            <p className="max-w-2xl text-slate-500 text-lg md:text-xl font-medium leading-relaxed">
              Comprehensive business profile with verified credentials and portfolio showcase.
            </p>
          </motion.div>
        </div>
      </header>

      {/* --- DARK COMMAND CENTER FILTER BAR --- */}
      <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-slate-950 rounded-[3rem] p-3 shadow-[0_40px_100px_-15px_rgba(0,0,0,0.3)] border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            
            {/* Back Button */}
            <button 
              onClick={() => window.history.back()}
              className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#00AEEF]/40 transition-all"
            >
              <ArrowLeft size={20} className="text-[#00AEEF]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Navigation</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">Back to Dashboard</span>
              </div>
            </button>

            {/* Edit Button */}
            <button 
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5 hover:border-[#F26522]/40 transition-all"
            >
              <Edit3 size={20} className="text-[#F26522]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Action</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">Edit Profile</span>
              </div>
            </button>

            {/* Status Display */}
            <div className="flex items-center gap-4 px-6 py-4 bg-white/5 rounded-[2rem] border border-white/5">
              <ShieldCheck size={20} className="text-[#74cb01]" />
              <div className="flex flex-col flex-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</label>
                <span className="bg-transparent border-none outline-none text-white font-bold text-xs">{vendor.status}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-12 gap-10">
          
          {/* MAIN CONTENT */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard 
                label="Sector" 
                value={vendor.sector} 
                icon={<Zap size={18} className="text-[#00AEEF]" />} 
              />
              <StatCard
                label="Account Type"
                value={
                  Array.isArray(vendor.user_type) && vendor.user_type.length > 0 ? (
                    <div className="flex flex-col">
                      {vendor.user_type.map((type: string, i: number) => (
                        <span key={i} className="text-sm font-semibold">{type}</span>
                      ))}
                    </div>
                  ) : "Standard"
                }
                icon={<User size={18} className="text-[#F26522]" />}
              />
              <StatCard 
                label="Established" 
                value={new Date(vendor.created_at).getFullYear()} 
                icon={<Calendar size={18} className="text-[#74cb01]" />} 
              />
              <StatCard 
                label="Status" 
                value={vendor.status} 
                icon={<Activity size={18} className={vendor.status === 'active' ? 'text-[#74cb01]' : 'text-slate-400'} />} 
                className={vendor.status === 'active' ? 'border-[#74cb01]/20 bg-[#74cb01]/5' : ''}
              />
            </div>

            {/* Executive Summary */}
            <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-4 bg-[#00AEEF]/10 rounded-2xl text-[#00AEEF]">
                  <Info size={24} strokeWidth={2.5} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-none">Executive Summary</h2>
                  <p className="text-slate-400 text-sm mt-1">Company overview and expertise</p>
                </div>
              </div>
              
              <p className="text-slate-600 text-lg leading-relaxed mb-10 font-medium">
                {vendor.profile_info || "Premium business profile under review."}
              </p>

              {vendor.business_keywords && (
                <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-50">
                  {vendor.business_keywords.split(',').map((tag: string, i: number) => (
                    <span 
                      key={i} 
                      className="bg-slate-100 text-slate-500 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#74cb01] hover:text-white transition-colors cursor-default"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* VIDEO SHOWCASE */}
            {vendor.video_files && vendor.video_files.length > 0 && (
              <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-4 bg-slate-100 rounded-2xl text-slate-600 text-white">
                      <Video size={24} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Video Portfolio</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {vendor.video_files.map((video: any, i: number) => {
                    const videoUrl = video.url || video;
                    const isUploaded = videoUrl.includes('supabase.co');

                    return (
                      <div key={i} className="group relative rounded-[2rem] overflow-hidden bg-slate-900 aspect-video shadow-xl">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                        {isUploaded ? (
                          <video src={videoUrl} controls className="w-full h-full object-cover" />
                        ) : (
                          <iframe
                            className="w-full h-full"
                            src={getEmbedUrl(videoUrl)}
                            title={`Video ${i}`}
                            allowFullScreen
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* IMAGE SHOWCASE */}
            <section className="bg-white rounded-[3rem] p-8 md:p-10 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-slate-100 rounded-2xl text-slate-600">
                    <ImageIcon size={24} strokeWidth={2.5} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Work Gallery</h2>
                </div>
                <span className="text-slate-400 font-medium text-sm">
                  {vendor.media_files?.length || 0} Photos
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {vendor.media_files?.map((img: string, i: number) => (
                  <div 
                    key={i} 
                    className="group relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-slate-100 shadow-sm cursor-zoom-in"
                  >
                    <img 
                      src={img} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                      alt={`Work instance ${i}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white text-sm font-medium">View Project</p>
                                          </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6">
              
              {/* PRIMARY CONTACT CARD */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-950 text-white rounded-[3rem] p-8 shadow-2xl border border-white/5"
              >
                <h3 className="text-xl font-bold mb-8">Direct Contact</h3>

                <div className="space-y-6">
                  <ContactItem icon={<Phone size={20} />} label="Call Support" value={vendor.mobile_number} isLink={`tel:${vendor.mobile_number}`} />
                  <ContactItem icon={<User size={20} />} label="Decision Maker" value={vendor.owner_name} />
                  {vendor.websites?.map((url: string, idx: number) => (
                    <ContactItem
                      key={idx}
                      icon={<Globe size={20} />}
                      label="Website"
                      value={url.replace(/(^\w+:|^)\/\//, '')}
                      isLink={url.startsWith('http') ? url : `https://${url}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => window.open(`tel:${vendor.mobile_number}`)}
                  className="w-full mt-10 bg-[#00AEEF] hover:bg-[#0099CC] text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-[#00AEEF]/20 transition-all active:scale-[0.98] hover:shadow-xl"
                >
                  Contact Now
                </button>
              </motion.div>

              {/* HEADQUARTERS CARD */}
              <div className="bg-white border border-slate-100 rounded-[2rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="font-bold text-slate-900 mb-4">Headquarters</h3>
                <div className="flex gap-3 text-slate-600">
                  <MapPin size={20} className="text-slate-400 shrink-0 mt-1" />
                  <p className="text-sm leading-relaxed">
                    <span className="font-semibold text-slate-800">{vendor.building}</span><br />
                    {vendor.flat_no}, {vendor.street}<br />
                    {vendor.area}, {vendor.city}<br />
                    <span className="uppercase">{vendor.state} - {vendor.pincode}</span>
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${vendor.company_name} ${vendor.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#74cb01] hover:translate-x-1 transition-transform"
                >
                  <Navigation size={16} /> Get Directions
                </a>
              </div>

              {/* TRUST VERIFICATION CARD */}
              <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-8 shadow-sm">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-[#74cb01]" /> Trust Verification
                </h3>
                <div className="space-y-4">
                  <AccountRow label="Verification" value={vendor.status} color={vendor.status === 'active' ? 'text-[#74cb01] font-bold' : 'text-[#F26522] font-bold'} />
                  <AccountRow label="Plan" value={vendor.subscription_plans?.name || "Free"} />
                  <AccountRow label="Renewal" value={vendor.subscription_expiry || "—"} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ================= EDIT MODAL (COMMAND CENTER) ================= */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-black/10"
            >
              <div className="p-6 bg-[#00AEEF] text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-xl text-[#00AEEF]"><Edit3 size={20} /></div>
                  <h2 className="text-xl font-black uppercase tracking-tighter">Command Center</h2>
                </div>
                <button onClick={() => setIsEditing(false)} className="bg-white text-[#00AEEF] p-2 rounded-xl hover:scale-105 transition-all"><X size={20} /></button>
              </div>

              <div className="p-8 overflow-y-auto bg-slate-50 grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* COL 1: IDENTITY */}
                <div className="space-y-6">
                  <SectionTitle icon={<User size={14} />} title="Identity & Contact" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="First Name" value={editForm.first_name} onChange={(v: any) => setEditForm({ ...editForm, first_name: v })} />
                    <InputField label="Last Name" value={editForm.last_name} onChange={(v: any) => setEditForm({ ...editForm, last_name: v })} />
                  </div>
                  <InputField label="Owner Name" value={editForm.owner_name} onChange={(v: any) => setEditForm({ ...editForm, owner_name: v })} />
                  <InputField label="Company Name" value={editForm.company_name} onChange={(v: any) => setEditForm({ ...editForm, company_name: v })} />
                  <InputField label="Mobile" value={editForm.mobile_number} onChange={(v: any) => setEditForm({ ...editForm, mobile_number: v })} />
                  <InputField label="GST Number" value={editForm.gst_number} onChange={(v: any) => setEditForm({ ...editForm, gst_number: v })} />

                  {/* Sector Multi-Select */}
                  <div className="w-full">
                    <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block ml-1">
                      Sector
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      {sectorOptions.map((option) => {
                        const selectedSectors = editForm.sector
                          ? editForm.sector.split(",")
                          : [];

                        const isChecked = selectedSectors.includes(option.value);

                        return (
                          <label
                            key={option.value}
                            className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
            ${isChecked
                                ? "bg-[#74cb01] border-[#74cb01]"
                                : "bg-white border-slate-200 hover:border-[#00AEEF]"
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                let updated = [...selectedSectors];

                                if (e.target.checked) {
                                  updated.push(option.value);
                                } else {
                                  updated = updated.filter(v => v !== option.value);
                                }

                                setEditForm({
                                  ...editForm,
                                  sector: updated.join(","),
                                });
                              }}
                              className="accent-[#74cb01]"
                            />
                            <span className="text-xs font-bold uppercase">
                              {option.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between mb-2">Websites <button onClick={() => setEditForm({ ...editForm, websites: [...(editForm.websites || []), ""] })} className="text-[#00AEEF]"><Plus size={14} /></button></label>
                    <div className="space-y-2">
                      {editForm.websites?.map((site: string, i: number) => (
                        <div key={i} className="flex gap-2">
                          <input value={site} onChange={(e) => { const n = [...editForm.websites]; n[i] = e.target.value; setEditForm({ ...editForm, websites: n }) }} className="flex-1 bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold" placeholder="https://" />
                          <button onClick={() => setEditForm({ ...editForm, websites: editForm.websites.filter((_: any, idx: number) => idx !== i) })} className="text-red-500"><Trash2 size={16} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* COL 2: ADDRESS */}
                <div className="space-y-6">
                  <SectionTitle icon={<MapPin size={14} />} title="Location" />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="Flat/Shop" value={editForm.flat_no} onChange={(v: any) => setEditForm({ ...editForm, flat_no: v })} />
                    <InputField label="Floor" value={editForm.floor} onChange={(v: any) => setEditForm({ ...editForm, floor: v })} />
                  </div>
                  <InputField label="Building" value={editForm.building} onChange={(v: any) => setEditForm({ ...editForm, building: v })} />
                  <InputField label="Street/Area" value={editForm.street} onChange={(v: any) => setEditForm({ ...editForm, street: v })} />
                  <InputField label="Area" value={editForm.area} onChange={(v: any) => setEditForm({ ...editForm, area: v })} />
                  <InputField label="Landmark" value={editForm.landmark} onChange={(v: any) => setEditForm({ ...editForm, landmark: v })} />
                  <div className="grid grid-cols-2 gap-3">
                    <InputField label="City" value={editForm.city} onChange={(v: any) => setEditForm({ ...editForm, city: v })} />
                    <InputField label="State" value={editForm.state} onChange={(v: any) => setEditForm({ ...editForm, state: v })} />
                  </div>
                  <InputField label="Pincode" value={editForm.pincode} onChange={(v: any) => setEditForm({ ...editForm, pincode: v })} />
                </div>

                {/* COL 3: MEDIA & PROFILE */}
                <div className="space-y-6">
                  <SectionTitle icon={<Layers size={14} />} title="Media Portfolio" />

                  {/* Image Upload */}
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center mb-3">Portfolio Images <label className="bg-[#74cb01] p-1.5 rounded-lg cursor-pointer"><Plus size={14} /><input type="file" hidden onChange={handleFileUpload} accept="image/*" /></label></label>
                    <div className="grid grid-cols-4 gap-2">
                      {editForm.media_files?.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border group">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={() => removePhoto(i)} className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white"><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Upload Only */}
                  <div className="pt-4 border-t border-slate-200">
                    <label className="text-[10px] font-black uppercase text-slate-400 flex justify-between items-center mb-3">
                      Video Portfolio
                      <label className="bg-black text-[#00AEEF] p-1.5 rounded-lg cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <Video size={14} />}
                        <input
                          type="file"
                          hidden
                          onChange={(e) => handleFileUpload(e, 'video')}
                          accept="video/mp4,video/x-m4v,video/*"
                        />
                      </label>
                    </label>

                    <div className="space-y-2">
                      {editForm.video_files?.map((vid: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 p-2 rounded-xl">
                          <Film size={12} className="text-red-500" />
                          <span className="text-[10px] font-bold truncate flex-1">
                            {vid.title || (vid.url || vid)}
                          </span>
                          <button onClick={() => removeVideo(i)} className="text-red-500 hover:bg-red-50 p-1 rounded-md">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {uploading && <p className="text-[9px] text-[#74cb01] animate-pulse font-bold uppercase">Uploading high-quality media...</p>}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="pt-4 border-t border-slate-200">
                    <SectionTitle icon={<Info size={14} />} title="Profile Info" />
                    <textarea
                      value={editForm.profile_info || ""}
                      onChange={(e) => setEditForm({ ...editForm, profile_info: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-3 rounded-xl text-xs font-bold resize-none"
                      rows={4}
                      placeholder="Describe your business..."
                    />
                  </div>

                  {/* Business Keywords */}
                  <div className="pt-2">
                    <InputField label="Business Keywords" value={editForm.business_keywords} onChange={(v: any) => setEditForm({ ...editForm, business_keywords: v })} />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t flex gap-3">
                <button onClick={handleUpdate} disabled={isSaving} className="flex-1 bg-[#00AEEF] hover:bg-[#0099CC] text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={16} />} Update Profile
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- HELPER COMPONENTS ---
function SectionTitle({ icon, title }: any) {
  return (
    <h3 className="text-black font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border-b-2 border-[#00AEEF] pb-2">
      {icon} {title}
    </h3>
  );
}

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-4 md:p-5 rounded-3xl border border-slate-100 shadow-sm text-center md:text-left">
      <div className="text-[#00AEEF] mb-2 flex justify-center md:justify-start">
        {icon}
      </div>

      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
        {label}
      </p>

      <div className="text-xs font-black text-black uppercase">
        {value || "---"}
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value, isLink }: any) {
  if (!value) return null;
  return (
    <div className="group flex items-start gap-4 cursor-pointer" onClick={() => isLink && window.open(isLink)}>
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#00AEEF] group-hover:bg-[#00AEEF] group-hover:text-white transition-all">
        {icon}
      </div>
      <div className="flex-1 border-b border-white/5 pb-4">
        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{label}</p>
        <p className="text-sm font-medium text-white flex items-center gap-1">
          {value} {isLink && <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />}
        </p>
      </div>
    </div>
  );
}

function AccountRow({ label, value, color = "text-black" }: any) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
      <div className="text-[10px] font-black text-slate-400 uppercase">{label}</div>
      <div className={`${color} text-[10px] font-black uppercase tracking-widest`}>{value || "N/A"}</div>
    </div>
  );
}

function Badge({ icon, label }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100 text-slate-600 font-medium text-sm">
      <span className="text-[#74cb01]">{icon}</span>
      {label}
    </div>
  );
}

function InputField({ label, value, onChange }: any) {
  return (
    <div className="w-full">
      <label className="text-[10px] font-black uppercase text-slate-500 mb-1.5 block ml-1">{label}</label>
      <input type="text" value={value || ""} onChange={(e) => onChange(e.target.value)} className="w-full bg-white border border-slate-200 p-3 rounded-xl font-bold text-xs focus:ring-2 focus:ring-[#00AEEF] outline-none transition-all" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] animate-pulse">
      <div className="h-64 bg-slate-100 w-full" />
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-40 bg-white shadow-lg rounded-3xl -mt-20 border p-8">
          <div className="flex gap-6">
            <div className="w-32 h-32 bg-slate-200 rounded-2xl" />
            <div className="flex-1 space-y-4 pt-4">
              <div className="h-8 bg-slate-200 w-1/3 rounded" />
              <div className="h-4 bg-slate-100 w-2/3 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-slate-400 bg-[#FAFAFA]">
      <Building2 size={64} className="mb-4 opacity-20 text-[#00AEEF]" />
      <h3 className="text-xl font-bold text-slate-900">Profile Not Found</h3>
      <p>The profile you are looking for does not exist.</p>
    </div>
  );
}