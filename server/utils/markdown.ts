import MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'
import katexModule from '@vscode/markdown-it-katex'
import { createHighlighter, type Highlighter } from 'shiki'
import type { TocItem } from '~~/shared/types'

// 只加真的会写到的语言：每种语法都会常驻在 highlighter 单例里占一份内存。
// 不在表里的语言不会报错，但会静默降级成无高亮的纯文本。
// 别名由 shiki 自动带上（js / ts / py / sh / yml / md 等都能直接写）。
const LANGS = [
  'javascript', 'typescript', 'tsx', 'vue', 'bash', 'shell', 'json',
  'css', 'html', 'python', 'yaml', 'dockerfile', 'sql', 'markdown', 'nginx',
  'diff', 'toml', 'ini', 'xml', 'powershell', 'go', 'rust', 'bat',
]

// 暗色用 ayu-dark：本身就是蓝 + 橙配色，与「夜航」同源且饱和度高、不发灰。
// 亮色不跟着用 ayu-light —— 它的注释色 #ADAEB1 在浅底上对比度仅 2.0，几乎看不清；
// github-light 的注释 #6A737D 能到 4.3，可读性优先。
const THEMES = { light: 'github-light', dark: 'ayu-dark' }

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    themes: Object.values(THEMES),
    langs: LANGS,
  })
  return highlighterPromise
}

const COPY_BUTTON =
  '<button class="code-copy" type="button" aria-label="复制代码">' +
  '<svg class="i-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>' +
  '<svg class="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
  '</button>'

// 这个包是 CJS，module.exports = { default: fn }：ESM 下 import 到的是那层壳，
// 真正的插件在 .default 上。写成兼容两种形态，免得升级后突然拿到函数本身。
const katexPlugin = ((katexModule as any).default ??
  katexModule) as MarkdownIt.PluginWithOptions<{ throwOnError: boolean; errorColor: string }>

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// —— 提示块（GitHub 警告块语法：`> [!TIP]` 开头的引用） ——
// 用 GitHub 的写法而不是 :::tip，是因为它在别处（GitHub、Obsidian）也认；
// 就算搬到不支持的渲染器上，也只会退化成一条普通引用，不会露出语法噪音。
const ICON = (paths: string) =>
  `<svg class="callout-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`

const ALERTS = {
  note: {
    label: '信息',
    icon: ICON('<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>'),
  },
  tip: {
    label: '提示',
    icon: ICON('<path d="M12 2a7 7 0 0 0-4 12.75V17h8v-2.25A7 7 0 0 0 12 2z"/><path d="M9.5 20.5h5"/>'),
  },
  important: {
    label: '重要',
    icon: ICON('<path d="M21 14a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M12 7v4M12 13.5h.01"/>'),
  },
  warning: {
    label: '警告',
    icon: ICON('<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>'),
  },
  caution: {
    label: '错误',
    icon: ICON('<path d="M7.9 2h8.2L22 7.9v8.2L16.1 22H7.9L2 16.1V7.9z"/><path d="m15 9-6 6M9 9l6 6"/>'),
  },
}

type AlertKind = keyof typeof ALERTS

const ALERT_RE = new RegExp(`^\\[!(${Object.keys(ALERTS).join('|')})\\]\\s*(?:\\n|$)`, 'i')

/**
 * 在 block 解析之后、inline 解析之前跑：此时段落内容还是纯文本，
 * 直接把 `[!TIP]` 标记从 content 里摘掉即可，不必去改已经拆好的 inline 子 token。
 */
function alertsRule(state: { tokens: Token[] }) {
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const open = tokens[i]!
    if (open.type !== 'blockquote_open') continue
    if (tokens[i + 1]?.type !== 'paragraph_open') continue

    const inline = tokens[i + 2]
    if (inline?.type !== 'inline') continue
    const match = ALERT_RE.exec(inline.content)
    if (!match) continue

    const kind = match[1]!.toLowerCase() as AlertKind
    inline.content = inline.content.slice(match[0].length)

    const close = tokens.findIndex(
      (t, j) => j > i && t.type === 'blockquote_close' && t.level === open.level,
    )
    if (close < 0) continue

    open.meta = { ...open.meta, alert: kind }
    tokens[close]!.meta = { ...tokens[close]!.meta, alert: kind }

    // 标记独占一行时首段会空掉，连同段落标签一起删除
    if (!inline.content.trim()) tokens.splice(i + 1, 3)
  }
}

// —— 图片尺寸：`![图片|600](url)`、`|600x400`、`|50%` ——
const SIZE_RE = /^([\s\S]*?)\s*\|\s*(\d{1,5})(?:x(\d{1,5}))?(%?)\s*$/

function sizeStyle(w: string, h: string | undefined, percent: string): string {
  if (percent) return `width:${w}%`
  return h ? `width:${w}px;height:${h}px` : `width:${w}px`
}

let mdPromise: Promise<MarkdownIt> | null = null

async function getMd() {
  mdPromise ??= (async () => {
    const highlighter = await getHighlighter()
    const md = new MarkdownIt({ html: false, linkify: true })

    md.core.ruler.after('block', 'lumalog_alerts', alertsRule)

    // 数学公式：$...$ 行内、$$...$$ 块级，服务端直接渲染成 HTML，
    // 前台只需要一份 KaTeX 的 CSS + 字体，没有任何客户端 JS。
    // 用插件而不是自己写分隔符规则：$ 的转义、"$5 和 $10" 这类货币写法、
    // 公式里的 _ 不能被当成斜体，这些边界情况插件已经处理好了。
    // katex 固定在 ^0.16：插件依赖的就是这个大版本，CSS 与渲染出的 HTML 必须同版本。
    md.use(katexPlugin, {
      // 公式写错时就地标红（样式见 .katex-error），而不是整篇渲染抛错
      throwOnError: false,
      errorColor: '#e5484d',
    })

    // 命中提示块的引用整体换成 <div class="callout">，并补一行标题
    md.renderer.rules.blockquote_open = (tokens, idx, options, env, self) => {
      const kind = tokens[idx]!.meta?.alert as AlertKind | undefined
      if (!kind) return self.renderToken(tokens, idx, options)
      const { label, icon } = ALERTS[kind]
      return (
        `<div class="callout callout-${kind}">` +
        `<p class="callout-title">${icon}${label}</p>`
      )
    }

    md.renderer.rules.blockquote_close = (tokens, idx, options, env, self) =>
      tokens[idx]!.meta?.alert ? '</div>\n' : self.renderToken(tokens, idx, options)

    // 图片：alt 尾部的 |宽度 只是排版指令，不该留在 alt 文本里
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      const token = tokens[idx]!
      let alt = self.renderInlineAsText(token.children ?? [], options, env)
      const match = SIZE_RE.exec(alt)
      if (match) {
        alt = match[1]!.trim()
        token.attrSet('style', sizeStyle(match[2]!, match[3], match[4]!))
      }
      token.attrSet('alt', alt)
      return self.renderToken(tokens, idx, options)
    }

    // 标题末尾追加一枚 # 锚点，方便复制/分享段落链接（id 在渲染前已经挂好）
    md.renderer.rules.heading_close = (tokens, idx, options, env, self) => {
      const open = tokens[idx - 2]
      const id = open?.type === 'heading_open' ? open.attrGet('id') : null
      const anchor = id
        ? `<a class="heading-anchor" href="#${encodeURIComponent(id)}" aria-label="本节链接">#</a>`
        : ''
      return anchor + self.renderToken(tokens, idx, options)
    }

    md.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx]!
      const lang = (token.info || '').trim().split(/\s+/)[0] || ''
      const known = highlighter.getLoadedLanguages().includes(lang)
      // 围栏内容总是以换行结尾，直接交给 shiki 会多渲染一行空行（还带行号）
      const code = highlighter.codeToHtml(token.content.replace(/\n+$/, ''), {
        lang: known ? lang : 'text',
        themes: THEMES,
        defaultColor: false,
      })
      return (
        `<div class="code-block"><div class="code-block-head">` +
        `<span class="code-lang">${escapeHtml(lang || 'text')}</span>${COPY_BUTTON}` +
        `</div>${code}</div>`
      )
    }

    return md
  })()
  return mdPromise
}

function slugify(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, '')
      .replace(/\s+/g, '-') || 'section'
  )
}

function slugifyHeading(text: string, used: Map<string, number>): string {
  const slug = slugify(text)
  const n = used.get(slug) ?? 0
  used.set(slug, n + 1)
  return n ? `${slug}-${n}` : slug
}

/**
 * 给所有层级的标题挂上 id（大纲仍只收 h2/h3），并返回一张「写法 → id」的对照表：
 * 除了 id 本身，还登记标题原文，这样正文里写 `[跳转](#安装 Node.js)`
 * 也能落到 slug 化之后的 `#安装-nodejs` 上。
 */
function collectHeadings(tokens: Token[], toc: TocItem[]): Map<string, string> {
  const used = new Map<string, number>()
  const anchors = new Map<string, string>()

  tokens.forEach((token, i) => {
    if (token.type !== 'heading_open') return
    const text = tokens[i + 1]?.content ?? ''
    const id = slugifyHeading(text, used)
    token.attrSet('id', id)
    anchors.set(id, id)
    // 原文写法只在没被占用时登记，重名标题以第一个为准
    const raw = text.trim().toLowerCase()
    if (raw && !anchors.has(raw)) anchors.set(raw, id)
    if (token.tag === 'h2' || token.tag === 'h3') {
      toc.push({ id, text, level: token.tag === 'h2' ? 2 : 3 })
    }
  })

  return anchors
}

/** 把正文里指向本页标题的链接（#xxx）改写成真实的锚点 id */
function resolveHeadingLinks(tokens: Token[], anchors: Map<string, string>) {
  for (const token of tokens) {
    if (token.type !== 'inline' || !token.children) continue
    for (const child of token.children) {
      if (child.type !== 'link_open') continue
      const href = child.attrGet('href')
      if (!href || href.length < 2 || !href.startsWith('#')) continue

      let target = href.slice(1)
      try {
        target = decodeURIComponent(target)
      } catch {
        /* 不是合法的百分号编码就按原样匹配 */
      }
      const id =
        anchors.get(target) ??
        anchors.get(target.trim().toLowerCase()) ??
        anchors.get(slugify(target))
      if (id) child.attrSet('href', `#${encodeURIComponent(id)}`)
    }
  }
}

export async function renderMarkdown(
  src: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const md = await getMd()
  const env = {}
  const toc: TocItem[] = []
  // 先解析成 token，把标题 id 与站内锚点链接对齐后再渲染
  const tokens = md.parse(src, env)
  resolveHeadingLinks(tokens, collectHeadings(tokens, toc))
  const html = md.renderer
    .render(tokens, md.options, env)
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>')
  return { html, toc }
}
