import type { PostList } from '~~/shared/types'

const PAGE_SIZE = 6

export default defineEventHandler((event): PostList => {
  const query = getQuery(event)
  // all=1 时返回全量（归档页 / 标签页使用）
  if (query.all === '1') return listAllPublished()
  return listPublished(Number(query.page) || 1, PAGE_SIZE)
})
