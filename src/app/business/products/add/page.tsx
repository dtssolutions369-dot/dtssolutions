"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { 
  ChevronLeft, Upload, Loader2, X, Save, 
  Image as ImageIcon, Info, Tag, IndianRupee, 
  Sparkles, CheckCircle2
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
export const dynamic = 'force-dynamic';
export default function AddProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get("id");
    const isEditMode = !!productId;

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(isEditMode);
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        category_id: "",
        sub_category_id: "",
    });

    const [uploadingImage, setUploadingImage] = useState(false);
    const [previewImages, setPreviewImages] = useState<string[]>([]);

    useEffect(() => {
        const initPage = async () => {
            const { data: catData } = await supabase
                .from("categories")
                .select("*")
                .is("parent_id", null);
            setCategories(catData || []);

            if (isEditMode) {
                const { data: product, error } = await supabase
                    .from("products")
                    .select("*")
                    .eq("id", productId)
                    .single();

                if (error) {
                    toast.error("Could not find product");
                    router.push("/business/products");
                } else {
                    setFormData({
                        name: product.name,
                        description: product.description,
                        price: product.price.toString(),
                        category_id: product.category_id,
                        sub_category_id: product.sub_category_id || "",
                    });
                    setPreviewImages(product.images || []);
                    fetchSubCategories(product.category_id);
                }
                setFetchingData(false);
            }
        };
        initPage();
    }, [productId]);

    const fetchSubCategories = async (catId: string) => {
        const { data } = await supabase
            .from("categories")
            .select("*")
            .eq("parent_id", catId);
        setSubCategories(data || []);
    };

    const handleCategoryChange = (catId: string) => {
        setFormData({ ...formData, category_id: catId, sub_category_id: "" });
        if (catId) fetchSubCategories(catId);
        else setSubCategories([]);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        if (previewImages.length + files.length > 5) {
            toast.error("Max 5 images allowed");
            return;
        }

        setUploadingImage(true);
        const newUrls = [...previewImages];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileName = `${Date.now()}-${Math.random()}.${file.name.split('.').pop()}`;
            
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, file);

            if (!uploadError) {
                const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
                newUrls.push(data.publicUrl);
            }
        }
        setPreviewImages(newUrls);
        setUploadingImage(false);
    };

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (previewImages.length === 0) return toast.error("Upload at least one image");
    if (!formData.category_id) return toast.error("Please select a category");
    
    setLoading(true);

    try {
        // 1. Get the current logged-in Auth User
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) throw new Error("Authentication failed. Please log in again.");

        // 2. Fetch the Business Profile ID linked to this user
        // We need the 'id' from business_profiles, not the 'id' from auth.users
        const { data: profile, error: profileError } = await supabase
            .from("business_profiles")
            .select("id")
            .eq("user_id", user.id)
            .single();

        if (profileError || !profile) {
            throw new Error("Business profile not found. Please complete your profile setup.");
        }

        // 3. Prepare the final payload
        const payload = {
            name: formData.name,
            description: formData.description,
            price: parseFloat(formData.price),
            category_id: formData.category_id,
            sub_category_id: formData.sub_category_id || null,
            images: previewImages,
            business_id: profile.id, // Using the Profile UUID correctly now
            status: 'active'
        };

        let error;
        if (isEditMode) {
            const { error: updateError } = await supabase
                .from("products")
                .update(payload)
                .eq("id", productId);
            error = updateError;
        } else {
            const { error: insertError } = await supabase
                .from("products")
                .insert([payload]);
            error = insertError;
        }

        if (error) throw error;

        toast.success(isEditMode ? "Updated successfully!" : "Published successfully!");
        router.push("/business/products");
        router.refresh();
        
    } catch (err: any) {
        console.error("Submission Error:", err);
        toast.error(err.message || "An unexpected error occurred");
    } finally {
        setLoading(false);
    }
};
    if (fetchingData) return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
            <p className="mt-4 font-bold text-slate-400 uppercase tracking-widest text-xs">Loading Details...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* STICKY TOP BAR */}
            <nav className="top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                        <ChevronLeft size={24} className="text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-black text-slate-900 leading-none">
                            {isEditMode ? "Edit Product" : "New Entry"}
                        </h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Catalog Management</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button 
                        type="button" 
                        onClick={() => router.back()} 
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading || uploadingImage}
                        className="bg-[#ff3d00] hover:bg-black text-white px-8 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-orange-100 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={18} /> : isEditMode ? <><Save size={18}/> Save Changes</> : <><CheckCircle2 size={18}/> Publish Product</>}
                    </button>
                </div>
            </nav>

            <div className="flex flex-col lg:flex-row flex-grow">
                {/* LEFT SIDE: FORM (Full-Width on Mobile) */}
                <div className="flex-grow p-8 lg:p-12 lg:border-r border-slate-100 max-w-4xl">
                    <form className="space-y-12">
                        {/* Section 1: Visuals */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2">
                                <ImageIcon size={18} className="text-orange-500" />
                                <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">Product Media</h2>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <AnimatePresence>
                                    {previewImages.map((url, idx) => (
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            key={idx} 
                                            className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-50"
                                        >
                                            <img src={url} alt="" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button type="button" onClick={() => setPreviewImages(prev => prev.filter((_, i) => i !== idx))} className="p-2 bg-white rounded-full text-red-500 shadow-xl hover:scale-110 transition-transform">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            {idx === 0 && (
                                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-[8px] text-white px-2 py-0.5 rounded-md font-bold uppercase">Main</div>
                                            )}
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {previewImages.length < 5 && (
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="aspect-square border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-slate-50 hover:bg-orange-50 hover:border-orange-200 transition-all group"
                                    >
                                        {uploadingImage ? (
                                            <Loader2 className="animate-spin text-orange-500" />
                                        ) : (
                                            <>
                                                <Upload className="text-slate-300 group-hover:text-orange-500 transition-colors" size={24} />
                                                <span className="text-[10px] font-bold text-slate-400 mt-2">Upload</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                            <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                        </section>

                        {/* Section 2: Details */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Info size={18} className="text-orange-500" />
                                <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">Information</h2>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name</label>
                                    <input required placeholder="e.g. Vintage Leather Jacket" className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-lg" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                
                                <div className="group">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
                                    <textarea required placeholder="Tell your customers about the material, fit, and style..." rows={5} className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-medium text-slate-600" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Pricing & Tags */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2">
                                <Tag size={18} className="text-orange-500" />
                                <h2 className="font-black text-slate-900 uppercase tracking-wider text-xs">Pricing & Categorization</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="relative">
                                    <IndianRupee size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input required type="number" placeholder="Price" className="w-full pl-12 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                                </div>

                                <select required className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 cursor-pointer appearance-none" value={formData.category_id} onChange={(e) => handleCategoryChange(e.target.value)}>
                                    <option value="">Select Category</option>
                                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>

                                <select className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl outline-none focus:bg-white focus:border-orange-500 transition-all font-bold text-slate-700 cursor-pointer appearance-none disabled:opacity-40" value={formData.sub_category_id} onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })} disabled={!formData.category_id}>
                                    <option value="">Sub-Category</option>
                                    {subCategories.map((sc) => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                                </select>
                            </div>
                        </section>
                    </form>
                </div>

                {/* RIGHT SIDE: LIVE PREVIEW (Visible only on LG screens) */}
                <div className="hidden lg:flex flex-col w-[450px] bg-slate-50/50 p-12 items-center sticky top-[73px] h-[calc(100vh-73px)] overflow-y-auto">
                    <div className="flex items-center gap-2 mb-10 text-slate-400">
                        <Sparkles size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Live Preview</span>
                    </div>

                    {/* THE MINI CARD PREVIEW */}
                    <div className="w-full bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-2xl shadow-slate-200/50 flex flex-col pointer-events-none">
                        <div className="aspect-square bg-slate-100 relative">
                            {previewImages[0] ? (
                                <img src={previewImages[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center"><ImageIcon size={48} className="text-slate-200" /></div>
                            )}
                            <div className="absolute bottom-4 left-4 bg-black text-white px-3 py-1 rounded-lg text-sm font-black tracking-tight">
                                ₹{parseFloat(formData.price || "0").toLocaleString('en-IN')}
                            </div>
                        </div>
                        <div className="p-6 space-y-2">
                            <h3 className="text-lg font-black text-slate-900 line-clamp-1">
                                {formData.name || "Product Name Display"}
                            </h3>
                            <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                                {formData.description || "The product description will appear here as you type..."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-12 bg-orange-50 p-6 rounded-[2rem] border border-orange-100 w-full">
                        <h4 className="text-xs font-black text-orange-600 uppercase tracking-wider mb-2">Pro Tip</h4>
                        <p className="text-[11px] text-orange-800 leading-relaxed font-medium">
                            Products with high-quality square images (1:1) and clear descriptions convert 30% better. Make sure your first image is your best one!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}