/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: "images.pexels.com",
        port: '',
        pathname: '/**',
      },
    ],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
      }; 
    }

    return config;
  },

}

export default nextConfig;
