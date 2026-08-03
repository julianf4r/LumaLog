import MarkdownIt from 'markdown-it'
import { createHighlighter, type Highlighter } from 'shiki'
import type { TocItem } from '~~/shared/types'

const LANGS = [
  'javascript', 'typescript', 'tsx', 'vue', 'bash', 'shell', 'json',
  'css', 'html', 'python', 'yaml', 'dockerfile', 'sql', 'markdown', 'nginx',
]

// 与「夜航」配色呼应：亮色用中性的 github-light，暗色用北欧海冷调的 nord
const THEMES = { light: 'github-light', dark: 'nord' }

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

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

let mdPromise: Promise<MarkdownIt> | null = null

async function getMd() {
  mdPromise ??= (async () => {
    const highlighter = await getHighlighter()
    const md = new MarkdownIt({ html: false, linkify: true })

    // 为 h2/h3 生成锚点 id，并收集大纲（通过 env 携带每次渲染的状态）
    md.renderer.rules.heading_open = (tokens, idx, options, env, self) => {
      const token = tokens[idx]!
      if (token.tag === 'h2' || token.tag === 'h3') {
        const text = tokens[idx + 1]?.content ?? ''
        const id = slugifyHeading(text, env.usedIds as Map<string, number>)
        token.attrSet('id', id)
        ;(env.toc as TocItem[]).push({
          id,
          text,
          level: token.tag === 'h2' ? 2 : 3,
        })
      }
      return self.renderToken(tokens, idx, options)
    }

    md.renderer.rules.fence = (tokens, idx) => {
      const token = tokens[idx]!
      const lang = (token.info || '').trim().split(/\s+/)[0] || ''
      const known = highlighter.getLoadedLanguages().includes(lang)
      const code = highlighter.codeToHtml(token.content, {
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

function slugifyHeading(text: string, used: Map<string, number>): string {
  let slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
  if (!slug) slug = 'section'
  const n = used.get(slug) ?? 0
  used.set(slug, n + 1)
  return n ? `${slug}-${n}` : slug
}

export async function renderMarkdown(
  src: string,
): Promise<{ html: string; toc: TocItem[] }> {
  const md = await getMd()
  const env = { toc: [] as TocItem[], usedIds: new Map<string, number>() }
  const html = md
    .render(src, env)
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>')
  return { html, toc: env.toc }
}
