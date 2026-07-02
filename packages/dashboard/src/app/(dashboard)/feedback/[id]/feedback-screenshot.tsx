'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { ExternalLink, ImageIcon, Maximize2, X } from 'lucide-react'

export function FeedbackScreenshot({ src }: { src: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="group relative flex h-52 w-full items-center justify-center overflow-hidden rounded-md border bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="View feedback screenshot"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt="Feedback screenshot preview"
            className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-[1.01]"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-md bg-background/95 px-3 py-2 text-xs font-medium shadow-sm ring-1 ring-border backdrop-blur-sm">
            <Maximize2 className="h-3.5 w-3.5" />
            View screenshot
          </span>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/75 data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-4 z-50 flex flex-col overflow-hidden rounded-md border bg-background shadow-2xl focus:outline-none sm:inset-8">
          <div className="flex h-14 shrink-0 items-center justify-between border-b px-4">
            <div className="flex min-w-0 items-center gap-2">
              <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Dialog.Title className="truncate text-sm font-semibold">Feedback screenshot</Dialog.Title>
              <Dialog.Description className="sr-only">
                Full-size screenshot submitted with this feedback.
              </Dialog.Description>
            </div>
            <div className="flex items-center gap-1">
              <a
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Open original</span>
              </a>
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Close screenshot"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto bg-black/90 p-3 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="Feedback screenshot" className="max-h-full max-w-full object-contain" />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
