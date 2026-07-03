import Link from 'next/link'
import { ArrowRight, ExternalLink, Globe, Settings2 } from 'lucide-react'
import { createServerSupabase } from '@/lib/supabase-server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getMarketingOrigin } from '@/lib/domain-routing'

export const metadata = { title: 'Your Public Boards' }

export default async function DashboardBoardsPage() {
  const publicBoardsUrl = `${getMarketingOrigin()}/boards`
  const supabase = await createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: projects } = user
    ? await supabase
        .from('projects')
        .select('id, name, domain, created_at')
        .eq('owner_user_id', user.id)
        .order('created_at', { ascending: false })
    : { data: [] }

  const projectIds = (projects || []).map((project) => project.id)
  const { data: boards } = projectIds.length
    ? await supabase
        .from('public_board_settings')
        .select('project_id, enabled, slug, visibility, directory_opt_in, updated_at')
        .in('project_id', projectIds)
    : { data: [] }
  const { data: publicFeedback } = projectIds.length
    ? await supabase
        .from('feedback')
        .select('project_id')
        .in('project_id', projectIds)
        .eq('is_public', true)
        .eq('is_archived', false)
    : { data: [] }

  const boardByProject = new Map((boards || []).map((board) => [board.project_id, board]))
  const requestCounts = new Map<string, number>()
  for (const row of publicFeedback || []) {
    requestCounts.set(row.project_id, (requestCounts.get(row.project_id) || 0) + 1)
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6" data-tour="owner-boards">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Public boards</p>
          <h1 className="mt-2 text-2xl font-bold">Your public boards</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Publish, preview, and manage the board attached to each project.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href={publicBoardsUrl}>
            <Globe className="mr-2 h-4 w-4" />
            Browse all boards
          </a>
        </Button>
      </div>

      {(projects || []).length === 0 ? (
        <div className="border-y py-12 text-center">
          <h2 className="text-lg font-semibold">Create a project first</h2>
          <p className="mt-2 text-sm text-muted-foreground">Every public board belongs to one project.</p>
          <Button className="mt-5" asChild><Link href="/projects/new">Create project</Link></Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          {(projects || []).map((project) => {
            const board = boardByProject.get(project.id)
            const published = Boolean(board?.enabled && board.slug && board.visibility !== 'private')
            const state = published ? 'Published' : board ? 'Draft' : 'Not configured'
            return (
              <div key={project.id} className="flex flex-col gap-4 border-b p-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-semibold">{project.name}</h2>
                    <Badge variant={published ? 'default' : 'secondary'}>{state}</Badge>
                    {board?.directory_opt_in && published && <Badge variant="outline">Listed</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {project.domain || 'No domain set'} · {requestCounts.get(project.id) || 0} public requests
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {published && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={`/p/${board!.slug}`} target="_blank" rel="noopener noreferrer">
                        Preview <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  <Button size="sm" asChild>
                    <Link href={`/projects/${project.id}?tab=board`}>
                      <Settings2 className="mr-1.5 h-3.5 w-3.5" />
                      {board ? 'Manage board' : 'Set up board'}
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
        Open all projects <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}
