<script setup lang="ts">
import type { PostList, SiteStats } from '~~/shared/types'

useHead({ title: '标签 · 光屿' })

const route = useRoute()

const active = computed(() => String(route.query.t ?? '').trim())
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

// 标签云与首页侧边栏共用统计接口
const { data: stats } = await useFetch<SiteStats>('/api/stats')

// 文章筛选与分页都在服务端完成
const { data } = await useFetch<PostList>('/api/posts', {
  query: { t: active, page },
  watch: [active, page],
})

watch(page, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})

// 点击已选中的标签则取消筛选；切换标签时重置页码
function queryForTag(tag: string) {
  return tag === active.value ? {} : { t: tag }
}
</script>

<template>
  <div class="container">
    <header class="page-head">
      <h1 class="page-title">标签</h1>
      <p class="page-desc">
        {{ active
          ? `「${active}」下有 ${data?.total ?? 0} 篇文章`
          : `共 ${stats?.tagCount ?? 0} 个标签、${data?.total ?? 0} 篇文章` }}
      </p>
    </header>

    <div class="tag-cloud">
      <NuxtLink
        v-for="tag in stats?.tags"
        :key="tag.name"
        :to="{ query: queryForTag(tag.name) }"
        class="tag-chip"
        :class="{ active: tag.name === active }"
      >
        # {{ tag.name }}
        <span class="tag-count">{{ tag.count }}</span>
      </NuxtLink>
    </div>

    <section class="feed">
      <PostCard v-for="post in data?.items" :key="post.slug" :post="post" />
      <p v-if="!data?.items.length" class="empty">这个标签下还没有文章。</p>
    </section>

    <ThePager
      :page="page"
      :page-count="data?.pageCount ?? 1"
      :base-query="active ? { t: active } : {}"
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

.empty {
  text-align: center;
  color: var(--text-3);
  padding: 2.5rem 0;
}
</style>
