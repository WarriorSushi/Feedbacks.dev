'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export function LandingScrollHeader({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn('landing-header sticky top-0 z-50 border-b border-transparent transition-[background-color,border-color,box-shadow] duration-300', scrolled && 'landing-header-scrolled')}>
      {children}
    </header>
  )
}
