<script setup lang="ts">
import type { PostList, PostMeta } from '~~/shared/types'

useHead({ title: '归档 · 光屿' })

const { data } = await useFetch<PostList>('/api/posts', { query: { all: 1 } })

const byYear = computed(() => {
  const groups = new Map<string, PostMeta[]>()
  const sorted = [...(data.value?.items ?? [])].sort((a, b) => b.date.localeCompare(a.date))
  for (const p of sorted) {
    const year = p.date.slice(0, 4)
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(p)
  }
  return [...groups.entries()]
})

const total = computed(() => data.value?.total ?? 0)
</script>

<template>
  <div class="container">
    <header class="page-head">
      <h1 class="page-title">归档</h1>
      <p class="page-desc">时间线上共有 {{ total }} 篇文章</p>
    </header>

    <section v-for="[year, list] in byYear" :key="year" class="year-block">
      <h2 class="year-label">{{ year }}</h2>
      <ul class="timeline">
        <li v-for="p in list" :key="p.slug" class="timeline-item">
          <NuxtLink :to="`/posts/${p.slug}`" class="timeline-link">
            <time class="timeline-date" :datetime="p.date">{{ p.date.slice(5) }}</time>
            <span class="timeline-title">{{ p.title }}</span>
          </NuxtLink>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.page-head {
  text-align: center;
  padding: 1.5rem 0 2.5rem;
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

.year-block {
  margin-bottom: 2.2rem;
}

.year-label {
  margin: 0 0 0.8rem;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  background: var(--grad-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  opacity: 0.85;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0.2rem 0 0.2rem 0.4rem;
  border-left: 1px solid var(--border-strong);
}

.timeline-item {
  position: relative;
  padding-left: 1.4rem;
}

.timeline-item::before {
  content: "";
  position: absolute;
  left: -4px;
  top: 50%;
  transform: translateY(-50%);
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--bg);
  border: 1.5px solid var(--accent);
  transition: background 0.2s, box-shadow 0.2s;
}

.timeline-item:hover::before {
  background: var(--accent);
  box-shadow: 0 0 10px var(--glow-violet);
}

.timeline-link {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  padding: 0.55rem 0;
}

.timeline-date {
  flex: none;
  font-size: 0.85rem;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.06em;
}

.timeline-title {
  font-size: 1rem;
  color: var(--text-2);
  transition: color 0.2s;
}

.timeline-link:hover .timeline-title {
  color: var(--accent);
}
</style>
