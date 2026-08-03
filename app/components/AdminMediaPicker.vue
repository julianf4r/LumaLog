<script setup lang="ts">
import type { MediaList } from '~~/shared/admin'

const emit = defineEmits<{ close: []; pick: [url: string] }>()

const { data, status } = await useFetch<MediaList>('/api/admin/uploads', {
  key: 'media-picker',
})

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="mask" @click.self="emit('close')">
    <div class="panel" role="dialog" aria-label="从素材库选择图片">
      <header class="panel-head">
        <p class="panel-title">素材库</p>
        <span class="panel-count">共 {{ data?.totalCount ?? 0 }} 张</span>
        <button class="btn btn-sm" type="button" @click="emit('close')">关闭</button>
      </header>

      <div v-if="data?.items.length" class="panel-grid">
        <button
          v-for="item in data.items"
          :key="item.url"
          type="button"
          class="pick"
          :title="item.name"
          @click="emit('pick', item.url)"
        >
          <img :src="item.url" :alt="item.name" loading="lazy">
          <span class="pick-meta">{{ formatSize(item.size) }}</span>
        </button>
      </div>

      <p v-else-if="status !== 'pending'" class="panel-empty">
        素材库还是空的，先用「上传图片」传一张吧。
      </p>
    </div>
  </div>
</template>

<style scoped>
.mask {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(6, 14, 20, 0.55);
  backdrop-filter: blur(3px);
}

.panel {
  width: min(860px, 100%);
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.28);
  overflow: hidden;
}

.panel-head {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.8rem 1.1rem;
  border-bottom: 1px solid var(--border);
}

.panel-title {
  margin: 0;
  font-weight: 650;
}

.panel-count {
  font-size: 0.8rem;
  color: var(--text-3);
  margin-right: auto;
}

.panel-grid {
  padding: 1rem;
  overflow-y: auto;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 0.75rem;
}

.pick {
  position: relative;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  background: var(--code-bg);
  aspect-ratio: 4 / 3;
  transition: border-color 0.2s, transform 0.15s;
}

.pick:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}

.pick img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.pick-meta {
  position: absolute;
  right: 5px;
  bottom: 5px;
  padding: 0.05rem 0.35rem;
  font-size: 0.66rem;
  color: #fff;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 5px;
}

.panel-empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-3);
}
</style>
