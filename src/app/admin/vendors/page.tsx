"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import {
  Loader2, RefreshCw, Search, X, Mail, Phone, MapPin, Tag,
  Briefcase, Globe, FileText, CheckCircle2, AlertCircle,
  Building2, Hash, ExternalLink, Calendar, ShieldCheck, Activity,
  Plus, Upload, Trash2
} from "lucide-react";

// --- Types ---
type Vendor = {
  id: string;
  email: string;
  role?: string;
  first_name: string | null;
  last_name: string | null;
  location: string | null;
  mobile_number: string | null;
  alternate_number: string | null;
  profile_info: string | null;
  company_name: string | null;
  business_type: string | null;
  media_files: string[] | null;
  status: string;
  subscription_plan: string | null;
  subscription_expiry: string | null;
  owner_name: string | null;
  gst_number: string | null;
  website: string | null;
  business_keywords: string | null;
  sector: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  company_logo: string | null;
  payment_id: string | null;
  categories?: { id: string; name: string }[];  // Updated to array of objects
};

type SubscriptionPlan = {
  id: number;
  name: string;
  base_price: number;
  tax_percent: number;
  duration_months: number;
  benefits: string[];
  color: string | null;
  medals: string | null;
};

// --- Custom Hook ---
const useVendors = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    const { data: vendorsData, error } = await supabase
      .from("vendor_register")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && vendorsData) {
      // Parse categories from JSON string
      const vendorsWithCats = vendorsData.map(v => ({
        ...v,
        categories: v.categories ? JSON.parse(v.categories) : []
      }));

      setVendors(vendorsWithCats);
    }
    setLoading(false);
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase.from("vendor_register").update({ status: newStatus }).eq("id", id);
    if (!error) setVendors(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
  };

  const deleteVendor = async (id: string) => {
    const { error } = await supabase.from("vendor_register").delete().eq("id", id);
    if (!error) setVendors(prev => prev.filter(v => v.id !== id));
  };

  useEffect(() => { fetchVendors(); }, [fetchVendors]);
  return { vendors, loading, fetchVendors, updateStatus, deleteVendor };
};

// --- Simplified Add Vendor Form Component ---
function AddVendorForm({ onClose, onAdd }: { onClose: () => void; onAdd: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [videoFilesList, setVideoFilesList] = useState<{ url: string, added_at: string }[]>([]);
  const [websiteInput, setWebsiteInput] = useState("");
  const [categories, setCategories] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    owner_name: "",
    mobile_number: "",
    alternate_number: "",
    profile_info: "",
    company_name: "",
    user_type: [] as string[],
    gst_number: "",
    websites: [] as string[],
    flat_no: "",
    floor: "",
    building: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    business_keywords: "",
    sector: "",
    address: "",
    company_logo: "",
    media_files: [] as string[],
    video_files: [] as any,
    status: "approved", // Default to approved for admin adds
    categories: [] as { id: string; name: string }[],  // Updated to array of objects
    role: "admin",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");

      setCategories(data || []);
    };

    const fetchSubscriptionPlans = async () => {
      const { data } = await supabase
        .from("subscription_plans")
        .select("*")
        .order("base_price");

      setSubscriptionPlans(data || []);
    };

    fetchCategories();
    fetchSubscriptionPlans();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      user_type: prev.user_type.includes(value)
        ? prev.user_type.filter(v => v !== value)
        : [...prev.user_type, value]
    }));
  };

  const addWebsite = () => {
    if (!websiteInput.trim()) return;
    setFormData(prev => ({
      ...prev,
      websites: [...prev.websites, websiteInput.trim()]
    }));
    setWebsiteInput("");
  };

  const removeWebsite = (index: number) => {
    setFormData(prev => ({
      ...prev,
      websites: prev.websites.filter((_, i) => i !== index)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string, isMultiple = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setError(null);
    try {
      const uploadToBucket = async (file: File, bucket: string, path: string) => {
        const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
          cacheControl: '3600',
          upsert: false
        });
        if (error) throw new Error(`Upload failed: ${error.message}`);
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
        return urlData.publicUrl;
      };

      if (isMultiple) {
        const urls: string[] = [];
        for (const file of Array.from(files)) {
          if (file.size > 5 * 1024 * 1024) throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
          const path = `vendor/media/${Date.now()}-${file.name}`;
          const url = await uploadToBucket(file, 'media', path);
          urls.push(url);
          setMediaPreviews(prev => [...prev, url]);
        }
        setFormData(prev => ({ ...prev, media_files: [...prev.media_files, ...urls] }));
      } else {
        const file = files[0];
        if (file.size > 5 * 1024 * 1024) throw new Error(`File ${file.name} is too large. Max size is 5MB.`);
        const path = `vendor/logos/${Date.now()}-${file.name}`;
        const url = await uploadToBucket(file, 'media', path);
        setFormData(prev => ({ ...prev, [field]: url }));
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    try {
      if (file.size > 50 * 1024 * 1024) throw new Error(`File ${file.name} is too large. Max size is 50MB.`);
      const path = `vendor/videos/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage.from('media').upload(path, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(path);
      const newVideo = { url: urlData.publicUrl, added_at: new Date().toISOString() };
      setVideoFilesList(prev => [...prev, newVideo]);
      setFormData(prev => ({ ...prev, video_files: [...prev.video_files, newVideo] }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removeMedia = (index: number) => {
    const filtered = formData.media_files.filter((_, i) => i !== index);
    setMediaPreviews(filtered);
    setFormData({ ...formData, media_files: filtered });
  };

  const removeVideo = (index: number) => {
    const newList = videoFilesList.filter((_, i) => i !== index);
    setVideoFilesList(newList);
    setFormData(prev => ({ ...prev, video_files: newList }));
  };

  const validateForm = () => {
    if (!formData.email.includes("@")) return "Valid email is required";
    if (!formData.first_name.trim()) return "First name is required";
    if (!formData.company_name.trim()) return "Company name is required";
    if (!formData.business_keywords.trim()) return "Business keywords are required";
    if (!formData.sector.trim()) return "Business sector is required";
    if (!formData.profile_info.trim()) return "Business description is required";
    if (!formData.building.trim()) return "Building/Project name is required";
    if (!formData.street.trim()) return "Street/Road is required";
    if (!formData.area.trim()) return "Area/Locality is required";
    if (!formData.city.trim()) return "City is required";
    if (!formData.state.trim()) return "State is required";
    if (!formData.pincode.trim()) return "Pincode is required";
    if (formData.media_files.length === 0) return "At least one image is required";
    if (formData.gst_number && formData.gst_number.length !== 15) return "GST Number must be 15 characters if provided";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errorMsg = validateForm();
    if (errorMsg) { setError(errorMsg); return; }
    setLoading(true);
    try {
      // Check if email already exists
      const { data: existingVendor } = await supabase
        .from("vendor_register")
        .select("id")
        .eq("email", formData.email)
        .single();
      if (existingVendor) {
        setError("This email is already registered.");
        return;
      }

      // Get current user for user_id
      const { data: { user } } = await supabase.auth.getUser();

      const now = new Date();
      const { categories, ...vendorData } = formData;

      // Calculate subscription_expiry if a plan is selected
      let subscriptionExpiry = null;
      if (selectedPlanId) {
        const selectedPlan = subscriptionPlans.find(p => p.id === selectedPlanId);
        if (selectedPlan) {
          const expiryDate = new Date(now);
          expiryDate.setMonth(expiryDate.getMonth() + selectedPlan.duration_months);
          subscriptionExpiry = expiryDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      }

      const submissionData = {
        ...vendorData,
        role: "admin",
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        subscription_plan_id: selectedPlanId,
        subscription_expiry: subscriptionExpiry,
        categories: JSON.stringify(formData.categories),  // Save as JSON string
      };

      const { data: vendor, error } = await supabase
        .from("vendor_register")
        .insert([submissionData])
        .select("id")
        .single();

      if (error) throw error;

      onAdd();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-yellow-500/10 focus:border-yellow-500 focus:bg-white outline-none transition-all text-slate-800 text-sm font-bold";
  const labelClass = "block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-[0.2em]";


  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[3rem] overflow-hidden flex flex-col relative shadow-2xl">
        <button onClick={onClose} className="absolute right-8 top-8 z-20 p-3 bg-slate-100 rounded-2xl hover:bg-red-600 hover:text-white transition-all">
          <X size={24} />
        </button>
        <div className="p-12 overflow-y-auto">
          <h2 className="text-3xl font-black text-slate-900 uppercase mb-8">Add New Vendor</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Sector */}
            <div>
              <label className={labelClass}>Business Sector (Multiple allowed)</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Manufacturer", value: "manufacturer" },
                  { label: "Industrial", value: "industrial" },
                  { label: "Distributor", value: "distributor" },
                  { label: "Wholesaler", value: "wholesaler" },
                  { label: "Dealer", value: "Dealer" },
                  { label: "Sub-Dealer", value: "sub-dealer" },
                  { label: "Retailer", value: "retailer" },
                  { label: "Service Provider", value: "service" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.user_type.includes(option.value)}
                      onChange={() => handleCheckboxChange(option.value)}
                      className="accent-blue-600"
                    />
                    <span className="text-sm font-medium">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Subscription Plan Selection */}
            <div>
              <label className={labelClass}>Subscription Plan</label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
                {subscriptionPlans.map((plan) => (
                  <label
                    key={plan.id}
                    className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition
        ${selectedPlanId === plan.id
                        ? "border-yellow-500 bg-yellow-50 shadow-sm"
                        : "border-slate-200 hover:bg-slate-50"
                      }`}
                  >
                    <input
                      type="radio"
                      name="subscription_plan"
                      value={plan.id}
                      checked={selectedPlanId === plan.id}
                      onChange={() => setSelectedPlanId(plan.id)}
                      className="mt-1 accent-yellow-500"
                    />

                    <div className="flex-1">
                      <h3 className="text-base font-extrabold text-slate-900 uppercase">
                        {plan.name}
                      </h3>

                      {plan.base_price > 0 && (
                        <p className="text-sm text-slate-600 mt-1">
                          ₹{plan.base_price} / month
                        </p>
                      )}

                    </div>
                  </label>
                ))}

                {/* No Plan Option */}
                <label
                  className={`flex items-start gap-4 p-5 rounded-2xl border cursor-pointer transition
      ${selectedPlanId === null
                      ? "border-yellow-500 bg-yellow-50 shadow-sm"
                      : "border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  <input
                    type="radio"
                    name="subscription_plan"
                    value=""
                    checked={selectedPlanId === null}
                    onChange={() => setSelectedPlanId(null)}
                    className="mt-1 accent-yellow-500"
                  />

                  <div className="flex-1">
                    <h3 className="text-base font-extrabold text-slate-900 uppercase">
                      No Plan
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      Free tier or assign later
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Personal Identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Legal Owner Name</label>
                <input type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} className={inputClass} />
              </div>
                           <div>
                <label className={labelClass}>Primary Mobile</label>
                <input type="tel" name="mobile_number" value={formData.mobile_number} onChange={handleChange} className={inputClass} maxLength={10} />
              </div>
              <div>
                <label className={labelClass}>Backup Mobile</label>
                <input type="tel" name="alternate_number" value={formData.alternate_number} onChange={handleChange} className={inputClass} maxLength={15} />
              </div>
            </div>

            {/* Business Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Registered Company Name *</label>
                <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>GSTIN Number</label>
                <input type="text" name="gst_number" value={formData.gst_number} onChange={handleChange} className={inputClass} maxLength={15} />
              </div>
              <div>
                <label className={labelClass}>Business Keywords *</label>
                <input type="text" name="business_keywords" value={formData.business_keywords} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Legal Structure *</label>
                <select name="sector" value={formData.sector} onChange={handleChange} className={inputClass} required>
                  <option value="" disabled>Select Structure</option>
                  <option value="proprietorship">Individual / Proprietorship</option>
                  <option value="partnership">Partnership Firm</option>
                  <option value="llp">LLP</option>
                  <option value="private_ltd">Private Limited</option>
                  <option value="public_ltd">Public Limited</option>
                  <option value="trust_society">Trust / Society</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Business Description *</label>
              <textarea name="profile_info" value={formData.profile_info} onChange={handleChange} className={inputClass} rows={3} required />
            </div>

            {/* Digital Assets */}
            <div>
              <label className={labelClass}>Digital Assets</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="url"
                  value={websiteInput}
                  onChange={(e) => setWebsiteInput(e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className={inputClass}
                />
                <button type="button" onClick={addWebsite} className="bg-yellow-300 text-white px-4 py-3 rounded-2xl">
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.websites.map((url, i) => (
                  <div key={i} className="bg-blue-50 text-blue-700 text-xs font-medium px-3 py-2 rounded-lg flex items-center gap-2">
                    <Globe size={12} />
                    <span>{url}</span>
                    <button onClick={() => removeWebsite(i)} className="text-red-500">
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClass}>Office / Shop No.</label>
                <input type="text" name="flat_no" value={formData.flat_no} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Floor</label>
                <input type="text" name="floor" value={formData.floor} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Building / Business Park *</label>
                <input type="text" name="building" value={formData.building} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Street Address *</label>
                <input type="text" name="street" value={formData.street} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Locality *</label>
                <input type="text" name="area" value={formData.area} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Landmark</label>
                <input type="text" name="landmark" value={formData.landmark} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>City *</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>State *</label>
                <input type="text" name="state" value={formData.state} onChange={handleChange} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Pincode *</label>
                <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className={inputClass} required />
              </div>
            </div>

            {/* Vendor Categories */}
            <div>
              <div className="relative w-full">
                <label className={labelClass}>Business Categories (Select multiple)</label>

                {/* Dropdown Box */}
                <div
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 cursor-pointer flex flex-wrap gap-2"
                  onClick={() => setDropdownOpen(prev => !prev)}
                >
                  {formData.categories.length === 0 ? (
                    <span className="text-slate-400 text-sm">Select categories...</span>
                  ) : (
                    formData.categories.map(cat => (
                      <span
                        key={cat.id}
                        className="bg-yellow-300 text-black px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                      >
                        {cat.name}
                        <X
                          size={12}
                          className="cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFormData(prev => ({
                              ...prev,
                              categories: prev.categories.filter(c => c.id !== cat.id),
                            }));
                          }}
                        />
                      </span>
                    ))
                  )}
                </div>

                {/* Dropdown Options */}
                {dropdownOpen && (
                  <div className="absolute z-50 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-lg">
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className={`p-3 cursor-pointer hover:bg-yellow-100 ${formData.categories.some(c => c.id === cat.id) ? "bg-yellow-50" : ""
                          }`}
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            categories: prev.categories.some(c => c.id === cat.id)
                              ? prev.categories.filter(c => c.id !== cat.id)
                              : [...prev.categories, { id: cat.id, name: cat.name }],
                          }));
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Company Logo */}
            <div>
              <label className={labelClass}>Company Logo</label>
              <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'company_logo')} className="hidden" id="logo-upload" />
              <label htmlFor="logo-upload" className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100">
                <Upload size={20} /> Upload Logo
              </label>
              {formData.company_logo && <img src={formData.company_logo} alt="Logo" className="mt-4 w-20 h-20 rounded-xl object-cover" />}
            </div>

            {/* Media Files */}
            <div>
              <label className={labelClass}>Photo Gallery *</label>
              <div className="grid grid-cols-4 gap-4">
                {mediaPreviews.map((src, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden">
                    <img src={src} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeMedia(i)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <label className="aspect-square border-2 border-dashed flex items-center justify-center cursor-pointer rounded-xl">
                  <Plus size={24} />
                  <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, '', true)} className="hidden" />
                </label>
              </div>
            </div>

            {/* Video Files */}
            <div>
              <label className={labelClass}>Video Experience</label>
              <input type="file" accept="video/*" onChange={handleVideoFileUpload} className="hidden" id="video-upload" />
              <label htmlFor="video-upload" className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100">
                <Upload size={20} /> Upload Video
              </label>
              <div className="space-y-2 mt-4">
                {videoFilesList.map((v, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-100 rounded-xl">
                    <span className="text-sm font-medium">{v.url.split('/').pop()}</span>
                    <button onClick={() => removeVideo(i)} className="text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {error && <div className="text-red-500 text-xs font-bold uppercase">{error}</div>}
            <button type="submit" className="w-full py-5 bg-black text-[#facc15] rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-2xl active:scale-95" disabled={loading}>
              {loading ? "Adding..." : "Add Vendor"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const { vendors, loading, fetchVendors, updateStatus, deleteVendor } = useVendors();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showAddForm, setShowAddForm] = useState(false);

  const filtered = useMemo(() => {
    let filteredVendors = vendors.filter(v =>
      `${v.company_name} ${v.email} ${v.gst_number} ${v.city}`.toLowerCase().includes(query.toLowerCase())
    );
    if (roleFilter !== "all") {
      filteredVendors = filteredVendors.filter(v => v.role === roleFilter);
    }
    return filteredVendors;
  }, [vendors, query, roleFilter]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] font-sans pb-20 text-slate-900">
      {/* TOAST SYSTEM */}
      {/* You can add a toast system similar to AdminPlansPage if needed */}

      {/* --- REFINED GREY HEADER --- */}
      <div className="bg-white border-b border-slate-100 pt-10 pb-20 px-6 md:px-10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-8 md:p-10 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-white rounded-lg border border-slate-200">
                    <ShieldCheck className="text-slate-400" size={16} />
                  </div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Vendor Management</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-light text-slate-900 tracking-tighter leading-none mb-4">
                  Vendor <span className="font-semibold text-slate-400">Database</span>
                </h1>
                <p className="text-slate-500 text-sm max-w-md font-medium opacity-80 leading-relaxed">
                  Manage vendor partnerships, approvals, and compliance.
                </p>
              </div>

              <div className="flex gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 min-w-[140px] shadow-sm">
                  <p className="text-slate-400 text-[9px] font-bold uppercase tracking-widest mb-1">Total Vendors</p>
                  <p className="text-4xl font-semibold text-slate-900 tracking-tighter">{vendors.length}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ACTION BAR --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
        <div className="bg-white p-4 rounded-[2rem] shadow-xl flex flex-col md:flex-row gap-4 items-center border border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter vendors by name, email, GST, or city..."
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl focus:border-slate-200 focus:bg-white outline-none text-sm font-bold text-slate-900 transition-all"
            />
          </div>
          <button onClick={() => setShowAddForm(true)} className="w-full md:w-auto bg-slate-900 hover:bg-black text-white px-10 py-4 rounded-2xl text-[11px] font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-3 transition-all shadow-lg active:scale-95">
            <Plus size={18} /> Add Vendor
          </button>
        </div>
      </div>

      {/* --- VENDORS GRID --- */}
      <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <RefreshCw className="animate-spin text-slate-400" size={32} />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Loading Vendors...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((vendor) => (
              <div key={vendor.id} className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden hover:shadow-2xl hover:border-slate-200 transition-all group flex flex-col relative">
                <div className="h-2 w-full" style={{ backgroundColor: vendor.status === 'approved' ? '#10b981' : '#f59e0b' }} />
                <div className="p-8 flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${vendor.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                          {vendor.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-slate-900 uppercase truncate text-2xl tracking-tight leading-none">{vendor.company_name || "Unnamed Vendor"}</h3>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                      <Building2 size={18} className="text-slate-600" />
                    </div>
                  </div>

                  <div className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900 tracking-tighter">{vendor.sector || "N/A"}</span>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Business Sector</p>
                  </div>

                  <div className="space-y-3 pb-8">
                    <div className="flex items-center gap-3">
                      <div className="p-0.5 bg-emerald-50 rounded-full">
                        <Mail size={14} className="text-emerald-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{vendor.email}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-0.5 bg-emerald-50 rounded-full">
                        <MapPin size={14} className="text-emerald-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{vendor.city}, {vendor.state}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-0.5 bg-emerald-50 rounded-full">
                        <Hash size={14} className="text-emerald-500" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">{vendor.gst_number || "GST Not Provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="px-8 pb-8 flex gap-3">
                  <button onClick={() => setSelectedVendor(vendor)} className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-50 hover:bg-slate-900 text-slate-900 hover:text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">
                    <ShieldCheck size={14} /> View Details
                  </button>
                  <button onClick={() => deleteVendor(vendor.id)} className="w-14 flex items-center justify-center py-4 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-2xl transition-all">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- INSPECTION MODAL --- */}
      {selectedVendor && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-50 px-10 py-8 flex items-center justify-between border-b border-slate-100">
              <div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Vendor Profile</p>
                <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">{selectedVendor.company_name}</h3>
              </div>
              <button onClick={() => setSelectedVendor(null)} className="w-12 h-12 hover:bg-white rounded-full flex items-center justify-center transition-colors text-slate-400 border border-transparent hover:border-slate-100"><X size={20} /></button>
            </div>

            <div className="flex flex-col md:flex-row divide-x divide-slate-100">
              <div className="flex-1 p-10 space-y-6">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor Details</h4>
                <div className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Email</label>
                    <p className="text-sm font-medium text-slate-900">{selectedVendor.email}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Owner</label>
                    <p className="text-sm font-medium text-slate-900">{selectedVendor.first_name} {selectedVendor.last_name}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">GST Number</label>
                    <p className="text-sm font-medium text-slate-900">{selectedVendor.gst_number || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Sector</label>
                    <p className="text-sm font-medium text-slate-900">{selectedVendor.sector}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Address</label>
                    <p className="text-sm font-medium text-slate-900">{selectedVendor.address}</p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Status</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${selectedVendor.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                      {selectedVendor.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-10 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Actions</h4>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px] pr-2">
                  {/* Media Files */}
                  {selectedVendor.media_files && selectedVendor.media_files.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Media Files</label>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedVendor.media_files.map((img, idx) => (
                          <img key={idx} src={img} alt="Media" className="w-full h-20 object-cover rounded-lg" />
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Categories */}
                  {selectedVendor.categories && selectedVendor.categories.length > 0 && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-slate-400 tracking-widest mb-2">Categories</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedVendor.categories.map(cat => (
                          <span key={cat.id} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full">
                            {cat.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="pt-10 flex gap-4">
                  <button type="button" onClick={() => setSelectedVendor(null)} className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-50 rounded-2xl transition-all">Close</button>
                  <button type="button" onClick={() => { updateStatus(selectedVendor.id, 'approved'); setSelectedVendor(null); }} className="flex-[2] py-4 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-widest rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95">
                    <CheckCircle2 size={18} />
                    Approve Vendor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD VENDOR FORM MODAL --- */}
      {showAddForm && (
        <AddVendorForm onClose={() => setShowAddForm(false)} onAdd={fetchVendors} />
      )}
    </div>
  );
}