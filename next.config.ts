import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

// GitHub Pages serves the repo at /Sales-CRM_OKR — basePath needed in prod only
const repoBasePath = "/Sales-CRM_OKR";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: isProd ? repoBasePath : "",
  assetPrefix: isProd ? `${repoBasePath}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? repoBasePath : "",
  },
};

export default nextConfig;
