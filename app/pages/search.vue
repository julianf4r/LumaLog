<script setup lang="ts">
import type { PostList } from '~~/shared/types'

useHead({ title: '搜索 · 光屿' })

const route = useRoute()
const router = useRouter()

// 关键词以 URL 为准，这样直接访问 /search?q=xxx 也能服务端渲染出结果
const q = computed(() => String(route.query.q ?? '').trim())
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const keyword = ref(q.value)

const { data, status } = await useFetch<PostList>('/api/search', {
  query: { q, page },
  watch: [q, page],
})

const loading = computed(() => status.value === 'pending')

// 输入防抖后写回 URL；换关键词时重置页码
let timer: ReturnType<typeof setTimeout> | null = null
watch(keyword, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    const v = keyword.value.trim()
    if (v === q.value) return
    router.replace({ query: v ? { q: v } : {} })
  }, 350)
})

// 浏览器前进/后退时把输入框同步回来
watch(q, (v) => {
  if (v !== keyword.value.trim()) keyword.value = v
})

watch(page, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})

function submit() {
  if (timer) clearTimeout(timer)
  const v = keyword.value.trim()
  if (v !== q.value) router.replace({ query: v ? { q: v } : {} })
}
</script>

<template>
  <div class="container">
    <header class="page-head">
      <h1 class="page-title">搜索</h1>
      <p class="page-desc">在小岛上寻找一束光</p>
    </header>

    <div class="search-box">
      <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
      <input
        v-model="keyword"
        class="search-input"
        placeholder="输入关键词，搜索标题与正文…"
        autofocus
        @keydown.enter="submit"
      >
    </div>

    <p v-if="q && !loading" class="result-count">
      找到 {{ data?.total ?? 0 }} 篇相关文章
    </p>

    <section class="feed">
      <PostCard v-for="post in data?.items" :key="post.slug" :post="post" />
      <p v-if="q && !loading && !data?.items.length" class="empty">
        没有找到与「{{ q }}」相关的文章。
      </p>
    </section>

    <ThePager
      :page="page"
      :page-count="data?.pageCount ?? 1"
      :base-query="q ? { q } : {}"
    />
  </div>
</template>

<style scoped>
.page-head {
  text-align: center;
  padding: 1.5rem 0 2rem;
}

.page-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  text-indent: 0.15em;
}

.page-desc {
  margin: 0.6rem 0 0;
  font-size: 0.92rem;
  color: var(--text-3);
}

.search-box {
  position: relative;
  margin: 0 auto 1.5rem;
  max-width: 560px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: var(--text-3);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1.2rem 0.8rem 2.9rem;
  font-family: inherit;
  font-size: 1rem;
  color: var(--text);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--inline-code-bg), 0 4px 20px var(--glow-cool);
}

.result-count {
  margin: 0 0 1.2rem;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-3);
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.empty {
  text-align: center;
  color: var(--text-3);
  padding: 2.5rem 0;
}
</style>
