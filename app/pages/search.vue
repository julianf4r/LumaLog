<script setup lang="ts">
import type { PostMeta } from '~~/shared/types'

useHead({ title: '搜索 · 光屿' })

const route = useRoute()
const router = useRouter()

const keyword = ref(String(route.query.q ?? ''))
const results = ref<PostMeta[]>([])
const searched = ref(false)
const loading = ref(false)

let timer: ReturnType<typeof setTimeout> | null = null

watch(keyword, () => {
  if (timer) clearTimeout(timer)
  timer = setTimeout(run, 350)
})

async function run() {
  const q = keyword.value.trim()
  router.replace({ query: q ? { q } : {} })
  if (!q) {
    results.value = []
    searched.value = false
    return
  }
  loading.value = true
  try {
    results.value = await $fetch<PostMeta[]>('/api/search', { query: { q } })
    searched.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (keyword.value.trim()) run()
})
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
        @keydown.enter="run"
      >
    </div>

    <section class="feed">
      <PostCard v-for="post in results" :key="post.slug" :post="post" />
      <p v-if="searched && !loading && !results.length" class="empty">
        没有找到与「{{ keyword.trim() }}」相关的文章。
      </p>
    </section>
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
  margin: 0 auto 2.2rem;
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
  box-shadow: 0 0 0 4px var(--inline-code-bg), 0 4px 20px var(--glow-violet);
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
