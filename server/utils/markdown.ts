import MarkdownIt from 'markdown-it'
import { createHighlighter, type Highlighter } from 'shiki'

const LANGS = [
  'javascript', 'typescript', 'tsx', 'vue', 'bash', 'shell', 'json',
  'css', 'html', 'python', 'yaml', 'dockerfile', 'sql', 'markdown', 'nginx',
]

const THEMES = { light: 'catppuccin-latte', dark: 'catppuccin-mocha' }

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

export async function renderMarkdown(src: string): Promise<string> {
  const md = await getMd()
  return md
    .render(src)
    .replaceAll('<table>', '<div class="table-wrap"><table>')
    .replaceAll('</table>', '</table></div>')
}
