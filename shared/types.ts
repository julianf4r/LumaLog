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

export interface PostList {
  items: PostMeta[]
  total: number
  page: number
  pageCount: number
}
