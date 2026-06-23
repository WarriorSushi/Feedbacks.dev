'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight,
  Bell,
  Check,
  Code2,
  FolderOpen,
  Globe,
  Inbox,
  MessageSquare,
  RotateCcw,
  Send,
  Webhook,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

type LessonId = 'project' | 'form' | 'install' | 'inbox' | 'board' | 'integrations'
type DemoStatus = 'new' | 'reviewed' | 'planned'

interface DemoFeedback {
  id: string
  title: string
  status: DemoStatus
  read: boolean
  public: boolean
  votes: number
  tag?: string
}

const lessons: Array<{
  id: LessonId
  title: string
  body: string
  Icon: React.ComponentType<{ className?: string }>
}> = [
  { id: 'project', title: 'Project', body: 'One project is one product or website.', Icon: FolderOpen },
  { id: 'form', title: 'Form', body: 'Choose how users open the feedback form.', Icon: MessageSquare },
  { id: 'install', title: 'Install', body: 'Copy a snippet and send one test.', Icon: Code2 },
  { id: 'inbox', title: 'Inbox', body: 'Read, tag, prioritize, and plan feedback.', Icon: Inbox },
  { id: 'board', title: 'Public board', body: 'Publish selected requests for votes.', Icon: Globe },
  { id: 'integrations', title: 'Routing', body: 'Send important updates elsewhere.', Icon: Webhook },
]

const initialFeedback: DemoFeedback[] = [
  {
    id: 'demo-1',
    title: 'Users want a smaller feedback button on mobile',
    status: 'new',
    read: false,
    public: false,
    votes: 0,
    tag: 'mobile',
  },
  {
    id: 'demo-2',
    title: 'Add a public way to vote on roadmap ideas',
    status: 'reviewed',
    read: true,
    public: true,
    votes: 7,
    tag: 'board',
  },
]

function getLesson(value: string | null): LessonId {
  return lessons.some((lesson) => lesson.id === value) ? (value as LessonId) : 'project'
}

export function PracticeModeClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeLesson = getLesson(searchParams.get('lesson'))
  const [projectName, setProjectName] = React.useState('Demo Web App')
  const [projectCreated, setProjectCreated] = React.useState(true)
  const [formLabel, setFormLabel] = React.useState('Send feedback')
  const [placement, setPlacement] = React.useState<'bottom-right' | 'bottom-left' | 'inline'>('bottom-right')
  const [accent, setAccent] = React.useState('#5da800')
  const [emailField, setEmailField] = React.useState(false)
  const [feedback, setFeedback] = React.useState<DemoFeedback[]>(initialFeedback)
  const [routingTested, setRoutingTested] = React.useState<string[]>([])

  const activeIndex = lessons.findIndex((lesson) => lesson.id === activeLesson)
  const publicItems = feedback.filter((item) => item.public)

  const setLesson = (lesson: LessonId) => {
    router.push(`/tutorials/practice?lesson=${lesson}`)
  }

  const resetPractice = () => {
    setProjectName('Demo Web App')
    setProjectCreated(true)
    setFormLabel('Send feedback')
    setPlacement('bottom-right')
    setAccent('#5da800')
    setEmailField(false)
    setFeedback(initialFeedback)
    setRoutingTested([])
    setLesson('project')
  }

  const updateFeedback = (id: string, patch: Partial<DemoFeedback>) => {
    setFeedback((items) => items.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  const sendDemoFeedback = () => {
    const next: DemoFeedback = {
      id: `demo-${Date.now()}`,
      title: 'The practice widget sent this fake feedback item',
      status: 'new',
      read: false,
      public: false,
      votes: 0,
      tag: 'test',
    }
    setFeedback((items) => [next, ...items])
    setLesson('inbox')
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-xl border border-primary/25 bg-primary/[0.035] px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
              Practice mode
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight">Safe demo workspace</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything here is fake. Click freely; your real projects, boards, and integrations will not change.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={resetPractice}>
              <RotateCcw className="h-4 w-4" />
              Reset demo
            </Button>
            <Link href="/tutorials">
              <Button variant="ghost" size="sm">All tutorials</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-2">
          {lessons.map((lesson, index) => {
            const active = lesson.id === activeLesson
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => setLesson(lesson.id)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors',
                  active
                    ? 'border-primary/35 bg-primary/[0.06] text-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border bg-background text-xs font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2 text-sm font-semibold">
                    <lesson.Icon className="h-4 w-4" />
                    {lesson.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5">{lesson.body}</span>
                </span>
              </button>
            )
          })}
        </aside>

        <section className="min-w-0">
          {activeLesson === 'project' && (
            <Card>
              <CardHeader>
                <CardTitle>Project: one app, one install key</CardTitle>
                <CardDescription>
                  Make a project for each product where you want to collect feedback.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="practice-project-name">Practice project name</Label>
                    <Input
                      id="practice-project-name"
                      value={projectName}
                      onChange={(event) => {
                        setProjectName(event.target.value)
                        setProjectCreated(false)
                      }}
                    />
                  </div>
                  <Button onClick={() => setProjectCreated(true)} className="gap-2">
                    <Check className="h-4 w-4" />
                    Create demo project
                  </Button>
                  <p className="text-sm leading-6 text-muted-foreground">
                    In the real app, the project page is where you customize the form, copy install code,
                    connect routing, and manage the public board for this one product.
                  </p>
                </div>
                <div className="rounded-xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Result
                  </p>
                  <h2 className="mt-3 text-lg font-semibold">{projectCreated ? projectName : 'Unsaved practice project'}</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Setup, form, install code, inbox, board, and routing all belong to this project.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeLesson === 'form' && (
            <Card>
              <CardHeader>
                <CardTitle>Form: choose what users see</CardTitle>
                <CardDescription>
                  These controls only change the fake preview.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="practice-form-label">Button label</Label>
                    <Input id="practice-form-label" value={formLabel} onChange={(event) => setFormLabel(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Placement</Label>
                    <div className="flex flex-wrap gap-2">
                      {(['bottom-right', 'bottom-left', 'inline'] as const).map((value) => (
                        <Button
                          key={value}
                          variant={placement === value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setPlacement(value)}
                        >
                          {value.replace('-', ' ')}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent color</Label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        ['#5da800', 'Green'],
                        ['#2563eb', 'Blue'],
                        ['#d97706', 'Amber'],
                      ].map(([value, label]) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setAccent(value)}
                          className={cn(
                            'flex h-9 items-center gap-2 rounded-md border px-2.5 text-sm',
                            accent === value ? 'border-primary bg-primary/[0.06]' : 'border-border bg-background',
                          )}
                        >
                          <span className="h-4 w-4 rounded-full" style={{ backgroundColor: value }} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex items-start gap-3 rounded-lg border bg-muted/20 px-3 py-3 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border accent-primary"
                      checked={emailField}
                      onChange={(event) => setEmailField(event.target.checked)}
                    />
                    <span>
                      <span className="block font-medium">Ask for email</span>
                      <span className="text-muted-foreground">Useful when you need to follow up with the user.</span>
                    </span>
                  </label>
                </div>
                <div className="relative min-h-72 overflow-hidden rounded-xl border bg-background p-4">
                  <div className="rounded-lg border bg-card p-4">
                    <p className="text-sm font-semibold">Demo product page</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      The real widget appears on your site after you paste the snippet.
                    </p>
                    {placement === 'inline' && (
                      <button className="mt-4 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground" style={{ backgroundColor: accent }}>
                        {formLabel || 'Send feedback'}
                      </button>
                    )}
                  </div>
                  {placement !== 'inline' && (
                    <button
                      className={cn(
                        'absolute bottom-4 rounded-lg px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg',
                        placement === 'bottom-right' ? 'right-4' : 'left-4',
                      )}
                      style={{ backgroundColor: accent }}
                    >
                      {formLabel || 'Send feedback'}
                    </button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeLesson === 'install' && (
            <Card>
              <CardHeader>
                <CardTitle>Install: copy, paste, test once</CardTitle>
                <CardDescription>
                  Real installs use a project key. This snippet is fake.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <pre className="overflow-x-auto rounded-xl border bg-muted/30 p-4 text-xs leading-6 text-foreground">
{`<script
  src="https://app.feedbacks.dev/widget/latest.js"
  data-project="demo-project-key"
  data-api-url="https://app.feedbacks.dev/api/feedback"
  defer
></script>`}
                </pre>
                <div className="flex flex-wrap gap-2">
                  <Button className="gap-2" onClick={sendDemoFeedback}>
                    <Send className="h-4 w-4" />
                    Send fake test feedback
                  </Button>
                  <Button variant="outline" onClick={() => setLesson('form')}>
                    Back to form
                  </Button>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">
                  In the real app, one test proves the loop: widget opens, feedback submits, inbox receives it.
                </p>
              </CardContent>
            </Card>
          )}

          {activeLesson === 'inbox' && (
            <Card>
              <CardHeader>
                <CardTitle>Inbox: decide what each item needs</CardTitle>
                <CardDescription>
                  Reading an item and changing workflow status are separate actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {feedback.map((item) => (
                  <div key={item.id} className="rounded-xl border bg-card p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {!item.read && <span className="h-2 w-2 rounded-full bg-primary" />}
                          <p className="font-medium">{item.title}</p>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary">{item.read ? 'Read' : 'Unread'}</Badge>
                          <Badge variant="outline">{item.status}</Badge>
                          {item.tag && <Badge variant="outline">{item.tag}</Badge>}
                          {item.public && <Badge>Public board</Badge>}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" onClick={() => updateFeedback(item.id, { read: true })}>
                          Mark read
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => updateFeedback(item.id, { status: 'planned' })}>
                          Plan
                        </Button>
                        <Button size="sm" onClick={() => updateFeedback(item.id, { public: true })}>
                          Publish
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {activeLesson === 'board' && (
            <Card>
              <CardHeader>
                <CardTitle>Public board: share the right requests</CardTitle>
                <CardDescription>
                  Only feedback you mark public appears here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {publicItems.length === 0 ? (
                  <div className="rounded-xl border bg-muted/20 p-6 text-center">
                    <Globe className="mx-auto h-8 w-8 text-muted-foreground/50" />
                    <p className="mt-3 text-sm font-medium">No public requests yet</p>
                    <p className="mt-1 text-sm text-muted-foreground">Go to Inbox and publish a fake item.</p>
                    <Button className="mt-4" variant="outline" onClick={() => setLesson('inbox')}>
                      Open practice inbox
                    </Button>
                  </div>
                ) : (
                  publicItems.map((item) => (
                    <div key={item.id} className="flex flex-col gap-3 rounded-xl border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">Visible on the public board.</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => updateFeedback(item.id, { votes: item.votes + 1 })}>
                        {item.votes} votes
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}

          {activeLesson === 'integrations' && (
            <Card>
              <CardHeader>
                <CardTitle>Routing: send important updates out</CardTitle>
                <CardDescription>
                  Tests here are fake. Real integrations live per project.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {['Slack', 'GitHub Issues', 'Generic webhook'].map((name) => {
                  const tested = routingTested.includes(name)
                  return (
                    <div key={name} className="rounded-xl border bg-card p-4">
                      <Bell className="h-5 w-5 text-primary" />
                      <p className="mt-3 font-semibold">{name}</p>
                      <p className="mt-1 min-h-10 text-sm leading-5 text-muted-foreground">
                        {tested ? 'Fake test delivered.' : 'Use routing after feedback reaches the inbox.'}
                      </p>
                      <Button
                        className="mt-4 w-full"
                        variant={tested ? 'outline' : 'default'}
                        onClick={() => setRoutingTested((items) => Array.from(new Set([...items, name])))}
                      >
                        {tested ? 'Tested' : 'Send fake test'}
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              disabled={activeIndex <= 0}
              onClick={() => setLesson(lessons[Math.max(0, activeIndex - 1)].id)}
            >
              Previous
            </Button>
            <Button
              className="gap-2"
              disabled={activeIndex >= lessons.length - 1}
              onClick={() => setLesson(lessons[Math.min(lessons.length - 1, activeIndex + 1)].id)}
            >
              Next lesson
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
