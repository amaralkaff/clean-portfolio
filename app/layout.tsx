import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from './context/ThemeContext'
import ErrorBoundary from './components/ErrorBoundary'
import DynamicFavicon from './components/DynamicFavicon'

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'], 
  display: 'swap',
  preload: true,
  variable: '--font-jetbrains-mono',
  fallback: ['Monaco', 'Menlo', 'Ubuntu Mono', 'monospace']
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'amangLy.',
  description: 'amangLy. - A personal portfolio by amangly.',
  keywords: ['portfolio', 'developer', 'web development', 'react', 'nextjs'],
  authors: [{ name: 'amangLy' }],
  icons: {
    icon: [
      { url: '/favicon-light.svg', media: '(prefers-color-scheme: light)' },
      { url: '/favicon-dark.svg', media: '(prefers-color-scheme: dark)' }
    ],
    shortcut: '/favicon-light.svg',
    apple: '/favicon-light.svg',
  },
  openGraph: {
    title: 'amangLy. - Portfolio',
    description: 'amangLy. - A personal portfolio by amangly.',
    siteName: 'amangLy.',
    url: 'https://amangly.pro',
    type: 'website',
    images: [
      {
        url: 'https://amangly.pro/images/image.png',
        width: 1200,
        height: 630,
        alt: 'amangLy. Portfolio Preview Image',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'amangLy. - Portfolio',
    description: 'amangLy. - A personal portfolio by amangly.',
    images: ['https://amangly.pro/images/image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.live" />
        <link rel="dns-prefetch" href="https://vitals.vercel-analytics.com" />
      </head>
      <body className={`${jetbrainsMono.variable} font-mono`}>
        <ErrorBoundary>
          <ThemeProvider>
            <DynamicFavicon />
            {children}
            <SpeedInsights />
            <Analytics />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}