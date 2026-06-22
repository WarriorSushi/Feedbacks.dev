'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase-browser'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/use-toast'

interface ProductTourStep {
  title: string
  body: string
  href: string
  cta: string
}

export function DashboardProductTour({ steps }: { steps: ProductTourStep[] }) {
  const router = useRouter()
  const supabase = React.useMemo(() => createClient(), [])
  const [saving, setSaving] = React.useState(false)

  const completeTour = async () => {
    setSaving(true)
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        throw new Error(userError?.message || 'Sign in again to save tour progress.')
      }

      const { data: existing, error: loadError } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', user.id)
        .maybeSingle()

      if (loadError) throw loadError

      const preferences =
        existing?.preferences && typeof existing.preferences === 'object'
          ? (existing.preferences as Record<string, unknown>)
          : {}

      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user.id,
          preferences: {
            ...preferences,
            productTourCompletedAt: new Date().toISOString(),
          },
          updated_at: new Date().toISOString(),
        })

      if (error) throw error

      toast({ title: 'Tour marked complete' })
      router.replace('/dashboard')
      router.refresh()
    } catch (error) {
      toast({
        title: 'Could not save tour progress',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="border-primary/25 bg-primary/[0.03]">
      <CardHeader className="flex flex-col gap-3 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle className="text-base">Product tour</CardTitle>
          <CardDescription>
            A quick path through the surfaces that matter after the first project exists.
          </CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="h-8 text-xs">
              Hide for now
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => void completeTour()}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
            Mark done
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-x-6 gap-y-5 pt-0 md:grid-cols-2 xl:grid-cols-3">
        {steps.map((step, index) => (
          <div key={step.title} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{step.body}</p>
              <Link href={step.href} className="mt-3 inline-flex">
                <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                  {step.cta}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

