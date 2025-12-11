/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable server components
    serverComponentsExternalPackages: ['@huggingface/hub', '@huggingface/inference'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'huggingface.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.huggingface.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // Enable static exports for Hugging Face Spaces
  output: process.env.NODE_ENV === 'production' && process.env.HF_SPACE ? 'export' : undefined,
  trailingSlash: true,
  // Skip building pages that use server-side features during static export
  distDir: '.next',
  cleanDistDir: true,
};

export default nextConfig;