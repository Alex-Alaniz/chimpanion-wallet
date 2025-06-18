import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    '@privy-io/server-auth', 
    '@coinbase/agentkit',
    '@hpke/core',
    '@hpke/common',
    'bigint-buffer'
  ],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Client-side fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    
    return config;
  },
};

export default nextConfig;
