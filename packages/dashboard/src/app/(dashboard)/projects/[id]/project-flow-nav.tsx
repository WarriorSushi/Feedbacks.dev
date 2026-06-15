import Link from 'next/link'

export type ProjectSection = 'setup' | 'integrations' | 'board' | 'api' | 'settings'
export type SetupStep = 'customize' | 'install' | 'verify' | 'inbox'

export function ProjectMenu({
  projectId,
  activeSection,
}: {
  projectId: string
  activeSection: ProjectSection
}) {
  const items: Array<{ id: ProjectSection; label: string; href: string }> = [
    { id: 'setup', label: 'Setup', href: `/projects/${projectId}?tab=customize` },
    { id: 'integrations', label: 'Integrations', href: `/projects/${projectId}?tab=integrations` },
    { id: 'board', label: 'Public Board', href: `/projects/${projectId}?tab=board` },
    { id: 'api', label: 'API', href: `/projects/${projectId}?tab=api` },
    { id: 'settings', label: 'Settings', href: `/projects/${projectId}?tab=settings` },
  ]

  return (
    <nav
      aria-label="Project menu"
      className="sticky top-0 z-10 -mx-1 overflow-x-auto border-b bg-background/95 px-1 py-2 backdrop-blur"
    >
      <div className="flex min-w-max gap-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            aria-current={activeSection === item.id ? 'page' : undefined}
            className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeSection === item.id
                ? 'bg-primary/10 text-foreground'
                : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}

export function SetupProgress({
  projectId,
  activeStep,
}: {
  projectId: string
  activeStep: SetupStep
}) {
  const steps: Array<{ id: SetupStep; label: string; body: string; href: string }> = [
    {
      id: 'customize',
      label: 'Customize',
      body: 'Pick how the form looks.',
      href: `/projects/${projectId}?tab=customize`,
    },
    {
      id: 'install',
      label: 'Install',
      body: 'Copy code for your site.',
      href: `/projects/${projectId}?tab=install`,
    },
    {
      id: 'verify',
      label: 'Verify',
      body: 'Send one test.',
      href: `/projects/${projectId}/verify`,
    },
    {
      id: 'inbox',
      label: 'Inbox',
      body: 'Check it arrived.',
      href: `/feedback?projectId=${projectId}`,
    },
  ]

  return (
    <nav aria-label="Setup steps" className="rounded-lg border bg-card p-2">
      <ol className="grid gap-2 md:grid-cols-4">
        {steps.map((step, index) => {
          const current = activeStep === step.id
          return (
            <li key={step.id}>
              <Link
                href={step.href}
                className={`flex min-h-14 gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                  current ? 'bg-primary/10 text-foreground' : 'text-muted-foreground hover:bg-muted/40 hover:text-foreground'
                }`}
                aria-current={current ? 'step' : undefined}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    current ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.label}</span>
                  <span className="mt-0.5 block text-xs leading-4">{step.body}</span>
                </span>
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
