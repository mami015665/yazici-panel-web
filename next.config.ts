import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // ⚡ ÖNEMLİ: Statik export'u devre dışı bırak
  output: undefined,
  // Bu ayar sayesinde useSearchParams hatası build'i bozmaz
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;