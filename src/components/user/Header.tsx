"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import ProfileAvatar from "@/components/ProfileAvatar";
import {
  LogOut, PlusCircle,
  UserCircle,
  ChevronDown,
  User as UserIcon,
  Briefcase,
  Menu,
  X
} from "lucide-react";
import VendorRegister from "@/components/user/vendorreg";
import { createClient, type User } from "@supabase/supabase-js"; // REMOVED: Unused import causing confusion

// Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
export default function UserFeed() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (route: string) =>
    pathname === route ? "text-yellow-600 font-bold" : "text-black";

  // UI states
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showRegisterPopup, setShowRegisterPopup] = useState(false);

  // Login / Register states
  const [loginData, setLoginData] = useState({ email: "", otp: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", otp: "" });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [loginSuccess, setLoginSuccess] = useState<string | null>(null);
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerStep, setRegisterStep] = useState<"form" | "otp">("form");
  const [otpExpiry, setOtpExpiry] = useState<number | null>(null);
  const [otpTimer, setOtpTimer] = useState<string | null>(null);
  const [profileMedal, setProfileMedal] = useState("");
  const [userRole, setUserRole] = useState<"user" | "vendor" | null>(null);
  const [openRegisterMenu, setOpenRegisterMenu] = useState(false);
  const [openVendor, setOpenVendor] = useState(false);
  const [profileColor, setProfileColor] = useState("#FFD700");

  // Refs
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Helper function to check if email exists in users or vendor_register
  const checkEmailExists = async (email: string) => {
    // Check users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (userError) throw userError;
    if (userData) return true; // Exists in users

    // Check vendor_register table
    const { data: vendorData, error: vendorError } = await supabase
      .from("vendor_register")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (vendorError) throw vendorError;
    return !!vendorData; // Return true if exists in vendor_register
  };

  useEffect(() => {
    loadUserAndRole();

    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadUserAndRole();
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const loadUserAndRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        setUserRole(null);
        setProfileColor("#FFD700");
        setProfileMedal("");
        return;
      }

      // ✅ 1. READ ROLE FROM AUTH (THIS WAS MISSING)
      const role = user.user_metadata?.role || "user";
      setUserRole(role);

      // ✅ 2. ONLY IF VENDOR → LOAD EXTRA DETAILS
      if (role === "vendor") {
        const { data: vendor } = await supabase
          .from("vendor_register")
          .select("subscription_plan_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (vendor?.subscription_plan_id) {
          const { data: plan } = await supabase
            .from("subscription_plans")
            .select("color, medals")
            .eq("id", vendor.subscription_plan_id)
            .maybeSingle();

          setProfileColor(plan?.color || "#FFD700");
          setProfileMedal(plan?.medals || "");
        }
      } else {
        setProfileColor("#FFD700");
        setProfileMedal("");
      }
    } catch (err) {
      console.error("loadUserAndRole error:", err);
    }
  };

  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);

  // Close dropdown on pathname change or outside click
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setMobileProfileOpen(false);
    }
  }, [isMobileMenuOpen]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/user");
  };

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
  };

  const sendLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);
    setLoginSuccess(null);

    try {
      if (!loginData.email) {
        setLoginError("Email is required");
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: loginData.email,
      });

      if (error) throw error;

      setLoginSuccess("OTP sent! It is valid for 5 minutes.");

      const expiryTime = Date.now() + 5 * 60 * 1000;
      setOtpExpiry(expiryTime);

      const timer = setInterval(() => {
        const remaining = expiryTime - Date.now();
        if (remaining <= 0) {
          setOtpTimer("00:00");
          clearInterval(timer);
        } else {
          const m = Math.floor(remaining / 60000);
          const s = Math.floor((remaining % 60000) / 1000);
          setOtpTimer(`${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`);
        }
      }, 1000);
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const verifyLoginOtp = async () => {
    setLoginLoading(true);
    setLoginError(null);

    try {
      if (otpExpiry && Date.now() > otpExpiry) {
        setLoginError("OTP expired.");
        return;
      }

      const { error } = await supabase.auth.verifyOtp({
        email: loginData.email,
        token: loginData.otp,
        type: "email",
      });

      if (error) throw error;

      setShowLoginPopup(false);
      router.push("/user");
    } catch (err: any) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterChange = (e: any) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  // UPDATED: Add email existence check before sending OTP
  const sendRegisterOtp = async () => {
    if (!registerData.name || !registerData.email) {
      setRegisterError("Fill all fields");
      return;
    }

    setRegisterLoading(true);
    setRegisterError(null);

    try {
      // Check if email already exists in users or vendor_register
      const exists = await checkEmailExists(registerData.email);
      if (exists) {
        setRegisterError("This email is already registered. Please login.");
        return;
      }

      // Proceed to send OTP
      const { error } = await supabase.auth.signInWithOtp({
        email: registerData.email,
        options: { data: { name: registerData.name } },
      });

      if (error) throw error;

      setRegisterStep("otp");
      setRegisterSuccess("OTP sent!");
    } catch (err: any) {
      setRegisterError(err.message || "Unable to send OTP. Please try again.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const verifyRegisterOtp = async () => {
    setRegisterLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email: registerData.email,
      token: registerData.otp,
      type: "email",
    });

    if (error) {
      setRegisterError(error.message);
      setRegisterLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setRegisterError("User not found after registration.");
      setRegisterLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("users")
      .insert({
        user_id: user.id,
        email: registerData.email,
        name: registerData.name,
      });

    if (insertError) {
      setRegisterError("Failed to save user data: " + insertError.message);
    } else {
      setRegisterSuccess("Registration successful!");
      setTimeout(() => setShowRegisterPopup(false), 1500);
    }
    setRegisterLoading(false);
  };

  const navLinks = [
    { name: "Home", href: "/user" },
    { name: "Plans", href: "/user/subscription-plans" },
    { name: "Products", href: "/user/listing" },
    { name: "Video", href: "/user/video" },
    { name: "Transport", href: "/user/transport" },
    { name: "Enquiry", href: "/user/enquiry" },
    { name: "Help & Earn", href: "/user/help" },
  ];


  return (
    <div className="pt-[60px] bg-black">
      {/* ---------------- HEADER ---------------- */}
      <header className="fixed top-0 left-0 right-0 z-[9999] bg-black/90 backdrop-blur-sm border-b border-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/user" className="flex-shrink-0">
            <Image
              src="/navbar_logo.png"
              alt="QickTick"
              width={140}
              height={40}
              className="object-contain"
              priority
            />
          </Link>

          {/* Desktop Links */}
          <nav className="hidden lg:flex space-x-4 font-semibold text-sm">
            {navLinks.map((link) => {
              const isLinkActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-full transition-all duration-300
              ${isLinkActive
                      ? "bg-yellow-500 text-black font-bold shadow-md"
                      : "text-white hover:bg-yellow-50 hover:text-black"}
            `}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop Auth & Profile */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link
              href="/user/add-business"
              className="px-4 py-2 rounded-full bg-red-600 text-white font-bold hover:bg-red-500 transition shadow-md"
            >
              + Add Business
            </Link>

            {!user ? (
              <>
                <button
                  onClick={() => setShowLoginPopup(true)}
                  className="text-white font-bold px-4 py-2 rounded-full hover:bg-gray-800 transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegisterPopup(true)}
                  className="bg-yellow-500 text-black px-4 py-2 rounded-full font-bold hover:bg-yellow-400 transition"
                >
                  Register
                </button>
              </>
            ) : (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setOpenMenu(openMenu === "profile" ? null : "profile")}
                  className="flex items-center space-x-2 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition"
                >
<ProfileAvatar
  userRole={userRole}
  profileMedal={profileMedal}
  profileColor={profileColor}
/>
                  <ChevronDown size={14} className={`${openMenu === "profile" ? "rotate-180" : ""} text-white`} />
                </button>

                {openMenu === "profile" && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 overflow-hidden">
                    <Link href="/user/profile" className="block px-4 py-2 hover:bg-yellow-50">My Profile</Link>
                    {userRole === "vendor" && (
                      <>
                        <Link href="/vendor/products" className="block px-4 py-2 hover:bg-yellow-50">Products</Link>
                        <Link href="/vendor/enquiry" className="block px-4 py-2 hover:bg-yellow-50">Enquiries</Link>
                      </>
                    )}
                    <button onClick={logout} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-gray-700 transition"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black/95 text-white">
            <div className="px-4 pt-4 pb-6 space-y-4">
              <Link
                href="/user/add-business"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-wide shadow-lg"
              >
                Add Business
              </Link>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block text-lg font-bold hover:text-yellow-500 transition"
                >
                  {link.name}
                </Link>
              ))}

              {!user ? (
                <div className="space-y-2 mt-4">
                  <button
                    onClick={() => { setShowLoginPopup(true); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-gray-800 rounded-xl text-white font-bold"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => { setShowRegisterPopup(true); setIsMobileMenuOpen(false); }}
                    className="w-full py-3 bg-yellow-500 rounded-xl text-black font-bold"
                  >
                    Register
                  </button>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  <Link href="/user/profile" className="block px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>My Profile</Link>
                  {userRole === "vendor" && (
                    <>
                      <Link href="/vendor/products" className="block px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Products</Link>
                      <Link href="/vendor/enquiry" className="block px-4 py-3 rounded-xl bg-gray-800 hover:bg-gray-700" onClick={() => setIsMobileMenuOpen(false)}>Enquiries</Link>
                    </>
                  )}
                  <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="w-full px-4 py-3 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-white">Logout</button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>


      {/* -------------------- LOGIN POPUP (Mobile-Friendly) ------------------------ */}
      {showLoginPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          {/* Animated Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowLoginPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-300" />

            <div className="p-6 md:p-10">
              <button
                onClick={() => setShowLoginPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Welcome Back</h2>
                <p className="text-slate-500 font-medium text-sm md:text-base">Enter your email to access your account</p>
              </div>

              {loginError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {loginError}
                </div>
              )}
              {loginSuccess && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {loginSuccess}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                  <input
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    placeholder="name@company.com"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-slate-900 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">One-Time Password</label>
                    {otpTimer && <span className="text-xs font-bold text-yellow-600 mb-1">{otpTimer} remaining</span>}
                  </div>
                  <input
                    name="otp"
                    value={loginData.otp}
                    onChange={handleLoginChange}
                    placeholder="Enter OTP"
                    type="text"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-center text-lg tracking-widest"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={sendLoginOtp}
                    disabled={loginLoading}
                    className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-50"
                  >
                    {loginLoading ? "Sending..." : "Send OTP"}
                  </button>
                  <button
                    onClick={verifyLoginOtp}
                    disabled={loginLoading}
                    className="py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {loginLoading ? "Verifying..." : "Login"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- REGISTER POPUP (Mobile-Friendly) ------------------------ */}
      {showRegisterPopup && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setShowRegisterPopup(false)}
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Design Element: Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-400 via-yellow-500 to-yellow-300" />

            <div className="p-6 md:p-10">
              <button
                onClick={() => setShowRegisterPopup(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-900 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">Create Account</h2>
                <p className="text-slate-500 font-medium text-sm md:text-base">Join QickTick today and get started</p>
              </div>

              {registerError && (
                <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm font-bold rounded-r-xl">
                  {registerError}
                </div>
              )}
              {registerSuccess && (
                <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm font-bold rounded-r-xl">
                  {registerSuccess}
                </div>
              )}

              <div className="space-y-4">
                {registerStep === 'form' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                      <input
                        name="name"
                        value={registerData.name}
                        onChange={handleRegisterChange}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-slate-900 text-sm"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                      <input
                        name="email"
                        type="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        placeholder="john@example.com"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-slate-900 text-sm"
                      />
                    </div>

                    <button
                      onClick={sendRegisterOtp}
                      disabled={registerLoading}
                      className="w-full py-3 bg-slate-900 text-yellow-500 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:bg-black hover:scale-105 active:scale-95 mt-4 disabled:opacity-50"
                    >
                      {registerLoading ? "Sending OTP..." : "Get Verification Code"}
                    </button>
                  </>
                ) : (
                  <div className="animate-in slide-in-from-right-4 duration-300">
                    <div className="space-y-4">
                      <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-100 mb-4">
                        <p className="text-xs text-yellow-800 font-bold text-center">
                          We've sent a code to <span className="underline">{registerData.email}</span>
                        </p>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Verification Code</label>
                        <input
                          name="otp"
                          value={registerData.otp}
                          onChange={handleRegisterChange}
                          placeholder="Enter Code"
                          type="text"
                          inputMode="numeric"
                          maxLength={8}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition-all font-medium text-center text-xl tracking-widest"
                        />
                      </div>

                      <button
                        onClick={verifyRegisterOtp}
                        disabled={registerLoading}
                        className="w-full py-3 bg-yellow-500 text-slate-900 rounded-xl font-bold text-sm uppercase tracking-wide shadow-lg transition-all hover:bg-yellow-400 hover:scale-105 active:scale-95 mt-4 disabled:opacity-50"
                      >
                        {registerLoading ? "Verifying..." : "Complete Registration"}
                      </button>

                      <button
                        onClick={() => setRegisterStep('form')}
                        className="w-full text-center text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-tighter"
                      >
                        ← Back to details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Register Popup */}
      {openVendor && (
        <VendorRegister
          onClose={() => setOpenVendor(false)}
          onSuccess={() => loadUserAndRole()} // Force reload after registration
        />
      )}
    </div>
  );
}
