// next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    swcMinify: true, // Use the SWC compiler for minification, faster than Terser
    webpack: (config, { isServer }) => {
      // Enable Tree Shaking
      config.optimization.usedExports = true;
  
      // Optimizations for faster builds and smaller bundles
      if (!isServer) {
        config.resolve.alias['@sentry/node'] = '@sentry/browser';
      }
  
      return config;
    },
    experimental: {
      modern: true, // Enable modern JavaScript output
      optimizeCss: true, // Enable CSS optimization
      scrollRestoration: true, // Enable scroll restoration for faster page navigation
    },
  };
  
  export default nextConfig;
  