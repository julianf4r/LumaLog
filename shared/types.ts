export interface PostMeta {
  slug: string
  title: string
  excerpt: string
  date: string // ISO 格式
  tags: string[]
  pinned: boolean
  readingMinutes: number
}

export interface PostDetail extends PostMeta {
  html: string
}
