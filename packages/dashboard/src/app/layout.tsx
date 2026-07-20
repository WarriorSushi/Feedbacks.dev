import '@/lib/env' // validate env vars at startup
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'feedbacks.dev | Feedback forms and product updates',
    template: '%s | feedbacks.dev',
  },
  description: 'Collect in-product feedback and show product updates to users with one lightweight embed. Install once, verify, and manage remotely.',
  icons: {
    icon: [
      { url: '/new_logo_feedbacks.dev.svg', type: 'image/svg+xml' },
    ],
    shortcut: [{ url: '/new_logo_feedbacks.dev.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/new_logo_feedbacks.dev.svg', type: 'image/svg+xml' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
