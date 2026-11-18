/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ensure smooth standalone or static compatibility on Vercel
  output: 'standalone',
};

module.exports = nextConfig;
