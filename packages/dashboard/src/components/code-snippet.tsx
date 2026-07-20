'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { CopyButton } from '@/components/copy-button'

interface CodeTab {
  label: string
  code: string
  language: string
}

interface CodeSnippetProps {
  tabs: CodeTab[]
  className?: string
  wrap?: boolean
  maxHeightClassName?: string
}

export function CodeSnippet({ tabs, className, wrap = false, maxHeightClassName }: CodeSnippetProps) {
  const [activeTab, setActiveTab] = React.useState(0)

  return (
    <div className={cn('overflow-hidden rounded-lg border bg-muted', className)}>
      {tabs.length > 1 && (
        <div className="flex border-b bg-muted/50">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-colors',
                i === activeTab
                  ? 'border-b-2 border-primary text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}
      <div className="relative">
        <CopyButton
          value={tabs[activeTab].code}
          label="Copy"
          copiedLabel="Copied"
          variant="outline"
          size="sm"
          className="absolute right-2 top-2 z-10 h-8 border-zinc-600 bg-zinc-800 px-2 text-xs text-zinc-100 shadow-md hover:bg-zinc-700 hover:text-zinc-50"
        />
        <pre
          tabIndex={0}
          aria-label={`${tabs[activeTab].label} code`}
          className={cn(
            'p-4 pr-24 text-sm',
            wrap ? 'overflow-x-hidden overflow-y-auto whitespace-pre-wrap break-words' : 'overflow-x-auto',
            maxHeightClassName
          )}
        >
          <code className="font-mono text-current">
            {tabs[activeTab].code}
          </code>
        </pre>
      </div>
    </div>
  )
}
