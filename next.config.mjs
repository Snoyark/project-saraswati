/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.module.rules.push({
      test: /\.cjs$/,
      type: "javascript/auto",
      resolve: {
        fullySpecified: false
      }
    });
    return config;
  }
};

export default nextConfig;
