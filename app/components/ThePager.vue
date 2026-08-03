<script setup lang="ts">
const props = defineProps<{
  page: number
  pageCount: number
  /** 翻页时需要保留的其他查询参数，如标签 t 或关键词 q */
  baseQuery?: Record<string, string>
}>()

const pages = computed(() =>
  Array.from({ length: props.pageCount }, (_, i) => i + 1),
)

// 第一页不写 page 参数，保持地址干净
function queryFor(n: number) {
  const q: Record<string, string> = { ...(props.baseQuery ?? {}) }
  if (n > 1) q.page = String(n)
  return q
}
</script>

<template>
  <nav v-if="pageCount > 1" class="pager" aria-label="分页">
    <NuxtLink
      class="pager-btn"
      :class="{ disabled: page <= 1 }"
      :to="{ query: queryFor(Math.max(1, page - 1)) }"
      aria-label="上一页"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
    </NuxtLink>

    <NuxtLink
      v-for="n in pages"
      :key="n"
      class="pager-num"
      :class="{ active: n === page }"
      :to="{ query: queryFor(n) }"
    >
      {{ n }}
    </NuxtLink>

    <NuxtLink
      class="pager-btn"
      :class="{ disabled: page >= pageCount }"
      :to="{ query: queryFor(Math.min(pageCount, page + 1)) }"
      aria-label="下一页"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
    </NuxtLink>
  </nav>
</template>

<style scoped>
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 2rem 0 0.5rem;
}

.pager-btn,
.pager-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  font-size: 0.92rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.pager-btn svg {
  width: 16px;
  height: 16px;
}

.pager-btn:hover,
.pager-num:hover {
  color: var(--accent);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.pager-num.active {
  color: #fff;
  background: var(--grad-accent);
  border-color: transparent;
  box-shadow: 0 4px 14px var(--glow-violet);
}

.pager-btn.disabled {
  opacity: 0.35;
  pointer-events: none;
}
</style>
