import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";
// 테스트 빌드는 basePath 없이 — Playwright는 http-server에 루트로 서빙
const skipBasePath = process.env.NEXT_SKIP_BASE_PATH === "1";

// GitHub Pages serves the repo at /Sales-CRM_OKR
const repoBasePath = "/Sales-CRM_OKR";
const useBasePath = isProd && !skipBasePath;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: useBasePath ? repoBasePath : "",
  assetPrefix: useBasePath ? `${repoBasePath}/` : "",
  env: {
    NEXT_PUBLIC_BASE_PATH: useBasePath ? repoBasePath : "",
  },
};

export default nextConfig;
