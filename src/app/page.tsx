"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // 4-second delay before safe navigation
    const timer = setTimeout(() => {
      // Using window.location guarantees a clean DOM flush, 
      // preventing React fiber reconciliation tree conflicts.
      window.location.href = "/customer/dashboard";
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={styles.container}>
      {/* Logo container */}
      <div style={styles.logoWrapper}>
        <Image
          src="/icon-background.webp"
          alt="DTS Solutions Logo"
          width={90}
          height={90}
          style={styles.logo}
          priority
        />
      </div>

      <div style={styles.loader}></div>
      <h2 style={styles.text}>Welcome to DTS Solutions</h2>
      <p style={styles.subText}>Your trusted local store experience...</p>
    </div>
  );
}

// Minimalist black and white styling
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
    textAlign: "center" as const,
  },
  logoWrapper: {
    marginBottom: "24px",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)",
    border: "1px solid #eaeaea",
    padding: "10px",
    backgroundColor: "#ffffff",
  },
  logo: {
    objectFit: "cover" as const,
    borderRadius: "12px",
  },
  loader: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #000000",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  text: {
    color: "#000000",
    fontSize: "1.5rem",
    fontWeight: "bold",
    letterSpacing: "-0.5px",
    marginBottom: "8px",
  },
  subText: {
    color: "#666666",
    fontSize: "0.95rem",
  }
};