import { Suspense } from 'react'
import { PracticeModeClient } from './practice-mode-client'

export default function PracticeModePage() {
  return (
    <Suspense>
      <PracticeModeClient />
    </Suspense>
  )
}
