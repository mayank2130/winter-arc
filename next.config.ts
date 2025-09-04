/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['utfs.io'], // UploadThing domain
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig