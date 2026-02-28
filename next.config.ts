import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // OneDrive altında readlink hatası alıyorsan: $env:NEXT_DIST_DIR="C:\Temp\website-next"; npm run build
  ...(process.env.NEXT_DIST_DIR && { distDir: process.env.NEXT_DIST_DIR }),
  webpack: (config) => {
    // pdfjs-dist optionally requires 'canvas' (Node-only); we use it in the browser only.
    config.resolve.fallback = { ...config.resolve?.fallback, canvas: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ykychxpadhdffpcqticr.supabase.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
