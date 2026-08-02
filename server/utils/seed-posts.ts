// —— 首次启动时播种到 SQLite 的示例文章 ——

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
  {
    slug: 'nuxt-ssr-notes',
    title: 'Nuxt 3 服务端渲染踩坑笔记',
    excerpt: '从 useFetch 的缓存行为到 hydration mismatch，记录几个真实项目里撞上的坑，以及它们的解法。',
    date: '2026-07-15',
    tags: ['前端', 'Nuxt'],
    pinned: false,
    content: `
用 Nuxt 3 做服务端渲染整体体验相当顺滑，但有几个坑是文档里一笔带过、实际撞上却要排查半天的。记录如下。

## useFetch 不是 fetch

最容易误解的一点：\`useFetch\` 在服务端请求过的数据，会随 HTML 一起传给客户端，**客户端不会重新请求**。这是特性，不是 bug。

\`\`\`typescript
// 服务端渲染时请求一次，payload 随 HTML 下发，客户端直接复用
const { data: posts } = await useFetch('/api/posts')

// 如果你确实需要每次都刷新，显式声明
const { data: live } = await useFetch('/api/stats', {
  server: false,
  lazy: true,
})
\`\`\`

## Hydration mismatch 的高发区

服务端渲染的 HTML 和客户端首次渲染必须完全一致，否则控制台会警告，严重时 UI 错乱。三个高发场景：

| 场景 | 原因 | 解法 |
|---|---|---|
| 时间显示 | 服务器与浏览器时区不同 | 统一用 UTC 或客户端渲染 |
| 主题切换 | 服务端不知道用户偏好 | 首帧脚本 + ClientOnly |
| 随机内容 | 两端 random 结果不同 | 种子固定或仅客户端 |

核心思路只有一句话：**凡是服务端不可能知道的状态，就不要让它参与首帧渲染**。

## 内存这件小事

Node 服务默认的堆上限对 1G 小机器来说太奢侈了，启动时压一压：

\`\`\`bash
NODE_OPTIONS="--max-old-space-size=256" node .output/server/index.mjs
\`\`\`

实测一个中等规模的 Nuxt 应用压到 256M 堆完全够用，配合 swap 兜底，小机器也能跑得四平八稳。
`,
  },
  {
    slug: 'css-breathing-room',
    title: '用 CSS 做出「呼吸感」：留白、层次与光',
    excerpt: '呼吸感不是玄学。它是行高、留白、对比度和微光效果共同作用的结果，每一项都可以量化。',
    date: '2026-06-30',
    tags: ['前端', '设计'],
    pinned: false,
    content: `
「这个页面很有呼吸感」——听起来像玄学，但拆开看，它完全是可量化的工程问题。

## 行高：文字的呼吸

中文正文的行高应该比西文更大。西文 1.5 倍行高就很舒服，中文因为字形是方块、没有上下延伸的笔画节奏，**1.8 ~ 1.9 倍**才能读起来不喘：

\`\`\`css
.prose {
  font-size: 1.0625rem;
  line-height: 1.9;
  letter-spacing: 0.015em; /* 中文微微拉开一点字距 */
}
\`\`\`

## 留白：克制的艺术

> 留白不是「没有东西」，而是「故意不放东西」。它给内容让出了舞台。

几个实用的数字：

- 正文栏宽控制在 **40 ~ 46rem**，一行 35 个汉字左右最舒适
- 段落间距用行高的 60% 左右，段落内密、段落间疏
- 区块之间的间距至少是区块内间距的 2 倍，层次自然浮现

## 光：轻技术感的来源

纯平的界面显得呆板，重投影又显得廉价。折中的办法是**用极低透明度的彩色光晕代替灰色阴影**：

\`\`\`css
.card:hover {
  /* 不是变黑，而是微微发光 */
  box-shadow: 0 14px 40px rgba(122, 108, 240, 0.13);
  border-color: rgba(122, 108, 240, 0.35);
}
\`\`\`

透明度控制在 0.1 上下是关键——光应该被「感觉到」，而不是被「看到」。

---

呼吸感说到底，是对读者注意力的体贴：让眼睛知道该看哪里，也让眼睛有地方休息。
`,
  },
  {
    slug: 'sqlite-underrated',
    title: 'SQLite 在个人项目里被低估了',
    excerpt: '不需要连接池、不需要运维、备份就是复制一个文件。对绝大多数个人项目来说，SQLite 不是妥协，而是最优解。',
    date: '2026-06-12',
    tags: ['后端', '数据库'],
    pinned: false,
    content: `
每次看到个人项目的部署文档里写着「请先安装 PostgreSQL 与 Redis」，我都想问一句：真的需要吗？

## 一个文件的数据库

SQLite 的全部状态就是磁盘上的一个文件。这带来一连串朴素的好处：

- **备份**：\`cp lumalog.db backup/\`，结束
- **迁移服务器**：把文件拷过去，结束
- **本地调试**：把线上文件拉下来，直接就是全量真实数据

\`\`\`bash
# 每天凌晨备份，保留最近 30 天，一行 cron 的事
sqlite3 data/lumalog.db ".backup 'backup/lumalog-$(date +%F).db'"
find backup/ -name "*.db" -mtime +30 -delete
\`\`\`

## 性能远比想象中好

个人博客的读写模式是典型的「读多写少」，SQLite 开启 WAL 模式后轻松支撑每秒上千次读查询：

\`\`\`sql
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;

-- 站内搜索也不需要额外的搜索引擎，FTS5 内置全文索引
CREATE VIRTUAL TABLE posts_fts USING fts5(title, content);
SELECT title FROM posts_fts WHERE posts_fts MATCH '呼吸感';
\`\`\`

对比一下常见方案在小项目里的真实成本：

| 方案 | 内存占用 | 运维成本 | 备份难度 |
|---|---|---|---|
| PostgreSQL | ~200MB 起 | 升级、调优、连接池 | pg_dump + 恢复演练 |
| MySQL | ~350MB 起 | 同上 | 同上 |
| SQLite | ≈ 0 | 无 | 复制文件 |

## 什么时候不该用它

公平起见：多写入者高并发、需要跨机器访问数据库、数据量到几十 GB 以上——这些场景请老老实实上 PostgreSQL。

但如果你的项目是「我自己用的小站」，那么答案几乎总是：**SQLite 就够了，而且是最好的**。
`,
  },
  {
    slug: 'on-writing-small-things',
    title: '关于写作这件小事',
    excerpt: '写下来不是为了被看见，而是为了想清楚。一些关于为什么要持续写点什么的碎碎念。',
    date: '2026-05-20',
    tags: ['随笔'],
    pinned: false,
    content: `
![极光](/images/aurora.svg)

很多人不开始写博客，是因为觉得「我写的东西没人看」。这个担心是真的——大概率确实没什么人看。但这恰恰不是问题。

## 写作是压缩算法

脑子里的想法是高维的、混沌的、互相纠缠的。写作强迫你把它们**序列化**成一维的文字流，这个过程会无情地暴露出思考里的空洞：

> 你以为你懂了，直到你试图把它写下来。

那些写到一半卡住的地方，就是你其实没想清楚的地方。写完的那一刻，想法才真正属于你。

## 给未来的自己留信

我的另一个私心：博客是写给未来自己的信。

- 半年后忘掉的解决方案，搜一下自己的博客就找回来了
- 几年后回看当时的想法，能清楚看到自己的变化
- 有些瞬间的情绪和灵光，不写下来就永远消失了

## 小，但持续

不必等到「值得写」的大题目。修好一个 bug、想明白一个概念、读完一本书的三两句感想，都值得记录。

小的、持续的、诚实的记录，比宏大而搁浅的写作计划有价值得多。就像这座小岛——一次只需要放上一点微光。
`,
  },
  {
    slug: 'docker-single-container',
    title: '一个容器跑一切：小项目的部署哲学',
    excerpt: '当项目小到一定程度，最好的架构就是没有架构。一个容器、一个数据文件、一条启动命令。',
    date: '2026-04-18',
    tags: ['部署', 'Docker'],
    pinned: false,
    content: `
小项目部署的第一原则：**能塞进一个容器的，就不要拆成两个**。

## 一份 Dockerfile 的全部

\`\`\`dockerfile
FROM node:22-alpine
WORKDIR /app
COPY .output .output
ENV NODE_OPTIONS="--max-old-space-size=256"
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
\`\`\`

数据库是 SQLite 文件，图片在本地目录，两者用 volume 挂出来。备份、迁移、回滚，全都退化成文件操作。

## 复杂度守恒，但可以转移

微服务解决的是「人多」的问题，不是「机器多」的问题。一个人的项目，复杂度应该压到最低——省下来的心智，拿去写文章不好吗。
`,
  },
  {
    slug: 'caddy-https',
    title: 'Caddy：把 HTTPS 变成一行配置',
    excerpt: '证书申请、续期、重定向，这些 Nginx 时代的仪式感，在 Caddy 里只剩一行域名。',
    date: '2026-03-25',
    tags: ['部署'],
    pinned: false,
    content: `
第一次用 Caddy 的人都会经历一个怀疑时刻：就这？

## 完整的反向代理配置

\`\`\`nginx
blog.example.com {
    reverse_proxy localhost:3000
}
\`\`\`

是的，这就是全部。证书自动向 Let's Encrypt 申请、自动续期、HTTP 自动跳转 HTTPS、HTTP/2 默认开启。

## 它凭什么这么简单

Caddy 把「99% 的人都需要的默认值」直接做成了默认行为，而不是让每个人抄一遍同样的配置模板。工具的进步，往往就是把仪式感变成默认值。
`,
  },
  {
    slug: 'dark-mode-details',
    title: '暗色模式的十个细节',
    excerpt: '把背景改成黑色只是第一步。真正的暗色模式，藏在阴影、图片、代码高亮这些容易被忽略的角落里。',
    date: '2026-02-14',
    tags: ['前端', '设计'],
    pinned: false,
    content: `
很多网站的暗色模式是「亮色反转」，看两分钟就眼睛疼。好的暗色模式至少要处理这些细节。

## 背景不要用纯黑

\`#000\` 对比度过于剧烈，长文阅读非常疲劳。深蓝或深灰底色（比如 \`#0a0e1a\`）柔和得多，也更有夜空的氛围。

## 阴影在暗色下会失效

暗底上的黑影几乎不可见。暗色模式的「层次感」要靠**边框透明度**和**微光**来做：

\`\`\`css
.dark .card {
  border: 1px solid rgba(148, 168, 255, 0.11);
  box-shadow: 0 14px 44px rgba(120, 140, 255, 0.13);
}
\`\`\`

## 其他几个容易漏的

- 图片加一层轻微的亮度压暗，避免刺眼
- 代码高亮必须换主题，而不是沿用亮色配色
- 切换主题时给 0.3s 过渡，避免「闪白」
- 记住用户的选择，并且首帧就应用，刷新不能闪
`,
  },
  {
    slug: 'ts-narrowing',
    title: 'TypeScript 类型收窄的心智模型',
    excerpt: '与其背诵 type guard 的语法清单，不如建立一个统一的心智模型：类型是集合，收窄是求交集。',
    date: '2026-01-08',
    tags: ['前端', 'TypeScript'],
    pinned: false,
    content: `
把类型理解为**值的集合**，几乎所有收窄行为都能推导出来。

## 收窄就是求交集

\`\`\`typescript
function fmt(input: string | number) {
  if (typeof input === 'string') {
    // 此处 input 的集合 = (string | number) ∩ string = string
    return input.toUpperCase()
  }
  return input.toFixed(2) // 剩下的集合自然是 number
}
\`\`\`

## 为什么自定义函数默认不收窄

因为 TypeScript 不会分析函数体的语义，除非你用 \`is\` 显式承诺：

\`\`\`typescript
function isPost(v: unknown): v is { slug: string } {
  return typeof v === 'object' && v !== null && 'slug' in v
}
\`\`\`

\`is\` 谓词本质上是你替编译器背书。背错了书，运行时就会替你还债——所以谓词函数一定要写得保守。
`,
  },
  {
    slug: 'reading-2025',
    title: '2025 年读过的书',
    excerpt: '年底盘点。今年读得杂，技术书反而是最少的一类，收获最大的是几本讲「如何思考」的书。',
    date: '2025-12-30',
    tags: ['随笔'],
    pinned: false,
    content: `
年底照例盘点。今年一共读完 23 本，比去年少，但精读的比例高了。

## 印象最深的三本

1. **《笔记的方法》**——记笔记不是摘抄，是用自己的话重写。这个原则直接改变了我的博客写法。
2. **《软件设计的哲学》**——「复杂度是渐进累积的」，深以为然。每个「就这一次」的妥协都在给未来挖坑。
3. **《禅与摩托车维修艺术》**——重读。年轻时读到的是公路故事，现在读到的全是「良质」。

## 一点变化

今年开始强迫自己：读完一本书必须写点什么，哪怕三句话。写不出来的，说明其实没读进去。

> 阅读是输入，写作是编译。不编译的代码，永远不知道有没有 bug。

明年的愿望是把「在读列表」控制在三本以内——贪多的结果往往是全都停在 30%。
`,
  },
  {
    slug: 'vue-composables',
    title: '写好一个 Vue Composable 的三条原则',
    excerpt: '组合式函数是 Vue 3 最优雅的抽象，但写不好就会变成另一种形式的面条代码。',
    date: '2025-11-16',
    tags: ['前端', 'Vue'],
    pinned: false,
    content: `
写了两年组合式 API，沉淀下来三条原则。

## 一、返回 ref，别返回 reactive

\`\`\`typescript
export function useCounter() {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  return { count, double } // 解构后依然保持响应性
}
\`\`\`

reactive 对象一解构就断了响应性，而使用方几乎一定会解构。

## 二、副作用必须自己收尾

在 composable 内部注册的监听器、定时器，必须在内部用 \`onUnmounted\` 清理。谁创建，谁销毁——把清理责任丢给调用方，迟早漏。

## 三、输入用 MaybeRefOrGetter

\`\`\`typescript
import { toValue, type MaybeRefOrGetter } from 'vue'

export function useTitle(title: MaybeRefOrGetter<string>) {
  watchEffect(() => { document.title = toValue(title) })
}
\`\`\`

这样调用方传静态值、ref、getter 都行，composable 的兼容性一下子就上去了。
`,
  },
  {
    slug: 'terminal-setup',
    title: '我的终端环境记录',
    excerpt: '工欲善其事。记录一下当前的终端配置，也方便未来的自己在新机器上快速还原。',
    date: '2025-10-05',
    tags: ['工具'],
    pinned: false,
    content: `
换新机器最烦的就是重配环境，这篇算是给自己的备忘。

## 核心组合

- **Shell**：zsh + starship 提示符，配置一个文件搞定
- **多路复用**：tmux，SSH 断线不丢会话，1G 小服务器上的救命稻草
- **文件查找**：fzf + ripgrep，模糊搜索快到飞起

## 几条离不开的别名

\`\`\`bash
alias ll='eza -la --icons --git'
alias gs='git status -sb'
alias dcu='docker compose up -d'
alias dcl='docker compose logs -f --tail=100'
\`\`\`

## 一条心得

配置要少而精。每加一个插件都问一句：一个月后我还会用它吗？答案是否定的东西，现在就不要装。环境和代码一样，都需要抵抗熵增。
`,
  },
]

