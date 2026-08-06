import type { AdminStatusFilter } from '~~/shared/admin'

export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const status: AdminStatusFilter =
    query.status === 'published' || query.status === 'draft' ? query.status : 'all'
  return adminListPosts(page, status)
})
