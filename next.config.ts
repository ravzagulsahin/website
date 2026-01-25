import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "pub-6a949c6f08b84faa9b3737d9400e7368.r2.dev" },
      { protocol: "https", hostname: "pub-6438579e8c204041b4daeffa5bee552c.r2.dev" },
    ],
  },
};

export default nextConfig;
