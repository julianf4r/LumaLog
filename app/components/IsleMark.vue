<script setup lang="ts">
/**
 * 站点标记：等深线小岛。
 * 外圈用 currentColor（由父级的 color 决定），中心的「光」固定用暖色。
 * 尺寸由父级 CSS 控制 width/height。
 */
const props = withDefaults(defineProps<{ rings?: 2 | 3 }>(), { rings: 2 })

const scales = computed(() => (props.rings === 3 ? [1.05, 0.76, 0.46] : [1.05, 0.7]))
const strokeWidth = computed(() => (props.rings === 3 ? 9 : 11))
</script>

<template>
  <svg class="isle-mark" viewBox="-115 -115 230 230" aria-hidden="true">
    <g
      fill="none"
      stroke="currentColor"
      :stroke-width="strokeWidth"
      stroke-linejoin="round"
    >
      <path v-for="s in scales" :key="s" :d="ISLE_PATH" :transform="`scale(${s})`" />
    </g>
    <circle r="20" class="isle-core" />
  </svg>
</template>

<style scoped>
.isle-mark {
  display: block;
  flex: none;
  overflow: visible;
}

.isle-core {
  fill: var(--accent-warm);
}
</style>
