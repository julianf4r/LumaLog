export interface AdminPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  tags: string[]
  pinned: boolean
  status: 'draft' | 'published'
  updatedAt: string
}

/** 引用了某张图片的文章 */
export interface MediaRef {
  id: number
  slug: string
  title: string
}

export interface MediaItem {
  url: string
  name: string
  /** 所在月份目录，如 2026-08 */
  month: string
  size: number
  mtime: string
  refs: MediaRef[]
}

export interface MediaList {
  items: MediaItem[]
  totalCount: number
  totalSize: number
  orphanCount: number
}

export interface AdminPostInput {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  tags: string[]
  pinned: boolean
  status: 'draft' | 'published'
}
