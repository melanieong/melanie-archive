/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.applesfromny.com',
      },
      {
        protocol: 'http',
        hostname: 'melanie-archive-backend.local',
      }
    ],
  },
};

export default nextConfig;
