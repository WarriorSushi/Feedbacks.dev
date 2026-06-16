'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'

interface BrandWordmarkProps {
  className?: string
  markClassName?: string
  textClassName?: string
  dotClassName?: string
  priority?: boolean
}

export function BrandWordmark({
  className,
  markClassName,
  textClassName,
  dotClassName,
  priority = false,
}: BrandWordmarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Image
        src="/new_logo_feedbacks.dev.svg"
        alt=""
        width={28}
        height={28}
        priority={priority}
        aria-hidden="true"
        className={cn('h-6 w-6 shrink-0 rounded-md object-contain', markClassName)}
      />
      <span className={cn('tracking-tight', textClassName)}>
        feedbacks<span className={cn('text-primary', dotClassName)}>.dev</span>
      </span>
    </span>
  )
}
