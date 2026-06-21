import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-e1fa46a5bf3247458bfcc1e76d46fc20.r2.dev',
        port: '',
        pathname: '/**',
      }
    ],
  },
};

export default nextConfig;