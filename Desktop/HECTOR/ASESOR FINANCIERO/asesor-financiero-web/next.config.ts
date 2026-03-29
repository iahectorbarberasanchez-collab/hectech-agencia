// The original attempt to use import for a CJS module was incorrect.
// This uses `require` which is compatible with `.ts` files for CJS modules.
// It also changes the export to a default export.

/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // Example configuration for a remote image source:
      // {
      //   protocol: 'https',
      //   hostname: 'example.com',
      //   port: '',
      //   pathname: '/images/**',
      // },
    ],
  },
};

export default withBundleAnalyzer(nextConfig);
