import type { ArchiveItem, PostDetail, PostList, PostMeta } from '~~/shared/types'
import type { AdminPost, AdminPostInput } from '~~/shared/admin'

// ---------- 通用 ----------

interface PostRow {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  pinned: number
  status: 'draft' | 'published'
  created_at: string
  updated_at: string
}

function countReadingMinutes(content: string): number {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*`\-|!\[\]()]/g, '')
  const cjk = (plain.match(/[一-鿿]/g) || []).length
  const words = (plain.match(/[a-zA-Z0-9]+/g) || []).length
  return Math.max(1, Math.round((cjk + words * 1.5) / 400))
}

function tagsOf(postId: number): string[] {
  const rows = useDb()
    .prepare(
      `SELECT t.name FROM tags t
       JOIN post_tags pt ON pt.tag_id = t.id
       WHERE pt.post_id = ? ORDER BY t.name`,
    )
    .all(postId) as { name: string }[]
  return rows.map((r) => r.name)
}

function rowToMeta(row: PostRow): PostMeta {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt || autoExcerpt(row.content),
    date: row.date,
    tags: tagsOf(row.id),
    pinned: !!row.pinned,
    readingMinutes: countReadingMinutes(row.content),
  }
}

function autoExcerpt(content: string): string {
  const plain = content
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[#>*`|\[\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 80 ? `${plain.slice(0, 80)}…` : plain
}

// ---------- 前台（仅已发布） ----------

export const PAGE_SIZE = 6

const PUBLISHED_ORDER = 'ORDER BY p.pinned DESC, p.date DESC, p.id DESC'

/** 按页取已发布文章；传 tag 则只取带该标签的文章 */
export function listPublished(page: number, pageSize: number, tag?: string): PostList {
  const db = useDb()
  const where = tag
    ? `WHERE p.status = 'published' AND EXISTS (
         SELECT 1 FROM post_tags pt JOIN tags t ON t.id = pt.tag_id
         WHERE pt.post_id = p.id AND t.name = ?
       )`
    : `WHERE p.status = 'published'`
  const params = tag ? [tag] : []

  const { n: total } = db
    .prepare(`SELECT COUNT(*) AS n FROM posts p ${where}`)
    .get(...params) as { n: number }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(pageCount, Math.max(1, page))
  const rows = db
    .prepare(`SELECT p.* FROM posts p ${where} ${PUBLISHED_ORDER} LIMIT ? OFFSET ?`)
    .all(...params, pageSize, (safePage - 1) * pageSize) as unknown as PostRow[]

  return { items: rows.map(rowToMeta), total, page: safePage, pageCount }
}

/** 归档时间线：全量但只取必要字段，且不受置顶影响 */
export function listArchive(): ArchiveItem[] {
  return useDb()
    .prepare(
      `SELECT slug, title, date FROM posts
       WHERE status = 'published' ORDER BY date DESC, id DESC`,
    )
    .all() as unknown as ArchiveItem[]
}

export async function getPublished(slug: string): Promise<PostDetail | null> {
  const row = useDb()
    .prepare(`SELECT * FROM posts WHERE slug = ? AND status = 'published'`)
    .get(slug) as PostRow | undefined
  if (!row) return null
  const { html, toc } = await renderMarkdown(row.content)
  return { ...rowToMeta(row), html, toc }
}

export function siteStats(): SiteStats {
  const db = useDb()
  const { total } = db
    .prepare(`SELECT COUNT(*) AS total FROM posts WHERE status = 'published'`)
    .get() as { total: number }
  const years = db
    .prepare(
      `SELECT substr(date, 1, 4) AS year, COUNT(*) AS count FROM posts
       WHERE status = 'published' GROUP BY year ORDER BY year DESC`,
    )
    .all() as unknown as { year: string; count: number }[]
  const tags = db
    .prepare(
      `SELECT t.name, COUNT(*) AS count FROM tags t
       JOIN post_tags pt ON pt.tag_id = t.id
       JOIN posts p ON p.id = pt.post_id
       WHERE p.status = 'published'
       GROUP BY t.id ORDER BY count DESC, t.name`,
    )
    .all() as unknown as { name: string; count: number }[]
  const { first } = db
    .prepare(`SELECT MIN(date) AS first FROM posts WHERE status = 'published'`)
    .get() as { first: string | null }

  // 天数在服务端算，避免 SSR 与客户端跨零点产生 hydration 不一致
  const days = first
    ? Math.max(1, Math.floor((Date.now() - Date.parse(`${first}T00:00:00Z`)) / 86400000))
    : 0

  return { total, tagCount: tags.length, days, years, tags }
}

export function searchPublished(q: string, page: number, pageSize: number): PostList {
  const db = useDb()
  // 转义 LIKE 的通配符，这样搜索「50%」「a_b」才能命中字面内容
  const like = `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`
  const where = `WHERE p.status = 'published'
    AND (p.title LIKE ? ESCAPE '\\' OR p.content LIKE ? ESCAPE '\\')`

  const { n: total } = db
    .prepare(`SELECT COUNT(*) AS n FROM posts p ${where}`)
    .get(like, like) as { n: number }

  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(pageCount, Math.max(1, page))
  const rows = db
    .prepare(`SELECT p.* FROM posts p ${where} ${PUBLISHED_ORDER} LIMIT ? OFFSET ?`)
    .all(like, like, pageSize, (safePage - 1) * pageSize) as unknown as PostRow[]

  return { items: rows.map(rowToMeta), total, page: safePage, pageCount }
}

// ---------- 后台 ----------

function rowToAdmin(row: PostRow): AdminPost {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: row.date,
    tags: tagsOf(row.id),
    pinned: !!row.pinned,
    status: row.status,
    updatedAt: row.updated_at,
  }
}

export function adminListPosts(): AdminPost[] {
  const rows = useDb()
    .prepare(`SELECT * FROM posts ORDER BY pinned DESC, date DESC, id DESC`)
    .all() as unknown as PostRow[]
  return rows.map(rowToAdmin)
}

export function adminGetPost(id: number): AdminPost | null {
  const row = useDb().prepare('SELECT * FROM posts WHERE id = ?').get(id) as
    | PostRow
    | undefined
  return row ? rowToAdmin(row) : null
}

function syncTags(postId: number, tags: string[]) {
  const db = useDb()
  db.prepare('DELETE FROM post_tags WHERE post_id = ?').run(postId)
  const insertTag = db.prepare('INSERT OR IGNORE INTO tags (name) VALUES (?)')
  const getTag = db.prepare('SELECT id FROM tags WHERE name = ?')
  const link = db.prepare('INSERT OR IGNORE INTO post_tags (post_id, tag_id) VALUES (?, ?)')
  for (const raw of tags) {
    const name = raw.trim()
    if (!name) continue
    insertTag.run(name)
    const tag = getTag.get(name) as { id: number }
    link.run(postId, tag.id)
  }
  // 清理不再被引用的标签
  db.exec('DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM post_tags)')
}

export function adminCreatePost(input: AdminPostInput): AdminPost {
  const db = useDb()
  const now = new Date().toISOString()
  const { lastInsertRowid } = db
    .prepare(
      `INSERT INTO posts (slug, title, excerpt, content, date, pinned, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      input.slug, input.title, input.excerpt, input.content, input.date,
      input.pinned ? 1 : 0, input.status, now, now,
    )
  syncTags(Number(lastInsertRowid), input.tags)
  return adminGetPost(Number(lastInsertRowid))!
}

export function adminUpdatePost(id: number, input: AdminPostInput): AdminPost | null {
  const db = useDb()
  const exists = db.prepare('SELECT id FROM posts WHERE id = ?').get(id)
  if (!exists) return null
  db.prepare(
    `UPDATE posts SET slug = ?, title = ?, excerpt = ?, content = ?, date = ?,
     pinned = ?, status = ?, updated_at = ? WHERE id = ?`,
  ).run(
    input.slug, input.title, input.excerpt, input.content, input.date,
    input.pinned ? 1 : 0, input.status, new Date().toISOString(), id,
  )
  syncTags(id, input.tags)
  return adminGetPost(id)
}

export function adminDeletePost(id: number): boolean {
  const res = useDb().prepare('DELETE FROM posts WHERE id = ?').run(id)
  useDb().exec('DELETE FROM tags WHERE id NOT IN (SELECT DISTINCT tag_id FROM post_tags)')
  return res.changes > 0
}

export function adminListTags(): { name: string; count: number }[] {
  return useDb()
    .prepare(
      `SELECT t.name, COUNT(pt.post_id) AS count FROM tags t
       LEFT JOIN post_tags pt ON pt.tag_id = t.id
       GROUP BY t.id ORDER BY count DESC, t.name`,
    )
    .all() as unknown as { name: string; count: number }[]
}

export function adminRenameTag(from: string, to: string): boolean {
  const db = useDb()
  const tag = db.prepare('SELECT id FROM tags WHERE name = ?').get(from) as
    | { id: number }
    | undefined
  if (!tag || !to.trim()) return false
  const existing = db.prepare('SELECT id FROM tags WHERE name = ?').get(to.trim()) as
    | { id: number }
    | undefined
  if (existing && existing.id !== tag.id) {
    // 目标标签已存在：合并引用后删除旧标签
    db.prepare('UPDATE OR IGNORE post_tags SET tag_id = ? WHERE tag_id = ?').run(existing.id, tag.id)
    db.prepare('DELETE FROM post_tags WHERE tag_id = ?').run(tag.id)
    db.prepare('DELETE FROM tags WHERE id = ?').run(tag.id)
  } else {
    db.prepare('UPDATE tags SET name = ? WHERE id = ?').run(to.trim(), tag.id)
  }
  return true
}

export function adminDeleteTag(name: string): boolean {
  const res = useDb().prepare('DELETE FROM tags WHERE name = ?').run(name)
  return res.changes > 0
}
