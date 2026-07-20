import Link from 'next/link'
import { ArrowRight, Check, Code2, FormInput, Megaphone } from 'lucide-react'
import type { Project } from '@/lib/types'
import { Button } from '@/components/ui/button'

export function ProjectHome({ project }: { project: Project }) {
  const feedbackEnabled = project.settings?.widget_config?.feedbackEnabled !== false

  return (
    <div className="animate-fade-in">
      <header className="grid gap-5 border-b border-foreground/10 pb-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">{project.name}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em]">Your product feedback loop</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Collect useful feedback from users, then show them what improved. Both experiences use the same installed connection.
          </p>
        </div>
        <Button asChild>
          <Link href={`/projects/${project.id}/install`}>Install or verify connection <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </header>

      <div className="grid border-b border-foreground/10 lg:grid-cols-2">
        <ProductLane
          icon={<FormInput className="h-5 w-5" />}
          direction="Users → your team"
          title="Collect feedback from users"
          description="Shape the in-product form, choose the fields, and receive every message with useful technical context."
          status={feedbackEnabled ? 'Enabled' : 'Disabled'}
          href={`/projects/${project.id}/feedback-form`}
          action="Customize feedback form"
        />
        <ProductLane
          icon={<Megaphone className="h-5 w-5" />}
          direction="Your team → users"
          title="Show product updates to users"
          description="Create a polished “What’s new” popup that appears inside your product when there is something worth announcing."
          href={`/projects/${project.id}/release-notes`}
          action="Manage updates for users"
          className="border-t border-foreground/10 lg:border-l lg:border-t-0"
        />
      </div>

      <section className="grid gap-6 py-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex gap-4">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-foreground text-background"><Code2 className="h-4 w-4" /></span>
          <div>
            <h2 className="text-sm font-semibold">One connection, installed once</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">The code stays stable. Save form changes or publish user-facing updates here, and the installed embed receives them automatically.</p>
          </div>
        </div>
        <ol className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {['Copy embed', 'Verify one test', 'Manage remotely'].map((label) => <li key={label} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" />{label}</li>)}
        </ol>
      </section>
    </div>
  )
}

function ProductLane({ icon, direction, title, description, status, href, action, className = '' }: {
  icon: React.ReactNode
  direction: string
  title: string
  description: string
  status?: string
  href: string
  action: string
  className?: string
}) {
  return (
    <section className={`group py-8 lg:px-8 lg:first:pl-0 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</span>
        {status && <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary" />{status}</span>}
      </div>
      <p className="mt-8 text-xs font-medium text-muted-foreground">{direction}</p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight">{title}</h2>
      <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground transition-colors hover:text-primary">
        {action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </section>
  )
}
