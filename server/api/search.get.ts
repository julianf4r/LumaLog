import type { PostList } from '~~/shared/types'

export default defineEventHandler((event): PostList => {
  const query = getQuery(event)
  const q = String(query.q ?? '').trim()
  if (!q) return { items: [], total: 0, page: 1, pageCount: 1 }
  return searchPublished(q, Number(query.page) || 1, PAGE_SIZE)
})
