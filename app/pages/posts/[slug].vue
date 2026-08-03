<script setup lang="ts">
import type { PostDetail } from '~~/shared/types'

const route = useRoute()
const { data: post, error } = await useFetch<PostDetail>(
  `/api/posts/${route.params.slug}`,
)

if (error.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在', fatal: true })
}

useHead(() => ({
  title: post.value ? `${post.value.title} · 光屿` : '光屿',
}))

// 代码块一键复制（事件委托，作用于整篇文章）
function onArticleClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('.code-copy')
  if (!btn) return
  const code = btn.closest('.code-block')?.querySelector('pre code')
  if (!code) return
  navigator.clipboard.writeText(code.textContent ?? '').then(() => {
    btn.classList.add('copied')
    setTimeout(() => btn.classList.remove('copied'), 1600)
  })
}

// —— 大纲滚动高亮 ——
const activeId = ref('')

function onScroll() {
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>('.prose h2[id], .prose h3[id]'),
  )
  let current = ''
  for (const h of headings) {
    if (h.getBoundingClientRect().top <= 110) current = h.id
    else break
  }
  activeId.value = current || headings[0]?.id || ''
}

onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <article v-if="post" class="container post">
    <div class="post-grid">
      <div class="post-main">
        <header class="post-head">
          <div class="post-meta">
            <time :datetime="post.date">{{ formatDate(post.date) }}</time>
            <span class="post-meta-dot" aria-hidden="true" />
            <span>约 {{ post.readingMinutes }} 分钟</span>
          </div>
          <h1 class="post-title">{{ post.title }}</h1>
          <div class="post-tags">
            <NuxtLink
              v-for="tag in post.tags"
              :key="tag"
              :to="{ path: '/tags', query: { t: tag } }"
              class="post-tag"
            >
              # {{ tag }}
            </NuxtLink>
          </div>
        </header>

        <div class="prose" @click="onArticleClick" v-html="post.html" />

        <footer class="post-foot">
          <NuxtLink to="/" class="post-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
            返回小岛
          </NuxtLink>
        </footer>
      </div>

      <aside v-if="post.toc.length" class="post-toc" aria-label="文章大纲">
        <nav class="toc">
          <p class="toc-title">
            <span class="toc-title-mark" aria-hidden="true" />
            大纲
          </p>
          <a
            v-for="item in post.toc"
            :key="item.id"
            :href="`#${item.id}`"
            class="toc-link"
            :class="[`toc-lv${item.level}`, { active: item.id === activeId }]"
          >
            {{ item.text }}
          </a>
        </nav>
      </aside>
    </div>
  </article>
</template>

<style scoped>
/* 文章页用更宽的容器：正文列 + 大纲列作为整体居中 */
.post {
  max-width: var(--w-post);
  padding-top: 1rem;
}

/* 大纲列需要撑满整行高度，其内部的 .toc 才有 sticky 的移动空间 */
.post-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  gap: 3rem;
}

.post-main {
  min-width: 0;
}

/* 窄屏收起大纲，正文单栏居中并限制行长 */
@media (max-width: 1023px) {
  .post-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .post-main {
    max-width: 52rem;
    margin: 0 auto;
  }

  .post-toc {
    display: none;
  }
}

.post-head {
  text-align: center;
  padding: 1.5rem 0 2.2rem;
  margin-bottom: 2.2rem;
  border-bottom: 1px solid var(--border);
}

.post-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  font-size: 0.85rem;
  color: var(--text-3);
  letter-spacing: 0.05em;
}

.post-meta-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent);
  opacity: 0.6;
}

.post-title {
  margin: 0.9rem 0 1.1rem;
  font-size: clamp(1.6rem, 5vw, 2.2rem);
  font-weight: 700;
  line-height: 1.45;
  letter-spacing: 0.02em;
}

.post-tags {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.post-tag {
  font-size: 0.82rem;
  color: var(--accent);
  padding: 0.15rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--surface);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.post-tag:hover {
  border-color: var(--border-strong);
  box-shadow: 0 0 12px var(--glow-violet);
}

.toc {
  position: sticky;
  top: 92px;
  max-height: calc(100vh - 130px);
  overflow-y: auto;
  padding: 0.25rem 0;
  scrollbar-width: thin;
}

.toc-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.7rem;
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.25em;
  color: var(--text-3);
}

.toc-title-mark {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--grad-accent);
  box-shadow: 0 0 8px var(--glow-violet);
}

.toc-link {
  display: block;
  padding: 0.32rem 0.8rem;
  font-size: 0.85rem;
  line-height: 1.5;
  color: var(--text-3);
  border-left: 2px solid var(--border);
  transition: color 0.2s, border-color 0.2s;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-lv3 {
  padding-left: 1.7rem;
  font-size: 0.8rem;
}

.toc-link:hover {
  color: var(--text);
}

.toc-link.active {
  color: var(--accent);
  border-left-color: var(--accent);
}

.post-foot {
  margin-top: 3.5rem;
  padding-top: 1.8rem;
  border-top: 1px solid var(--border);
  text-align: center;
}

.post-back {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.92rem;
  color: var(--text-2);
  transition: color 0.2s;
}

.post-back svg {
  width: 16px;
  height: 16px;
}

.post-back:hover {
  color: var(--accent);
}
</style>
