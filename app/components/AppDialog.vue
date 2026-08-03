<script setup lang="ts">
const { state, resolve } = useDialog()

const input = ref('')
const inputRef = ref<HTMLInputElement>()

const options = computed(() => state.value.options)
const isPrompt = computed(() => !!options.value?.prompt)

watch(
  () => state.value.open,
  async (open) => {
    if (!open) return
    input.value = options.value?.prompt?.value ?? ''
    await nextTick()
    inputRef.value?.focus()
    inputRef.value?.select()
  },
)

function onConfirm() {
  resolve(isPrompt.value ? input.value : true)
}

function onCancel() {
  resolve(isPrompt.value ? null : false)
}

function onKey(e: KeyboardEvent) {
  if (!state.value.open) return
  if (e.key === 'Escape') onCancel()
  if (e.key === 'Enter' && isPrompt.value) onConfirm()
}

onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="dlg">
        <div v-if="state.open && options" class="dlg-mask" @click.self="onCancel">
          <div class="dlg" role="dialog" aria-modal="true">
            <p class="dlg-title">
              <span class="dlg-mark" :class="{ danger: options.danger }" aria-hidden="true" />
              {{ options.title }}
            </p>

            <p v-if="options.message" class="dlg-msg">{{ options.message }}</p>

            <ul v-if="options.items?.length" class="dlg-items">
              <li v-for="(it, i) in options.items" :key="i">{{ it }}</li>
            </ul>

            <div v-if="isPrompt" class="dlg-field">
              <label v-if="options.prompt?.label" class="field-label">{{ options.prompt.label }}</label>
              <input
                ref="inputRef"
                v-model="input"
                class="input"
                :placeholder="options.prompt?.placeholder"
              >
            </div>

            <div class="dlg-actions">
              <button class="btn" type="button" @click="onCancel">
                {{ options.cancelText ?? '取消' }}
              </button>
              <button
                class="btn"
                :class="options.danger ? 'btn-danger-solid' : 'btn-primary'"
                type="button"
                :disabled="isPrompt && !input.trim()"
                @click="onConfirm"
              >
                {{ options.confirmText ?? '确认' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style scoped>
.dlg-mask {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(6, 14, 20, 0.5);
  backdrop-filter: blur(3px);
}

.dlg {
  width: min(420px, 100%);
  padding: 1.5rem 1.6rem 1.3rem;
  background: var(--surface-strong);
  border: 1px solid var(--border-strong);
  border-radius: var(--r-lg);
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.3);
}

.dlg-title {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin: 0 0 0.7rem;
  font-size: 1.05rem;
  font-weight: 650;
}

.dlg-mark {
  width: 8px;
  height: 8px;
  flex: none;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--glow-cool);
}

.dlg-mark.danger {
  background: #e5484d;
  box-shadow: 0 0 8px rgba(229, 72, 77, 0.45);
}

.dlg-msg {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--text-2);
  white-space: pre-line;
}

.dlg-items {
  margin: 0.7rem 0 0;
  padding: 0.6rem 0.9rem;
  list-style: none;
  max-height: 30vh;
  overflow-y: auto;
  font-size: 0.85rem;
  color: var(--text-2);
  background: var(--code-head-bg);
  border-radius: 10px;
}

.dlg-items li {
  padding: 0.15rem 0;
}

.dlg-items li::before {
  content: "· ";
  color: var(--accent);
}

.dlg-field {
  margin-top: 1rem;
}

.dlg-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1.4rem;
}

.btn-danger-solid {
  color: #fff;
  background: #d13b40;
  border-color: transparent;
}

.btn-danger-solid:hover {
  color: #fff;
  background: #c0353a;
  box-shadow: 0 6px 18px rgba(209, 59, 64, 0.3);
}

.dlg-enter-from,
.dlg-leave-to {
  opacity: 0;
}

.dlg-enter-from .dlg,
.dlg-leave-to .dlg {
  transform: translateY(10px) scale(0.98);
}

.dlg-enter-active,
.dlg-leave-active {
  transition: opacity 0.18s ease;
}

.dlg-enter-active .dlg,
.dlg-leave-active .dlg {
  transition: transform 0.18s ease;
}

@media (prefers-reduced-motion: reduce) {
  .dlg-enter-active,
  .dlg-leave-active,
  .dlg-enter-active .dlg,
  .dlg-leave-active .dlg {
    transition: none;
  }
}
</style>
