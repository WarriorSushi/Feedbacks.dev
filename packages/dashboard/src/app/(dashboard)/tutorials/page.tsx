import Link from 'next/link'
import { ArrowRight, BookOpen, Code2, FolderOpen, Globe, Inbox, MessageSquare, Play, Webhook } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const tutorials = [
  {
    title: 'Learn the dashboard map',
    body: 'A short sidebar tour. It shows where each main area lives and what each one is for.',
    href: '/dashboard?tour=1',
    Icon: BookOpen,
    cta: 'Start tour',
  },
  {
    title: 'Create a project',
    body: 'Practice naming a project and understanding what belongs inside one project.',
    href: '/tutorials/practice?lesson=project',
    Icon: FolderOpen,
    cta: 'Practice',
  },
  {
    title: 'Customize the feedback form',
    body: 'Try labels, placement, color, and fields without changing a real project.',
    href: '/tutorials/practice?lesson=form',
    Icon: MessageSquare,
    cta: 'Practice',
  },
  {
    title: 'Install and send a test',
    body: 'Walk through the snippet, then send fake feedback into the practice inbox.',
    href: '/tutorials/practice?lesson=install',
    Icon: Code2,
    cta: 'Practice',
  },
  {
    title: 'Triage the inbox',
    body: 'Learn what unread, status, tags, priority, and public/private mean.',
    href: '/tutorials/practice?lesson=inbox',
    Icon: Inbox,
    cta: 'Practice',
  },
  {
    title: 'Publish a public board',
    body: 'See how a request becomes visible for votes and public discussion.',
    href: '/tutorials/practice?lesson=board',
    Icon: Globe,
    cta: 'Practice',
  },
  {
    title: 'Connect routing',
    body: 'Learn what integrations do before sending real feedback to another tool.',
    href: '/tutorials/practice?lesson=integrations',
    Icon: Webhook,
    cta: 'Practice',
  },
]

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
            Tutorials
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Learn feedbacks.dev safely</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Start with the map, then practice one job at a time. Practice mode uses dummy data and never changes your real projects.
          </p>
        </div>
        <Link href="/tutorials/practice">
          <Button className="gap-2">
            <Play className="h-4 w-4" />
            Open practice mode
          </Button>
        </Link>
      </div>

      <Card className="border-primary/25 bg-primary/[0.035]">
        <CardHeader>
          <CardTitle className="text-base">Recommended order</CardTitle>
          <CardDescription>
            If you are new, follow this path once: map, project, form, install, inbox.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-5">
          {['Map', 'Project', 'Form', 'Install', 'Inbox'].map((step, index) => (
            <div key={step} className="rounded-lg border bg-background px-3 py-2 text-sm">
              <span className="mr-1 font-semibold text-primary">{index + 1}.</span>
              {step}
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2">
        {tutorials.map(({ title, body, href, Icon, cta }) => (
          <Link
            key={title}
            href={href}
            className="group rounded-xl border bg-card p-4 transition-colors hover:border-primary/35 hover:bg-accent/35"
          >
            <span className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border bg-background text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{title}</span>
                <span className="mt-1 block text-sm leading-6 text-muted-foreground">{body}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
