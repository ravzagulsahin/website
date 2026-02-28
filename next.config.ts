import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
