export interface PostMeta {
  slug: string
  title: string
  excerpt: string
  date: string // ISO 格式
  tags: string[]
  pinned: boolean
  readingMinutes: number
}

export interface TocItem {
  id: string
  text: string
  level: 2 | 3
}

export interface PostDetail extends PostMeta {
  html: string
  toc: TocItem[]
}

/** 归档页只需要这几个字段，避免传输用不到的摘要 */
export interface ArchiveItem {
  slug: string
  title: string
  date: string
}

export interface SiteStats {
  total: number
  tagCount: number
  days: number
  years: { year: string; count: number }[]
  tags: { name: string; count: number }[]
}

export interface PostList {
  items: PostMeta[]
  total: number
  page: number
  pageCount: number
}
