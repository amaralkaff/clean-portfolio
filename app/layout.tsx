import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { ThemeProvider } from './context/ThemeContext'
import CreatureAnimationWrapper from './components/CreatureAnimationWrapper'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'amangLy.',
  description: 'amangLy. - A personal portfolio by amangly.',
  keywords: ['portfolio', 'developer', 'web development', 'react', 'nextjs'],
  authors: [{ name: 'amangLy' }],
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
      <body className={inter.className}>
        <ThemeProvider>
          <CreatureAnimationWrapper />
          {children}
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}