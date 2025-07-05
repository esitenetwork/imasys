import type { NextConfig } from "next";
import createMDX from '@next/mdx'

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  eslint: {
    // ビルド時にESLintエラーを完全に無視
    ignoreDuringBuilds: true,
  },
  typescript: {
    // ビルド時にTypeScriptエラーを完全に無視
    ignoreBuildErrors: true,
  },
  // Vercel専用設定
  experimental: {
    // 型チェックを無効化
    typedRoutes: false,
  },
};

export default withMDX(nextConfig);