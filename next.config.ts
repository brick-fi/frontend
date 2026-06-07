import type { NextConfig } from "next";

function getConfiguredAssetHostname() {
  const publicBaseUrl = process.env.PROPERTY_ASSETS_PUBLIC_BASE_URL
  if (!publicBaseUrl) return null

  try {
    return new URL(publicBaseUrl).hostname
  } catch {
    return null
  }
}

const propertyAssetsHostname = getConfiguredAssetHostname()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      ...(propertyAssetsHostname ? [{ protocol: "https" as const, hostname: propertyAssetsHostname }] : []),
    ],
  },
};

export default nextConfig;
