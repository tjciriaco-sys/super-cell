import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: { remotePatterns: [{ protocol: "https", hostname: "storage.googleapis.com" }, { protocol: "https", hostname: "rgbrdtstbaulxhzievkh.supabase.co" }] },
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
};

export default nextConfig;
