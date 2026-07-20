import Link from 'next/link'
import { ArrowRight, Code2, FormInput, Megaphone } from 'lucide-react'
import type { Project } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function ProjectHome({ project }: { project: Project }) {
  const feedbackEnabled = project.settings?.widget_config?.feedbackEnabled !== false

  return (
    <div className="space-y-8">
      <section className="border-b pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Project home</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">What do you want to manage?</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {project.name} uses one small embed for two separate products. Install it once, then manage both products here without changing your site code.
        </p>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <ProductCard
          icon={<FormInput className="h-5 w-5" />}
          eyebrow="Feedback collection"
          title="Feedback form"
          description="Collect bugs, ideas, questions, ratings, screenshots, and contact details from inside your product."
          detail="You control the button, placement, fields, wording, and anti-spam settings remotely."
          status={feedbackEnabled ? 'Enabled' : 'Disabled'}
          href={`/projects/${project.id}/feedback-form`}
          action="Manage feedback form"
        />
        <ProductCard
          icon={<Megaphone className="h-5 w-5" />}
          eyebrow="In-product communication"
          title="Release notes"
          description="Publish “What’s new” announcements that appear inside your users’ product."
          detail="Create, preview, schedule, and publish announcements. This is not a log of feedbacks.dev website changes."
          href={`/projects/${project.id}/release-notes`}
          action="Open release notes"
        />
      </div>

      <Card className="overflow-hidden border-primary/25 bg-primary/[0.035]">
        <CardContent className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="flex gap-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Code2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">One shared embed</h2>
                <Badge variant="secondary">Install once</Badge>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Add the public project embed to your app shell. After that, saved changes to the feedback form and release notes arrive remotely on the next page load—no replacement snippet or redeploy required.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-muted-foreground" aria-label="Product setup flow">
                <span className="rounded-md border bg-background px-2.5 py-1.5">1. Install embed</span>
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="rounded-md border bg-background px-2.5 py-1.5">2. Verify connection</span>
                <ArrowRight className="h-3.5 w-3.5" />
                <span className="rounded-md border bg-background px-2.5 py-1.5">3. Manage remotely</span>
              </div>
            </div>
          </div>
          <Button asChild>
            <Link href={`/projects/${project.id}/install`}>Open embed installation</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function ProductCard({
  icon,
  eyebrow,
  title,
  description,
  detail,
  status,
  href,
  action,
}: {
  icon: React.ReactNode
  eyebrow: string
  title: string
  description: string
  detail: string
  status?: string
  href: string
  action: string
}) {
  return (
    <Card className="group transition-colors hover:border-primary/35">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</span>
          {status && <Badge variant="outline">{status}</Badge>}
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-foreground/90">{description}</p>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{detail}</p>
        <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {action}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardContent>
    </Card>
  )
}
