<script setup lang="ts">
import type { MediaItem, MediaList } from '~~/shared/admin'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: '素材 · 光屿' })

const { data, refresh } = await useFetch<MediaList>('/api/admin/uploads')

const toast = useToast()
const dialog = useDialog()

const onlyOrphan = ref(false)

const shown = computed(() => {
  const items = data.value?.items ?? []
  return onlyOrphan.value ? items.filter((i) => !i.refs.length) : items
})

/** 按月份分组展示 */
const groups = computed(() => {
  const map = new Map<string, MediaItem[]>()
  for (const item of shown.value) {
    if (!map.has(item.month)) map.set(item.month, [])
    map.get(item.month)!.push(item)
  }
  return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})

async function copy(text: string, label: string) {
  if (await copyText(text)) toast.push(`${label}已复制`)
  else toast.push('复制失败，请手动选中后复制', 'error')
}

async function remove(item: MediaItem) {
  const ok = item.refs.length
    ? await dialog.confirm({
        title: '删除被引用的图片',
        message: `这张图片正被以下 ${item.refs.length} 篇文章引用，删除后它们的图片会变成裂图。确认删除？`,
        items: item.refs.map((r) => r.title),
        confirmText: '仍然删除',
        danger: true,
      })
    : await dialog.confirm({
        title: '删除图片',
        message: `确认删除 ${item.name}？此操作不可恢复。`,
        confirmText: '删除',
        danger: true,
      })
  if (!ok) return

  await $fetch('/api/admin/uploads/delete', {
    method: 'POST',
    body: { url: item.url, force: true },
  })
  await refresh()
  toast.push('图片已删除')
}

async function cleanOrphans() {
  const orphans = (data.value?.items ?? []).filter((i) => !i.refs.length)
  if (!orphans.length) return

  const ok = await dialog.confirm({
    title: '清理孤儿图片',
    message: `以下 ${orphans.length} 张图片没有被任何文章引用，确认全部删除？此操作不可恢复。`,
    items: orphans.map((o) => o.name),
    confirmText: '全部删除',
    danger: true,
  })
  if (!ok) return

  for (const o of orphans) {
    await $fetch('/api/admin/uploads/delete', { method: 'POST', body: { url: o.url } })
  }
  await refresh()
  toast.push(`已清理 ${orphans.length} 张孤儿图片`)
}

// 直接在素材页上传
const fileRef = ref<HTMLInputElement>()
const uploading = ref(false)

async function onPick() {
  const file = fileRef.value?.files?.[0]
  if (!file) return
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    await $fetch('/api/admin/upload', { method: 'POST', body: fd })
    await refresh()
    toast.push('图片已上传')
  } catch (err: any) {
    toast.push(err?.statusMessage || err?.data?.statusMessage || '上传失败', 'error')
  } finally {
    uploading.value = false
    if (fileRef.value) fileRef.value.value = ''
  }
}
</script>

<template>
  <div>
    <div class="head">
      <div>
        <h1 class="page-title">素材</h1>
        <p class="page-hint">
          共 {{ data?.totalCount ?? 0 }} 张 · 占用 {{ formatSize(data?.totalSize ?? 0) }}
          <span v-if="data?.orphanCount" class="hint-orphan">
            · {{ data.orphanCount }} 张未被引用
          </span>
        </p>
      </div>
      <div class="head-actions">
        <button class="btn btn-sm" type="button" :disabled="uploading" @click="fileRef?.click()">
          {{ uploading ? '上传中…' : '上传图片' }}
        </button>
        <input ref="fileRef" type="file" accept="image/*" hidden @change="onPick">
        <button
          class="btn btn-sm"
          type="button"
          :class="{ 'chip-on': onlyOrphan }"
          @click="onlyOrphan = !onlyOrphan"
        >
          只看未被引用
        </button>
        <button
          v-if="data?.orphanCount"
          class="btn btn-sm btn-danger"
          type="button"
          @click="cleanOrphans"
        >
          清理孤儿图片
        </button>
      </div>
    </div>

    <section v-for="[month, items] in groups" :key="month" class="group">
      <p class="group-title">{{ month.replace('-', ' 年 ') }} 月</p>
      <div class="grid">
        <figure v-for="item in items" :key="item.url" class="cell">
          <a :href="item.url" target="_blank" rel="noopener" class="thumb">
            <img :src="item.url" :alt="item.name" loading="lazy">
          </a>
          <figcaption class="meta">
            <span class="size">{{ formatSize(item.size) }}</span>
            <span v-if="item.refs.length" class="ref ref-used" :title="item.refs.map(r => r.title).join('\n')">
              {{ item.refs.length }} 篇引用
            </span>
            <span v-else class="ref ref-orphan">未被引用</span>
          </figcaption>
          <div class="ops">
            <button class="btn btn-sm" type="button" @click="copy(`![](${item.url})`, 'Markdown')">MD</button>
            <button class="btn btn-sm" type="button" @click="copy(item.url, '链接')">链接</button>
            <button class="btn btn-sm btn-danger" type="button" @click="remove(item)">删除</button>
          </div>
        </figure>
      </div>
    </section>

    <p v-if="!groups.length" class="empty">
      {{ onlyOrphan ? '没有未被引用的图片。' : '还没有上传过图片。' }}
    </p>
  </div>
</template>

<style scoped>
.head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.4rem;
}

.page-title {
  margin: 0 0 0.3rem;
  font-size: 1.4rem;
  font-weight: 700;
}

.page-hint {
  margin: 0;
  font-size: 0.86rem;
  color: var(--text-3);
}

.hint-orphan {
  color: var(--accent-warm);
}

.head-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.chip-on {
  color: var(--on-accent);
  background: var(--accent);
  border-color: transparent;
}

.group {
  margin-bottom: 2rem;
}

.group-title {
  margin: 0 0 0.8rem;
  font-size: 0.78rem;
  font-weight: 650;
  letter-spacing: 0.2em;
  color: var(--text-3);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 1rem;
}

.cell {
  margin: 0;
  padding: 0.6rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.cell:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-card);
}

.thumb {
  display: block;
  aspect-ratio: 4 / 3;
  border-radius: 9px;
  overflow: hidden;
  background: var(--code-bg);
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0.55rem 0 0.5rem;
  font-size: 0.74rem;
  color: var(--text-3);
}

.ref {
  margin-left: auto;
  padding: 0.05rem 0.45rem;
  border-radius: 999px;
  font-weight: 600;
}

.ref-used {
  color: var(--accent);
  background: var(--inline-code-bg);
  cursor: help;
}

.ref-orphan {
  color: var(--accent-warm);
  background: color-mix(in srgb, var(--accent-warm) 14%, transparent);
}

.ops {
  display: flex;
  gap: 0.3rem;
}

.ops .btn {
  flex: 1;
  padding-left: 0.3rem;
  padding-right: 0.3rem;
  font-size: 0.78rem;
}

.empty {
  padding: 3rem 0;
  text-align: center;
  color: var(--text-3);
}
</style>
