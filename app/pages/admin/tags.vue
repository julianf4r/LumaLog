<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: '标签管理 · 光屿' })

const { data: tags, refresh } = await useFetch<{ name: string; count: number }[]>(
  '/api/admin/tags',
)

async function rename(name: string) {
  const to = prompt(`将标签「${name}」重命名为：`, name)?.trim()
  if (!to || to === name) return
  await $fetch('/api/admin/tags/rename', { method: 'POST', body: { from: name, to } })
  await refresh()
}

async function remove(name: string, count: number) {
  const hint = count
    ? `确认删除标签「${name}」？${count} 篇文章将失去该标签（文章本身不受影响）。`
    : `确认删除标签「${name}」？`
  if (!confirm(hint)) return
  await $fetch('/api/admin/tags/delete', { method: 'POST', body: { name } })
  await refresh()
}
</script>

<template>
  <div>
    <h1 class="page-title">标签管理</h1>
    <p class="page-hint">标签在文章编辑页填写时会自动创建；这里可以重命名或删除。</p>

    <div class="tag-list">
      <div v-for="tag in tags" :key="tag.name" class="tag-row">
        <span class="tag-name"># {{ tag.name }}</span>
        <span class="tag-count">{{ tag.count }} 篇</span>
        <div class="tag-actions">
          <button class="btn btn-sm" type="button" @click="rename(tag.name)">重命名</button>
          <button class="btn btn-sm btn-danger" type="button" @click="remove(tag.name, tag.count)">删除</button>
        </div>
      </div>
      <p v-if="!tags?.length" class="empty">还没有标签。</p>
    </div>
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 0.4rem;
  font-size: 1.4rem;
  font-weight: 700;
}

.page-hint {
  margin: 0 0 1.4rem;
  font-size: 0.88rem;
  color: var(--text-3);
}

.tag-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  max-width: 560px;
}

.tag-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1.1rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
}

.tag-name {
  font-weight: 600;
  color: var(--accent);
}

.tag-count {
  font-size: 0.84rem;
  color: var(--text-3);
}

.tag-actions {
  margin-left: auto;
  display: flex;
  gap: 0.45rem;
}

.empty {
  color: var(--text-3);
  padding: 2rem 0;
}
</style>
