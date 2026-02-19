import "./globals.css";

export const metadata = {
  title: "Ecommerce Business Platform",
  description: "Business profile based ecommerce website",
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
