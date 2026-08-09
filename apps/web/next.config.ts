import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@risksphere/shared-types'],
};

export default nextConfig;
