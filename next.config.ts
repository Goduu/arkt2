import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_SIGNALING_SERVER: process.env.NEXT_PUBLIC_SIGNALING_SERVER || 'ws://localhost:4444',
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  // Experimental features with Turbopack configuration
  serverExternalPackages: ['yjs', 'y-webrtc'],
  turbopack: {
    rules: {
      // Handle WebRTC and related modules
      '*.wasm': {
        loaders: ['@turbo/loader-wasm'],
        as: '*.wasm',
      },
    },
    resolveAlias: {
      // Turbopack aliases for WebRTC dependencies
      'simple-peer': 'simple-peer/simplepeer.min.js',
    },
    resolveExtensions: [
      '.mdx',
      '.tsx',
      '.ts',
      '.jsx',
      '.js',
      '.mjs',
      '.json',
    ],
  }
};

export default nextConfig;
