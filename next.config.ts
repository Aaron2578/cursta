import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Allow cross-origin requests from network IPs during development
  allowedDevOrigins: [
    "192.168.1.3:3000",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
  experimental: {
    // Use system TLS certificates for font loading (fixes Google Fonts TLS warnings)
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
