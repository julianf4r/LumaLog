<script setup lang="ts">
import type { AdminPost, AdminPostList, AdminStatusFilter } from '~~/shared/admin'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: '文章管理 · 光屿' })

const route = useRoute()

// 筛选与分页都走 URL：刷新、前进后退、收藏某一页都能正常工作
const filter = computed<AdminStatusFilter>(() =>
  route.query.status === 'published' || route.query.status === 'draft'
    ? route.query.status
    : 'all',
)
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

// URL 写成函数，query 一变 useFetch 自己重新请求
const { data, refresh } = await useFetch<AdminPostList>(
  () => `/api/admin/posts?page=${page.value}&status=${filter.value}`,
)

const toast = useToast()
const dialog = useDialog()

const counts = computed(
  () => data.value?.counts ?? { all: 0, published: 0, draft: 0 },
)

/** 翻页时要带上的筛选参数（全部则不写，保持地址干净） */
const baseQuery = computed(() =>
  filter.value === 'all' ? {} : { status: filter.value },
)

function queryForFilter(f: AdminStatusFilter) {
  // 切筛选一律回到第一页，否则可能落在超出范围的页码上
  return f === 'all' ? {} : { status: f }
}

async function togglePin(post: AdminPost) {
  await $fetch(`/api/admin/posts/${post.id}`, {
    method: 'PUT',
    body: { ...post, pinned: !post.pinned },
  })
  await refresh()
  toast.push(post.pinned ? '已取消置顶' : '已置顶')
}

async function remove(post: AdminPost) {
  const ok = await dialog.confirm({
    title: '删除文章',
    message: `确认删除「${post.title}」？此操作不可恢复。`,
    confirmText: '删除',
    danger: true,
  })
  if (!ok) return

  await $fetch(`/api/admin/posts/${post.id}`, { method: 'DELETE' })
  await refresh()
  toast.push('文章已删除')

  // 删掉的是本页最后一篇时，别把人留在一个空页上
  if (!data.value?.items.length && page.value > 1) {
    await navigateTo({ query: { ...baseQuery.value, page: String(page.value - 1) } })
  }
}
</script>

<template>
  <div>
    <div class="toolbar">
      <div class="filters">
        <NuxtLink
          v-for="f in (['all', 'published', 'draft'] as const)"
          :key="f"
          class="filter-chip"
          :class="{ active: filter === f }"
          :to="{ query: queryForFilter(f) }"
        >
          {{ f === 'all' ? '全部' : f === 'published' ? '已发布' : '草稿' }}
          <span class="filter-count">{{ counts[f] }}</span>
        </NuxtLink>
      </div>
      <NuxtLink to="/admin/posts/new" class="btn btn-primary">写新文章</NuxtLink>
    </div>

    <div class="post-list">
      <div v-for="post in data?.items ?? []" :key="post.id" class="post-row">
        <div class="post-row-main">
          <div class="post-row-title-line">
            <span :class="['badge', post.status === 'published' ? 'badge-published' : 'badge-draft']">
              {{ post.status === 'published' ? '已发布' : '草稿' }}
            </span>
            <span v-if="post.pinned" class="badge badge-pinned">置顶</span>
            <NuxtLink :to="`/admin/posts/${post.id}`" class="post-row-title">
              {{ post.title }}
            </NuxtLink>
          </div>
          <div class="post-row-meta">
            <span>{{ formatDateShort(post.date) }}</span>
            <span v-if="post.tags.length" class="post-row-tags">
              {{ post.tags.map(t => `#${t}`).join(' ') }}
            </span>
          </div>
        </div>
        <div class="post-row-actions">
          <button class="btn btn-sm" type="button" @click="togglePin(post)">
            {{ post.pinned ? '取消置顶' : '置顶' }}
          </button>
          <NuxtLink :to="`/admin/posts/${post.id}`" class="btn btn-sm">编辑</NuxtLink>
          <button class="btn btn-sm btn-danger" type="button" @click="remove(post)">删除</button>
        </div>
      </div>

      <p v-if="!data?.items.length" class="empty">
        {{ filter === 'draft' ? '还没有草稿。' : filter === 'published' ? '还没有发布过文章。' : '这里还没有文章。' }}
      </p>
    </div>

    <ThePager
      v-if="data"
      :page="data.page"
      :page-count="data.pageCount"
      :base-query="baseQuery"
    />
  </div>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
  flex-wrap: wrap;
}

.filters {
  display: flex;
  gap: 0.5rem;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.9rem;
  font-size: 0.9rem;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: all 0.2s;
}

.filter-chip:hover {
  color: var(--accent);
  border-color: var(--border-strong);
}

.filter-chip.active {
  color: var(--on-accent);
  background: var(--accent);
  border-color: transparent;
}

.filter-count {
  font-size: 0.75rem;
  opacity: 0.75;
  font-variant-numeric: tabular-nums;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.post-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  transition: border-color 0.2s, box-shadow 0.2s;
  flex-wrap: wrap;
}

.post-row:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card);
}

.post-row-main {
  min-width: 0;
  flex: 1;
}

.post-row-title-line {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.post-row-title {
  font-weight: 650;
  font-size: 1.02rem;
  transition: color 0.2s;
}

.post-row-title:hover {
  color: var(--accent);
}

.badge-pinned {
  color: var(--on-warm);
  background: var(--accent-warm);
}

.post-row-meta {
  display: flex;
  gap: 0.9rem;
  margin-top: 0.3rem;
  font-size: 0.82rem;
  color: var(--text-3);
}

.post-row-tags {
  color: var(--accent);
  opacity: 0.8;
}

.post-row-actions {
  display: flex;
  gap: 0.45rem;
  flex: none;
}

.empty {
  text-align: center;
  color: var(--text-3);
  padding: 3rem 0;
}
</style>
