/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'dist',
  basePath: '/BlackJack',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
