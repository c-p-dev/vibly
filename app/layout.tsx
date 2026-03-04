import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { StoreHydration } from '@/components/StoreHydration'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vibly — Play the vibe. Layer the message.',
  description:
    'Keep your favorite YouTube music as the main track while running subliminal and ambient layers quietly underneath — saved as one-click sessions.',
  keywords: ['subliminals', 'lofi', 'focus music', 'ambient', 'study music', 'youtube player'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} flex min-h-dvh flex-col`}>
        <StoreHydration />
        <NavBar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
