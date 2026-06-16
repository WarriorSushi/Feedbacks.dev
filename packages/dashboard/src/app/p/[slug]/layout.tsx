import type { Metadata } from 'next'
import { BrandWordmark } from '@/components/brand-wordmark'

export const metadata: Metadata = {
  title: 'Feature Board — feedbacks.dev',
  description: 'Vote on features and share your feedback',
}

export default function PublicBoardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {children}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 mt-12">
        <div className="mx-auto max-w-4xl px-4 flex items-center justify-center gap-2 text-sm text-gray-400 dark:text-gray-500">
          <span>Powered by</span>
          <a
            href="https://feedbacks.dev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-gray-600 transition-colors hover:text-indigo-600 dark:text-gray-300 dark:hover:text-indigo-400"
          >
            <BrandWordmark markClassName="h-4 w-4" dotClassName="text-current" />
          </a>
        </div>
      </footer>
    </div>
  )
}
