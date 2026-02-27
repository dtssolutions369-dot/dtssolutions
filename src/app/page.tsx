"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Wait for 1 second (1000ms) then redirect
    const timer = setTimeout(() => {
      router.push("/customer/dashboard");
    }, 1000);

    return () => clearTimeout(timer); // Cleanup timer on unmount
  }, [router]);

  return (
    <div style={styles.container}>
      <div style={styles.loader}></div>
      <h2 style={styles.text}>DTS Solutions</h2>
      <p>Loading your dashboard...</p>
    </div>
  );
}

// Simple styling for the loader
const styles = {
  container: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    backgroundColor: "#ffffff",
    fontFamily: "Arial, sans-serif",
  },
  loader: {
    border: "4px solid #f3f3f3",
    borderTop: "4px solid #3498db",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    animation: "spin 1s linear infinite",
    marginBottom: "20px",
  },
  text: {
    color: "#333",
    fontSize: "1.5rem",
    fontWeight: "bold",
  }
};