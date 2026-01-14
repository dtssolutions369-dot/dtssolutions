/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'hrusjzopebjlgbqeacxy.supabase.co', // your first Supabase project
      'bytiwvxkqxcbeywuijpl.supabase.co', // your new Supabase project
      // add more hostnames if needed in the future
    ],
  },
};

module.exports = nextConfig;
