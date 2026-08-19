import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16.3.x has an open RSC response-abort/HMR stream issue.
    // Keep this off while developing the admin frontend locally.
    serverComponentsHmrCancellation: false,
  },
};

export default nextConfig;
