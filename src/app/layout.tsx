import "./globals.css";

export const metadata = {
  title: "Dts Solutions",
  description: "Business profile based ecommerce website.",
  icons: {
    icon: "/logo.png", // Points to public/logo.png
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}