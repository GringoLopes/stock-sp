/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    domains: ['localhost'],
    unoptimized: false,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
}

export default nextConfig
