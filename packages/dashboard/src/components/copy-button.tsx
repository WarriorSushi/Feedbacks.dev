'use client'

import * as React from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CopyButtonProps extends Omit<ButtonProps, 'onClick'> {
  value: string
  label?: string
  copiedLabel?: string
  iconOnly?: boolean
  onCopied?: () => void
}

export function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  iconOnly = false,
  onCopied,
  className,
  disabled,
  ...props
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    onCopied?.()
    setCopied(true)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => setCopied(false), 1800)
  }

  const visibleLabel = copied ? copiedLabel : label

  return (
    <Button
      type="button"
      onClick={() => void handleCopy()}
      disabled={disabled || !value}
      aria-label={iconOnly ? visibleLabel : undefined}
      className={cn('transition active:translate-y-px', className)}
      {...props}
    >
      {copied ? <Check className={cn('h-4 w-4', !iconOnly && 'mr-2')} /> : <Copy className={cn('h-4 w-4', !iconOnly && 'mr-2')} />}
      {iconOnly ? <span className="sr-only" aria-live="polite">{visibleLabel}</span> : <span aria-live="polite">{visibleLabel}</span>}
    </Button>
  )
}
