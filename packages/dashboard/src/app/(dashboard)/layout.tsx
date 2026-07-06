import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { cookies } from 'next/headers'
import { createServerSupabase } from '@/lib/supabase-server'
import { Sidebar } from '@/components/sidebar'
import { ProductTour } from '@/components/product-tour'
import { CURRENT_PROJECT_COOKIE } from '@/lib/project-selection'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, settings')
    .eq('owner_user_id', user.id)
    .order('created_at', { ascending: false })

  const { data: billingAccount } = await supabase
    .from('billing_accounts')
    .select('plan_tier, billing_status')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: userSettings } = await supabase
    .from('user_settings')
    .select('preferences')
    .eq('user_id', user.id)
    .maybeSingle()

  const projectIds = (projects || []).map((project: { id: string }) => project.id)
  const { data: boardSettings } = projectIds.length > 0
    ? await supabase
        .from('public_board_settings')
        .select('project_id, slug, enabled')
        .eq('enabled', true)
        .in('project_id', projectIds)
    : { data: [] }

  // Extract current project ID from URL path
  const headersList = await headers()
  const cookieStore = await cookies()
  const pathname = headersList.get('x-pathname') || headersList.get('x-invoke-path') || ''
  const projectMatch = pathname.match(/\/projects\/([^/]+)/)
  const storedProjectId = cookieStore.get(CURRENT_PROJECT_COOKIE)?.value
  const currentProjectId = projectMatch?.[1] || projects?.find((project) => project.id === storedProjectId)?.id

  // Build project → board slug map
  const boardSlugs: Record<string, string> = {}
  boardSettings?.forEach((b: { project_id: string; slug: string }) => {
    boardSlugs[b.project_id] = b.slug
  })

  const preferences =
    userSettings?.preferences && typeof userSettings.preferences === 'object'
      ? (userSettings.preferences as {
        productTourCompletedAt?: string
        productTourDismissedAt?: string
        guidedTutorialProgress?: Record<string, { stepIndex: number; completedAt?: string; dismissedAt?: string }>
        })
      : {}
  const showProductTour =
    Boolean(projects?.length) &&
    !preferences.productTourCompletedAt &&
    !preferences.productTourDismissedAt

  return (
    <div className="flex h-dvh flex-col bg-background md:flex-row">
      <Sidebar
        user={{
          email: user.email,
          user_metadata: user.user_metadata as { avatar_url?: string; full_name?: string },
        }}
        projects={(projects as Array<{ id: string; name: string; settings: { icon?: string } }>) || []}
        currentProjectId={currentProjectId}
        boardSlugs={boardSlugs}
        billingAccount={billingAccount}
      />
      <main className="min-h-0 flex-1 overflow-y-auto bg-muted/35 pb-[env(safe-area-inset-bottom,0px)] dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4 md:px-6 md:py-6">{children}</div>
      </main>
      <ProductTour
        initialOpen={showProductTour}
        defaultProjectId={currentProjectId || projects?.[0]?.id}
        initialTutorialProgress={preferences.guidedTutorialProgress}
      />
    </div>
  )
}
