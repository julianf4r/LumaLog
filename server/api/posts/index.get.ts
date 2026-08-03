import type { PostList } from '~~/shared/types'

export default defineEventHandler((event): PostList => {
  const query = getQuery(event)
  const tag = String(query.t ?? '').trim()
  return listPublished(Number(query.page) || 1, PAGE_SIZE, tag || undefined)
})
