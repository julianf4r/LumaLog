import { existsSync, readdirSync, statSync, unlinkSync, rmdirSync } from 'node:fs'
import { join, normalize } from 'node:path'
import type { MediaItem, MediaList, MediaRef } from '~~/shared/admin'

function uploadsRoot(): string {
  return join(dataDir(), 'uploads')
}

/** 把 /uploads/2026-08/x.png 还原成磁盘路径，并挡住路径穿越 */
export function resolveUploadPath(url: string): string | null {
  const prefix = '/uploads/'
  if (!url.startsWith(prefix)) return null
  const rel = normalize(decodeURIComponent(url.slice(prefix.length)))
  if (!rel || rel.startsWith('..') || rel.includes('..')) return null
  const full = join(uploadsRoot(), rel)
  if (!full.startsWith(uploadsRoot())) return null
  return full
}

/** 所有文章的正文，用于反查图片被谁引用（文章量小，一次读入再在内存里匹配即可） */
function allPostBodies(): { id: number; slug: string; title: string; content: string }[] {
  return useDb()
    .prepare('SELECT id, slug, title, content FROM posts')
    .all() as unknown as { id: number; slug: string; title: string; content: string }[]
}

export function listMedia(): MediaList {
  const root = uploadsRoot()
  const items: MediaItem[] = []

  if (existsSync(root)) {
    const posts = allPostBodies()

    for (const month of readdirSync(root)) {
      const monthDir = join(root, month)
      if (!statSync(monthDir).isDirectory()) continue

      for (const name of readdirSync(monthDir)) {
        const file = join(monthDir, name)
        const st = statSync(file)
        if (!st.isFile()) continue

        const url = `/uploads/${month}/${name}`
        const refs: MediaRef[] = posts
          .filter((p) => p.content.includes(url))
          .map((p) => ({ id: p.id, slug: p.slug, title: p.title }))

        items.push({ url, name, month, size: st.size, mtime: st.mtime.toISOString(), refs })
      }
    }
  }

  // 新的排在前面
  items.sort((a, b) => b.mtime.localeCompare(a.mtime))

  return {
    items,
    totalCount: items.length,
    totalSize: items.reduce((n, i) => n + i.size, 0),
    orphanCount: items.filter((i) => !i.refs.length).length,
  }
}

export function findMediaRefs(url: string): MediaRef[] {
  return allPostBodies()
    .filter((p) => p.content.includes(url))
    .map((p) => ({ id: p.id, slug: p.slug, title: p.title }))
}

export function deleteMedia(url: string): boolean {
  const file = resolveUploadPath(url)
  if (!file || !existsSync(file)) return false
  unlinkSync(file)

  // 顺手清掉空掉的月份目录，避免素材页出现空分组
  const dir = join(file, '..')
  try {
    if (readdirSync(dir).length === 0) rmdirSync(dir)
  } catch {
    /* 目录非空或已被清理，忽略 */
  }
  return true
}
