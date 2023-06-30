/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'unisat.io',
        port: '',
        pathname: '/img/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.website-files.com',
        port: '',
        pathname: '/{624b08d53d7ac60ccfc11d8d,62cd53cfaed4257f165f6576}/**',
      },
    ],
  },
}

module.exports = nextConfig
