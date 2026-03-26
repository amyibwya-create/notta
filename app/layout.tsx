import type { Metadata } from 'next'
import localFont from 'next/font/local'
import './globals.css'
import { AppShell } from '@/components/layout/AppShell'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'Notta Ad Clips — Extract ad angles from your meetings',
  description:
    'Turn your weekly management meeting transcripts into structured, US-native advertising clips. Powered by Claude.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
