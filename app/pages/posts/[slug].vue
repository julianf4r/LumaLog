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
</script>

<template>
  <article v-if="post" class="container post">
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
  </article>
</template>

<style scoped>
.post {
  padding-top: 1rem;
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
