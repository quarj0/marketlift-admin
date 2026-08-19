import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    serverComponentsHmrCache: false,
  },
};

export default nextConfig;
