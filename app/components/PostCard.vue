<script setup lang="ts">
import type { PostMeta } from '~~/shared/types'

defineProps<{ post: PostMeta }>()
</script>

<template>
  <NuxtLink :to="`/posts/${post.slug}`" class="card">
    <div class="card-meta">
      <span v-if="post.pinned" class="card-pin">置顶</span>
      <span v-for="tag in post.tags" :key="tag" class="card-tag"># {{ tag }}</span>
      <time class="card-date" :datetime="post.date">{{ formatDateShort(post.date) }}</time>
    </div>
    <h2 class="card-title">{{ post.title }}</h2>
    <p class="card-excerpt">{{ post.excerpt }}</p>
    <span class="card-more">
      阅读全文
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </span>
  </NuxtLink>
</template>

<style scoped>
.card {
  display: block;
  padding: 1.5rem 1.75rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
  border-color: var(--border-strong);
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.8rem;
  color: var(--text-3);
}

.card-pin {
  padding: 0.1rem 0.5rem;
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--on-warm);
  background: var(--accent-warm);
  border-radius: 999px;
}

.card-tag {
  color: var(--accent);
  opacity: 0.85;
}

.card-date {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.card-title {
  margin: 0.7rem 0 0.45rem;
  font-size: 1.28rem;
  font-weight: 650;
  line-height: 1.45;
  letter-spacing: 0.01em;
  transition: color 0.2s;
}

.card:hover .card-title {
  color: var(--accent);
}

.card-excerpt {
  margin: 0;
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-more {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.85rem;
  font-size: 0.85rem;
  color: var(--text-3);
  transition: color 0.2s, gap 0.2s;
}

.card-more svg {
  width: 14px;
  height: 14px;
}

.card:hover .card-more {
  color: var(--accent);
  gap: 0.5rem;
}
</style>
