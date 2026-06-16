import { BoardDirectorySurface } from '@/app/boards/board-directory-surface'

export const metadata = {
  title: 'Public Boards',
}

export default async function DashboardBoardsPage({
  searchParams,
}: {
  searchParams?: Promise<{ sort?: string; category?: string }>
}) {
  const params = await searchParams
  return (
    <BoardDirectorySurface
      sort={params?.sort}
      category={params?.category}
      variant="dashboard"
    />
  )
}
