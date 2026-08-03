// —— 首次启动时播种到 SQLite 的示例文章 ——
// 只保留一篇作为新站的开场白；标签会随文章自动创建，无需单独维护。

export interface SeedPost {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  pinned: boolean
  content: string
}

export const SEED_POSTS: SeedPost[] = [
  {
    slug: 'why-i-built-lumalog',
    title: '为什么我给自己造了一座「光屿」',
    excerpt: '市面上的博客系统要么太重、要么不好看。于是我决定亲手造一座小岛，把想法和微光都存放在这里。',
    date: '2026-07-28',
    tags: ['随笔', '建站'],
    pinned: true,
    content: `
互联网上从来不缺博客系统。WordPress 巨兽般无所不能，Hexo / Hugo 快得惊人，Notion 甚至能一键变成网站。但当我把它们挨个试过一遍之后，还是决定：自己写一个。

## 不是重复造轮子，是造一把合手的椅子

轮子是拿来跑的，椅子是拿来坐的。博客对我来说更像后者——**我每天都要面对它，所以它必须合我的心意**。

我想要的东西其实很简单：

- 打开首页，安安静静列出最近的文章，没有多余的东西
- 点进文章，排版舒服到愿意重读自己写过的字
- 写新文章时，打开浏览器就能写，**不用碰 git，不用敲命令**
- 亮色像清晨，暗色像深夜的海面

但「简单」和「简陋」是两回事。这些要求叠在一起，市面上竟然没有一个现成的东西能全部满足。

> 所有趁手的工具，最后都是自己磨出来的。

## 技术选型：轻，但不将就

最终的技术栈是 Nuxt 3 + SQLite，整个应用打包成一个 Docker 容器：

\`\`\`typescript
// 整个博客的数据层，一个 SQLite 文件就够了
import Database from 'better-sqlite3'

const db = new Database('data/lumalog.db')

const posts = db
  .prepare('SELECT * FROM posts WHERE status = ? ORDER BY pinned DESC, date DESC')
  .all('published')
\`\`\`

没有 Redis，没有消息队列，没有微服务。一台 1G 内存的免费云主机就能安稳跑起来，剩下的精力全部花在打磨体验上。

## 「光屿」这个名字

Luma 是光的单位，Log 是日志。中文名想了很久，最后定为**光屿**——光之小岛。

写博客这件事，本质上就是把脑海里一闪而过的微光捞起来，放在一个安全的地方。日子久了，微光攒成群岛，回头看时，就知道自己是怎么一路走过来的。

欢迎登岛。
`,
  },
]
