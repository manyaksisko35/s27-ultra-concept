import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    async headers() {
    return [
      {
        source: '/(model|draco)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};



export default nextConfig;
