import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.themealdb.com',
        pathname: '/images/**',
      },
      // AnN add: Allow S3 bucket images on 10/29
      {
        protocol: 'https',
        hostname: 'gather-recipe-photos-annguyen.s3.us-east-1.amazonaws.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
