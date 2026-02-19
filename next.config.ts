const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'example.com', // Change this to your actual image host
        port: '',
        pathname: '/**',
      },
    ],
  },
};
export default nextConfig;