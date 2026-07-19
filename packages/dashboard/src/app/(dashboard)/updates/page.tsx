import { redirect } from 'next/navigation'

export default function UpdatesWithoutProjectPage() {
  redirect('/projects/new?goal=updates')
}
