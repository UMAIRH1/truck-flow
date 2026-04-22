/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  transpilePackages: ['lucide-react'],
  turbopack: {
    root: '.',
  },
};

export default nextConfig;
