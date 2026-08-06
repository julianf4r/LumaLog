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

export type AdminStatusFilter = 'all' | 'published' | 'draft'

export interface AdminPostList {
  items: AdminPost[]
  total: number
  page: number
  pageCount: number
  /** 三种筛选各自的总数，用于筛选条上的角标——分页后不能再在前端数了 */
  counts: Record<AdminStatusFilter, number>
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
