import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,

  // Defence-in-depth security headers (middleware also sets these)
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",           value: "DENY" },
          { key: "X-Content-Type-Options",     value: "nosniff" },
          { key: "Referrer-Policy",            value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",         value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
        ],
      },
    ];
  },
};

export default nextConfig;
