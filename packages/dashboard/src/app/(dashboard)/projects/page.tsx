import { createServerSupabase } from '@/lib/supabase-server'
import { getCurrentUserBillingSummary } from '@/lib/billing'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Project } from '@/lib/types'
import Link from 'next/link'
import { ArrowRight, Code2, FolderOpen, Inbox, Key, Plus } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const billingSummary = await getCurrentUserBillingSummary()

  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('owner_user_id', user!.id)
    .order('created_at', { ascending: false })

  // Get feedback counts per project
  const { data: counts } = await supabase
    .from('feedback')
    .select('project_id')
    .eq('is_archived', false)

  const countMap = new Map<string, number>()
  counts?.forEach((c) => {
    countMap.set(c.project_id, (countMap.get(c.project_id) || 0) + 1)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          {billingSummary && (
            <p className="mt-1 text-sm text-muted-foreground">
              {billingSummary.entitlements.label} plan · {billingSummary.usage.projectCount}
              {billingSummary.entitlements.projectLimit
                ? ` of ${billingSummary.entitlements.projectLimit} projects used`
                : ' projects'}
            </p>
          )}
        </div>
        <Link href="/projects/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> New Project
          </Button>
        </Link>
      </div>

      {billingSummary?.entitlements.projectLimit &&
        billingSummary.usage.projectCount >= billingSummary.entitlements.projectLimit && (
          <Card className="border-primary/30 bg-primary/[0.04]">
            <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Free plan project limit reached</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to Pro to create more projects without deleting existing ones.
                </p>
              </div>
              <Link href="/billing">
                <Button variant="outline">Open Billing</Button>
              </Link>
            </CardContent>
          </Card>
        )}

      {!projects || projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderOpen className="h-10 w-10 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">No projects yet</p>
            <p className="mt-1 text-xs text-muted-foreground max-w-[240px]">
              Create one project, copy the Website snippet, then verify one test feedback item.
            </p>
            <div className="mt-5 grid w-full max-w-md gap-2 text-left sm:grid-cols-3">
              {['Create project', 'Copy snippet', 'Verify inbox'].map((step, index) => (
                <div key={step} className="rounded-lg border bg-muted/20 px-3 py-2 text-xs">
                  <span className="mr-1 font-semibold text-primary">{index + 1}.</span>
                  {step}
                </div>
              ))}
            </div>
            <Link href="/projects/new" className="mt-4">
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create your first project
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-card">
          {(projects as Project[]).map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}?tab=install`}
              className="group grid gap-3 border-b px-4 py-4 transition-colors last:border-b-0 hover:bg-accent/40 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <div className="flex min-w-0 items-center gap-2">
                  <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                  <h2 className="truncate text-base font-semibold">{project.name}</h2>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{project.domain || 'No domain set'}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                  <span>Created {formatDate(project.created_at)}</span>
                  <span className="hidden h-1 w-1 rounded-full bg-border sm:inline-block" />
                  <span className="inline-flex items-center gap-1">
                    <Key className="h-3 w-3" />
                    {project.api_key_last_four ? `••••${project.api_key_last_four}` : 'Key hidden'}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                <Badge variant="secondary">
                  <Inbox className="mr-1 h-3 w-3" />
                  {countMap.get(project.id) || 0} feedback
                </Badge>
                <Badge variant="outline">
                  <Code2 className="mr-1 h-3 w-3" />
                  Install
                </Badge>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
