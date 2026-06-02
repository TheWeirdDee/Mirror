/** @type {import('next').NextConfig} */
const nextConfig = {
  // turbopack: {} silences the "webpack config present but using Turbopack" warning.
  // asyncWebAssembly is needed for the CDR SDK TDH2 WASM module in production builds.
  turbopack: {},
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };
    return config;
  },
};

export default nextConfig;
