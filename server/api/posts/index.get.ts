import type { PostList } from '~~/shared/types'

const PAGE_SIZE = 6

export default defineEventHandler((event): PostList => {
  const query = getQuery(event)
  const all = listPosts()

  // all=1 时返回全量（归档页 / 标签页使用）
  if (query.all === '1') {
    return { items: all, total: all.length, page: 1, pageCount: 1 }
  }

  const pageCount = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const page = Math.min(pageCount, Math.max(1, Number(query.page) || 1))
  return {
    items: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    total: all.length,
    page,
    pageCount,
  }
})
