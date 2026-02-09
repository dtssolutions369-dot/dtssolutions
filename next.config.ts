/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "xuzpwgsqaiaowmrzzrbo.supabase.co",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xuzpwgsqaiaowmrzzrbo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
