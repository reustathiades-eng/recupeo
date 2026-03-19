import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'recupeo.fr' },
      { protocol: 'https', hostname: 'cdn2.tendance-parfums.com' },
    ],
  },
  serverExternalPackages: ['pdfkit'],
}

export default withPayload(nextConfig)
