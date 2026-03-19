import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export const metadata: Metadata = {
  title: "RÉCUPÉO — L'IA qui récupère ce qu'on vous doit",
  description: "Uploadez vos documents. Notre IA détecte les erreurs et génère les courriers pour récupérer votre argent.",
  metadataBase: new URL('https://recupeo.fr'),
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "RÉCUPÉO — L'IA qui récupère ce qu'on vous doit",
    description: 'Uploadez vos documents. Notre IA détecte les erreurs et génère les courriers pour récupérer votre argent.',
    url: 'https://recupeo.fr',
    siteName: 'RÉCUPÉO',
    locale: 'fr_FR',
    type: 'website',
    images: [{ url: '/api/og', width: 1200, height: 630, alt: 'RÉCUPÉO — Uploadez. Vérifiez. Récupérez.' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RÉCUPÉO — L'IA qui récupère ce qu'on vous doit",
    description: 'Uploadez vos documents. Notre IA détecte les erreurs et génère les courriers.',
    images: ['/api/og'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga4-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:true})`}
            </Script>
          </>
        )}
      </head>
      <body className="font-body text-slate-text antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <ChatWidget />
      </body>
    </html>
  )
}
