"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  Globe, Share2, Save, Loader2, MapPin, Mail,
  Phone, Instagram, Facebook, Youtube, ShieldCheck
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

// 1. Define types for better DX
interface PlatformSettings {
  id: number;
  site_name: string;
  support_email: string;
  support_phone: string;
  address: string;
  instagram_url: string;
  facebook_url: string;
  youtube_url: string;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Partial<PlatformSettings>>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("platform_settings")
        .select("*")
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err: any) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("platform_settings")
        .update(settings)
        .eq("id", 1);

      if (error) throw error;
      toast.success("Settings synchronized successfully!");
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="relative">
        <Loader2 className="animate-spin text-[#ff3d00]" size={48} />
        <div className="absolute inset-0 blur-xl bg-orange-500/20 animate-pulse" />
      </div>
      <p className="text-slate-400 font-medium animate-pulse">Initializing Platform...</p>
    </div>
  );

  return (
    <div className="max-w-9xl mx-auto ">
      <Toaster position="top-right" />

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-10 py-2 bg-slate-50/80 backdrop-blur-md mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Configuration</h1>
          <p className="text-slate-500 font-medium flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            Manage global parameters and social identifiers
          </p>
        </div>

        <button
          onClick={handleUpdate}
          disabled={saving}
          className="group relative bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-bold overflow-hidden transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-70"
        >
          <div className="relative z-10 flex items-center gap-2">
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
            <span>{saving ? "Saving..." : "Push Changes"}</span>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff3d00] to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* PRIMARY INFO */}
        <div className="lg:col-span-8 space-y-8">
          <FormSection
            title="Core Identity"
            description="The public face of your platform"
            icon={<Globe className="text-blue-500" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Platform Name"
                placeholder="e.g. Acme Corp"
                value={settings.site_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setSettings({ ...settings, site_name: e.target.value })
                } />
              <Input
                label="Support Email"
                icon={<Mail size={16} />}
                value={settings.support_email}
                onChange={(v: string) =>
                  setSettings({ ...settings, support_email: v })
                }
              />

              <Input
                label="Primary Phone"
                icon={<Phone size={16} />}
                value={settings.support_phone}
                onChange={(v: string) =>
                  setSettings({ ...settings, support_phone: v })
                }
              />

              <Input
                label="HQ Location"
                icon={<MapPin size={16} />}
                value={settings.address}
                onChange={(v: string) =>
                  setSettings({ ...settings, address: v })
                }
              />

            </div>
          </FormSection>
        </div>

        {/* SOCIAL LINKS */}
        {/* SOCIAL LINKS */}
        <div className="lg:col-span-4 space-y-8">
          <FormSection
            title="Social Presence"
            description="External link routing"
            icon={<Share2 className="text-pink-500" />}
          >
           <div className="space-y-5">
  <Input
    label="Instagram"
    placeholder="instagram.com/username"
    icon={<Instagram size={16} />}
    value={settings.instagram_url}
    onChange={(v: string) =>
      setSettings({ ...settings, instagram_url: v })
    }
  />

  <Input
    label="Facebook"
    placeholder="facebook.com/pagename"
    icon={<Facebook size={16} />}
    value={settings.facebook_url}
    onChange={(v: string) =>
      setSettings({ ...settings, facebook_url: v })
    }
  />

  <Input
    label="YouTube"
    placeholder="youtube.com/@channel"
    icon={<Youtube size={16} />}
    value={settings.youtube_url}
    onChange={(v: string) =>
      setSettings({ ...settings, youtube_url: v })
    }
  />
</div>

          </FormSection>
        </div>

      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

function FormSection({ children, title, description, icon }: any) {
  return (
    <section className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 overflow-hidden">
      <div className="px-8 py-6 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
        <div className="p-2.5 bg-white rounded-xl shadow-sm ring-1 ring-slate-200/50">{icon}</div>
        <div>
          <h2 className="font-black text-slate-800 text-sm uppercase tracking-wider">{title}</h2>
          <p className="text-xs text-slate-400 font-medium">{description}</p>
        </div>
      </div>
      <div className="p-8">
        {children}
      </div>
    </section>
  );
}

function Input({ label, value, onChange, placeholder, icon }: any) {
  return (
    <div className="group space-y-2">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest px-1 transition-colors group-focus-within:text-[#ff3d00]">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-[#ff3d00]">
            {icon}
          </div>
        )}
        <input
          type="text"
          placeholder={placeholder}
          className={`
            w-full ${icon ? 'pl-11' : 'pl-5'} pr-5 py-4 
            bg-slate-50/50 border-2 border-slate-100 rounded-2xl 
            outline-none transition-all duration-200
            font-semibold text-slate-700 placeholder:text-slate-300
            focus:bg-white focus:border-[#ff3d00]/20 focus:ring-4 focus:ring-[#ff3d00]/5
          `}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}