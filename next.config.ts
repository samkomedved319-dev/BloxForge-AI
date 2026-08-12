import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow the preview panel origin to access HMR/WebSocket without
  // "Cross origin request detected" errors.
  allowedDevOrigins: [
    "bloxforge1.space-z.ai",
    "*.space-z.ai",
  ],
};

export default nextConfig;
