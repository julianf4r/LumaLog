import type { AdminPostInput } from '~~/shared/admin'

export function parsePostInput(body: unknown): AdminPostInput {
  const b = (body ?? {}) as Record<string, unknown>
  const title = String(b.title ?? '').trim()
  const slug = String(b.slug ?? '').trim()
  const date = String(b.date ?? '').trim()
  const status = b.status === 'published' ? 'published' : 'draft'

  if (!title) throw createError({ statusCode: 400, statusMessage: '标题不能为空' })
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Slug 不能为空' })
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw createError({ statusCode: 400, statusMessage: '日期格式应为 YYYY-MM-DD' })
  }

  return {
    title,
    slug,
    date,
    status,
    excerpt: String(b.excerpt ?? '').trim(),
    content: String(b.content ?? ''),
    pinned: !!b.pinned,
    tags: Array.isArray(b.tags) ? b.tags.map((t) => String(t).trim()).filter(Boolean) : [],
  }
}

export function isSlugConflict(err: unknown): boolean {
  return err instanceof Error && err.message.includes('UNIQUE constraint failed: posts.slug')
}
