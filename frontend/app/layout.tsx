import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/Navbar'
import { Providers } from '@/components/providers' 


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Next-Gen LMS Portal',
  description: 'High-performance LMS with Drive videos, blockchain certs, real-time labs',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
<html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <main className="container mx-auto p-8">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
