import Link from 'next/link'
import { ArrowRight, BookOpen, Code2, FolderOpen, Globe, Inbox, MessageSquare, Webhook } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    body: 'Create one project for each app or website where you want to collect feedback.',
    href: '/projects/new',
    Icon: FolderOpen,
    cta: 'Create project',
  },
  {
    title: 'Customize the feedback form',
    body: 'Open a project, then use Customize to set labels, placement, color, and optional fields.',
    href: '/projects',
    Icon: MessageSquare,
    cta: 'Open projects',
  },
  {
    title: 'Install and send a test',
    body: 'Copy the Website snippet from a project, paste it into your site, then send one test item.',
    href: '/projects',
    Icon: Code2,
    cta: 'Open install',
  },
  {
    title: 'Triage the inbox',
    body: 'Learn what unread, status, tags, priority, and public/private mean.',
    href: '/feedback',
    Icon: Inbox,
    cta: 'Open inbox',
  },
  {
    title: 'Publish a public board',
    body: 'Use project board settings to choose what becomes public for votes and discussion.',
    href: '/dashboard/boards',
    Icon: Globe,
    cta: 'Open boards',
  },
  {
    title: 'Connect routing',
    body: 'Learn what integrations do before sending real feedback to another tool.',
    href: '/integrations',
    Icon: Webhook,
    cta: 'Open routing',
  },
]

export default function TutorialsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
          Tutorials
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Learn feedbacks.dev</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start with the map, then open the real product surface for the job you want to learn.
        </p>
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
