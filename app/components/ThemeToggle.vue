<script setup lang="ts">
const { isDark, sync, toggle } = useTheme()
onMounted(sync)
</script>

<template>
  <ClientOnly>
    <button
      class="theme-toggle"
      type="button"
      :aria-label="isDark ? '切换到亮色模式' : '切换到暗色模式'"
      @click="toggle"
    >
      <svg v-if="isDark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
        <circle cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.4 14.2A8.5 8.5 0 0 1 9.8 3.6a8.5 8.5 0 1 0 10.6 10.6Z" />
      </svg>
    </button>
    <template #fallback>
      <span class="theme-toggle" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>

<style scoped>
.theme-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  margin-left: 0.35rem;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--text-2);
  transition: background 0.2s, color 0.2s;
}

.theme-toggle:hover {
  background: var(--inline-code-bg);
  color: var(--accent);
}

.theme-toggle svg {
  width: 18px;
  height: 18px;
}
</style>
