/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@samudra-paket-erp/shared", "@samudra-paket-erp/types"],
  eslint: {
    dirs: ['src'],
  },
};

module.exports = nextConfig;
