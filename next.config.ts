import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
        port: "",
        pathname: "/7.x/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.civitatis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.omintassistance.com.ar",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "services.meteored.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ipfvcnhybjlewzohvttg.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
