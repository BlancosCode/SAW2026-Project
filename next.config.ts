import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-e1fa46a5bf3247458bfcc1e76d46fc20.r2.dev",
        port: "",
        pathname: "/**",
      }
    ],
  },
  reactStrictMode: true,
};

// Service Worker gestiti, come tutta la parte delle notifiche, con un grande aiuto da Gemini 
const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

export default withPWA(nextConfig);