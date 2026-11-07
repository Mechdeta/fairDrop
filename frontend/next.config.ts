import type { NextConfig } from "next";

const isStaticExport =
  process.env.NEXT_STATIC_EXPORT === "true" || process.env.GITHUB_ACTIONS === "true";
const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "fairDrop";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isStaticExport ? `/${repoName}` : "");

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
