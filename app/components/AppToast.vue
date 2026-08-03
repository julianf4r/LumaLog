<script setup lang="ts">
const { items, dismiss } = useToast()
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <TransitionGroup tag="div" name="toast" class="toast-stack">
        <div
          v-for="t in items"
          :key="t.id"
          class="toast"
          :class="`toast--${t.tone}`"
          role="status"
          @click="dismiss(t.id)"
        >
          <span class="toast-dot" aria-hidden="true" />
          {{ t.text }}
        </div>
      </TransitionGroup>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.toast-stack {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 200;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.55rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  max-width: min(360px, calc(100vw - 2.5rem));
  padding: 0.6rem 1rem;
  font-size: 0.88rem;
  color: var(--text);
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: 12px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
  pointer-events: auto;
  cursor: pointer;
}

.toast-dot {
  width: 7px;
  height: 7px;
  flex: none;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--glow-cool);
}

.toast--error .toast-dot {
  background: #e5484d;
  box-shadow: 0 0 8px rgba(229, 72, 77, 0.4);
}

.toast--error {
  color: #e5484d;
}

/* 进出场：从右侧滑入，离场时不影响其余 toast 的排布 */
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(16px);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.toast-leave-active {
  position: absolute;
  right: 0;
}

.toast-move {
  transition: transform 0.22s ease;
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active,
  .toast-move {
    transition: none;
  }
}
</style>
