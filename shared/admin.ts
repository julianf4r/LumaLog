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
