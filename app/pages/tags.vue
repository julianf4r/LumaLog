<script setup lang="ts">
import type { PostMeta } from '~~/shared/types'

useHead({ title: '标签 · 光屿' })

const route = useRoute()
const router = useRouter()

const { data: posts } = await useFetch<PostMeta[]>('/api/posts')

const tagCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const p of posts.value ?? []) {
    for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])
})

const active = computed(() => (route.query.t as string) || '')

function selectTag(tag: string) {
  router.replace({ query: tag === active.value ? {} : { t: tag } })
}

const filtered = computed(() => {
  const list = posts.value ?? []
  if (!active.value) return list
  return list.filter((p) => p.tags.includes(active.value))
})
</script>

<template>
  <div class="container">
    <header class="page-head">
      <h1 class="page-title">标签</h1>
      <p class="page-desc">
        {{ active ? `「${active}」下有 ${filtered.length} 篇文章` : `共 ${tagCounts.length} 个标签` }}
      </p>
    </header>

    <div class="tag-cloud">
      <button
        v-for="[tag, count] in tagCounts"
        :key="tag"
        type="button"
        class="tag-chip"
        :class="{ active: tag === active }"
        @click="selectTag(tag)"
      >
        # {{ tag }}
        <span class="tag-count">{{ count }}</span>
      </button>
    </div>

    <section class="feed">
      <PostCard v-for="post in filtered" :key="post.slug" :post="post" />
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

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.6rem;
  margin-bottom: 2.5rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.32rem 0.9rem;
  font-size: 0.9rem;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.tag-chip:hover {
  transform: translateY(-1px);
  border-color: var(--border-strong);
  color: var(--accent);
}

.tag-chip.active {
  color: #fff;
  background: var(--grad-accent);
  border-color: transparent;
  box-shadow: 0 4px 16px var(--glow-violet);
}

.tag-count {
  font-size: 0.75rem;
  opacity: 0.7;
  font-variant-numeric: tabular-nums;
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}
</style>
