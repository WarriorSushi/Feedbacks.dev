export type GuidedTutorialId =
  | 'navigation'
  | 'create-project'
  | 'customize-form'
  | 'install-widget'
  | 'triage-inbox'
  | 'publish-board'
  | 'connect-routing'

export interface GuidedTutorialStep {
  title: string
  body: string
  href: string
  target: string
}

export interface GuidedTutorialDefinition {
  id: GuidedTutorialId
  title: string
  description: string
  steps: GuidedTutorialStep[]
}

export interface GuidedTutorialProgress {
  stepIndex: number
  completedAt?: string
  dismissedAt?: string
}

export const GUIDED_TUTORIAL_PROGRESS_KEY = 'feedbacks-guided-tutorial-progress'

export const GUIDED_TUTORIALS: GuidedTutorialDefinition[] = [
  {
    id: 'navigation',
    title: 'Dashboard map',
    description: 'Learn where each main product area lives.',
    steps: [
      { title: 'Dashboard', body: 'This is home. Use it for unread feedback, recent activity, and the next useful action.', href: '/dashboard', target: '[data-tour="nav-dashboard"]' },
      { title: 'Feedback', body: 'New messages land here. Search, filter, tag, and decide what needs action.', href: '/feedback', target: '[data-tour="nav-feedback"]' },
      { title: 'Projects', body: 'Each app or website gets one project. This is where setup and customization begin.', href: '/projects', target: '[data-tour="nav-projects"]' },
      { title: 'Integrations', body: 'This opens routing for the project selected at the top of the sidebar.', href: '/projects/{projectId}?tab=integrations', target: '[data-tour="nav-integrations"]' },
      { title: 'Public Boards', body: 'Manage the board for the project selected at the top of the sidebar.', href: '/dashboard/boards?project={projectId}', target: '[data-tour="nav-boards"]' },
      { title: 'API', body: 'This opens REST and MCP tools for the project selected at the top of the sidebar.', href: '/projects/{projectId}?tab=api', target: '[data-tour="nav-api"]' },
      { title: 'Billing', body: 'Check usage, plan access, and billing management.', href: '/billing', target: '[data-tour="nav-billing"]' },
      { title: 'Tutorials', body: 'Return here for a guided lesson about one specific job.', href: '/tutorials', target: '[data-tour="nav-tutorials"]' },
      { title: 'Settings', body: 'Manage your profile, notifications, theme, account, and tutorial progress.', href: '/settings', target: '[data-tour="nav-settings"]' },
    ],
  },
  {
    id: 'create-project',
    title: 'Create a project',
    description: 'Learn what a project is and where to create one.',
    steps: [
      { title: 'Your projects', body: 'A project is one app or website. Feedback, install settings, integrations, and a public board stay grouped here.', href: '/projects', target: '[data-tour="project-surface"]' },
      { title: 'Start a project', body: 'Use New Project when you are ready. The only required field is a name your team recognizes.', href: '/projects', target: '[data-tour="new-project"]' },
      { title: 'Name it clearly', body: 'Enter the product or site name. A domain is optional and can be added later.', href: '/projects/new', target: '[data-tour="project-create-form"]' },
      { title: 'Continue to customization', body: 'Creating the project takes you directly to form customization. This lesson will not create anything for you.', href: '/projects/new', target: '[data-tour="project-create-submit"]' },
    ],
  },
  {
    id: 'customize-form',
    title: 'Customize the feedback form',
    description: 'Choose placement, fields, labels, and preview the result.',
    steps: [
      { title: 'Project workspace', body: 'This menu keeps setup, integrations, public board, API, and project settings together.', href: '/projects/{projectId}?tab=customize', target: '[data-tour="project-menu"]' },
      { title: 'Setup progress', body: 'Follow Customize, Install, Verify, then Inbox. The highlighted step shows where you are.', href: '/projects/{projectId}?tab=customize', target: '[data-tour="setup-progress"]' },
      { title: 'Widget settings', body: 'Choose placement first, then change only the labels, color, and optional fields you need.', href: '/projects/{projectId}?tab=customize', target: '[data-tour="widget-settings"]' },
      { title: 'Live preview', body: 'Check the saved form here before copying installation code.', href: '/projects/{projectId}?tab=customize', target: '[data-tour="widget-preview"]' },
    ],
  },
  {
    id: 'install-widget',
    title: 'Install and verify',
    description: 'Find the right snippet and confirm one real submission.',
    steps: [
      { title: 'Open Install', body: 'Install follows customization so the copied code always matches the saved form.', href: '/projects/{projectId}?tab=install', target: '[data-tour="setup-progress"]' },
      { title: 'Choose your platform', body: 'Website is the default. Choose WordPress, React, Next.js, or Vue only when that matches your app shell.', href: '/projects/{projectId}?tab=install', target: '[data-tour="install-platforms"]' },
      { title: 'Copy the generated code', body: 'This section shows the exact snippet or explains when a fresh project key is needed. Paste generated code once in the shared page or app shell.', href: '/projects/{projectId}?tab=install', target: '[data-tour="install-snippet-header"]' },
      { title: 'Send one known-good test', body: 'Use hosted verification after installing, then confirm the item appears in the project inbox.', href: '/projects/{projectId}/verify', target: '[data-tour="verify-guide"]' },
    ],
  },
  {
    id: 'triage-inbox',
    title: 'Triage the inbox',
    description: 'Understand search, filters, read state, and workflow status.',
    steps: [
      { title: 'Find the right signal', body: 'Search message text or narrow the inbox by tag before changing workflow state.', href: '/feedback', target: '[data-tour="inbox-search"]' },
      { title: 'Use filters', body: 'Unread is a reading state. New, Reviewed, Planned, In Progress, and Closed are workflow decisions.', href: '/feedback', target: '[data-tour="inbox-filters"]' },
      { title: 'Open an item', body: 'Each row shows source, project, status, tags, rating, and time. Opening it marks it read but does not change its status.', href: '/feedback', target: '[data-tour="inbox-first-item"]' },
    ],
  },
  {
    id: 'publish-board',
    title: 'Publish a public board',
    description: 'Configure, publish, preview, and manage a project board.',
    steps: [
      { title: 'Selected project board', body: 'This page follows the project selected in the sidebar. Draft boards stay private until you publish them.', href: '/dashboard/boards?project={projectId}', target: '[data-tour="owner-boards-summary"]' },
      { title: 'Board settings', body: 'Open a project board to set its name, visibility, categories, submissions, and directory listing.', href: '/projects/{projectId}?tab=board', target: '[data-tour="project-menu"]' },
      { title: 'Preview before sharing', body: 'After publishing, use Preview to inspect the selected project’s public experience.', href: '/dashboard/boards?project={projectId}', target: '[data-tour="owner-board-list"]' },
    ],
  },
  {
    id: 'connect-routing',
    title: 'Connect routing',
    description: 'Send selected project feedback into an existing team workflow.',
    steps: [
      { title: 'Check the current project', body: 'Integrations use the project selected at the top of the sidebar. Switch it here before opening routing.', href: '/dashboard', target: '[data-tour="project-switcher"]' },
      { title: 'Open Integrations', body: 'The project menu keeps endpoint configuration beside the form and board it belongs to.', href: '/projects/{projectId}?tab=integrations', target: '[data-tour="project-menu"]' },
      { title: 'Add and test an endpoint', body: 'Choose Slack, Discord, GitHub, or a generic webhook. Save it, send a test, then check delivery history.', href: '/projects/{projectId}?tab=integrations', target: '[data-tour="integration-endpoint"]' },
    ],
  },
]

export function getGuidedTutorial(id: string | null | undefined) {
  return GUIDED_TUTORIALS.find((tutorial) => tutorial.id === id) || null
}

export function resolveTutorialHref(href: string, projectId?: string) {
  return href.replace('{projectId}', projectId || '')
}
