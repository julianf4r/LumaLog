<script setup lang="ts">
import type { AdminPost } from '~~/shared/admin'
import type { TocItem } from '~~/shared/types'

const props = defineProps<{ post?: AdminPost | null }>()

const toast = useToast()
const isEdit = computed(() => !!props.post)

const form = reactive({
  title: props.post?.title ?? '',
  slug: props.post?.slug ?? '',
  date: props.post?.date ?? new Date().toISOString().slice(0, 10),
  tagsText: props.post?.tags.join(', ') ?? '',
  excerpt: props.post?.excerpt ?? '',
  content: props.post?.content ?? '',
  pinned: props.post?.pinned ?? false,
})

// —— slug 自动生成（手动改过后不再联动） ——
const slugTouched = ref(isEdit.value)

function slugify(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .slice(0, 80)
}

watch(
  () => form.title,
  (t) => {
    if (!slugTouched.value) form.slug = slugify(t)
  },
)

// —— 实时预览（600ms 防抖走服务端渲染，与前台完全同源） ——
const showPreview = ref(true)
const previewHtml = ref('')
let previewTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => form.content,
  () => {
    if (previewTimer) clearTimeout(previewTimer)
    previewTimer = setTimeout(refreshPreview, 600)
  },
  { immediate: true },
)

async function refreshPreview() {
  try {
    const res = await $fetch<{ html: string; toc: TocItem[] }>('/api/admin/preview', {
      method: 'POST',
      body: { content: form.content },
    })
    previewHtml.value = res.html
  } catch {
    /* 预览失败不打断编辑 */
  }
}

// —— 图片：粘贴或选择文件上传，插入光标处 ——
const textareaRef = ref<HTMLTextAreaElement>()
const fileRef = ref<HTMLInputElement>()
const uploading = ref(false)

function insertAtCursor(text: string) {
  const el = textareaRef.value
  if (!el) {
    form.content += text
    return
  }
  const start = el.selectionStart
  form.content = form.content.slice(0, start) + text + form.content.slice(el.selectionEnd)
  nextTick(() => {
    el.focus()
    el.selectionStart = el.selectionEnd = start + text.length
  })
}

// 插入图片时带上的尺寸：600 / 600x400 / 50%，留空即原尺寸
const imgSize = ref('')

function imageMarkdown(url: string) {
  const size = imgSize.value.trim()
  const sized = /^\d{1,5}(x\d{1,5})?$|^\d{1,3}%$/.test(size) ? `|${size}` : ''
  return `\n![图片${sized}](${url})\n`
}

async function uploadImage(file: File) {
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('file', file)
    const { url } = await $fetch<{ url: string }>('/api/admin/upload', {
      method: 'POST',
      body: fd,
    })
    insertAtCursor(imageMarkdown(url))
    toast.push('图片已上传')
  } catch (err: any) {
    toast.push(err?.statusMessage || err?.data?.statusMessage || '图片上传失败', 'error')
  } finally {
    uploading.value = false
  }
}

function onPaste(e: ClipboardEvent) {
  const item = [...(e.clipboardData?.items ?? [])].find((i) => i.type.startsWith('image/'))
  const file = item?.getAsFile()
  if (!file) return
  e.preventDefault()
  uploadImage(file)
}

function onPickFile() {
  const file = fileRef.value?.files?.[0]
  if (file) uploadImage(file)
  if (fileRef.value) fileRef.value.value = ''
}

// 从素材库挑一张已有的图片插入，避免重复上传同一张图
const pickerOpen = ref(false)

function insertFromLibrary(url: string) {
  insertAtCursor(imageMarkdown(url))
  pickerOpen.value = false
}

// —— 提示块 ——
const CALLOUTS = [
  { kind: 'TIP', label: '提示' },
  { kind: 'NOTE', label: '信息' },
  { kind: 'IMPORTANT', label: '重要' },
  { kind: 'WARNING', label: '警告' },
  { kind: 'CAUTION', label: '错误' },
]

const calloutRef = ref<HTMLElement>()
const calloutOpen = ref(false)

function insertCallout(kind: string) {
  calloutOpen.value = false
  const el = textareaRef.value
  const selected = el
    ? form.content.slice(el.selectionStart, el.selectionEnd).trim()
    : ''
  const body = (selected || '在这里写内容')
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
  insertAtCursor(`\n> [!${kind}]\n${body}\n\n`)
}

function onDocClick(e: MouseEvent) {
  if (!calloutRef.value?.contains(e.target as Node)) calloutOpen.value = false
}

onMounted(() => document.addEventListener('click', onDocClick))
onBeforeUnmount(() => document.removeEventListener('click', onDocClick))

// —— 保存 ——
const saving = ref(false)
const errorMsg = ref('')

function payload(status: 'draft' | 'published') {
  return {
    title: form.title,
    slug: form.slug,
    date: form.date,
    excerpt: form.excerpt,
    content: form.content,
    pinned: form.pinned,
    status,
    tags: form.tagsText
      .split(/[,，、]/)
      .map((t) => t.trim())
      .filter(Boolean),
  }
}

async function save(status: 'draft' | 'published') {
  if (saving.value) return
  errorMsg.value = ''
  saving.value = true
  try {
    if (isEdit.value) {
      await $fetch(`/api/admin/posts/${props.post!.id}`, {
        method: 'PUT',
        body: payload(status),
      })
    } else {
      await $fetch('/api/admin/posts', { method: 'POST', body: payload(status) })
    }
    await navigateTo('/admin')
    toast.push(status === 'published' ? '文章已发布' : '草稿已保存')
  } catch (err: any) {
    const msg = err?.statusMessage || err?.data?.statusMessage || '保存失败'
    errorMsg.value = msg
    toast.push(msg, 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="editor">
    <div class="editor-top">
      <input
        v-model="form.title"
        class="input editor-title"
        placeholder="文章标题"
      >
      <div class="editor-fields">
        <div class="editor-field editor-field-slug">
          <label class="field-label">Slug</label>
          <input v-model="form.slug" class="input" @input="slugTouched = true">
        </div>
        <div class="editor-field">
          <label class="field-label">日期</label>
          <input v-model="form.date" type="date" class="input">
        </div>
        <div class="editor-field editor-field-tags">
          <label class="field-label">标签（逗号分隔）</label>
          <input v-model="form.tagsText" class="input" placeholder="前端, 随笔">
        </div>
        <label class="editor-pin">
          <input v-model="form.pinned" type="checkbox">
          置顶
        </label>
      </div>
      <div class="editor-field">
        <label class="field-label">摘要（留空则自动截取正文开头）</label>
        <textarea v-model="form.excerpt" class="textarea" rows="2" />
      </div>
    </div>

    <div class="editor-bar">
      <div class="editor-bar-left">
        <button class="btn btn-sm" type="button" :disabled="uploading" @click="fileRef?.click()">
          {{ uploading ? '上传中…' : '插入图片' }}
        </button>
        <button class="btn btn-sm" type="button" @click="pickerOpen = true">从素材库选择</button>
        <input
          v-model="imgSize"
          class="input editor-size"
          placeholder="尺寸 600"
          title="插入图片时的尺寸：600、600x400 或 50%，留空为原尺寸"
        >

        <div ref="calloutRef" class="editor-menu">
          <button class="btn btn-sm" type="button" @click="calloutOpen = !calloutOpen">
            提示块 ▾
          </button>
          <div v-if="calloutOpen" class="editor-menu-list">
            <button
              v-for="c in CALLOUTS"
              :key="c.kind"
              class="editor-menu-item"
              type="button"
              @click="insertCallout(c.kind)"
            >
              {{ c.label }}
              <span class="editor-menu-kind">[!{{ c.kind }}]</span>
            </button>
          </div>
        </div>

        <span class="editor-hint">支持直接粘贴图片</span>
        <input ref="fileRef" type="file" accept="image/*" hidden @change="onPickFile">
      </div>
      <button class="btn btn-sm" type="button" @click="showPreview = !showPreview">
        {{ showPreview ? '隐藏预览' : '显示预览' }}
      </button>
    </div>

    <div class="editor-split" :class="{ single: !showPreview }">
      <textarea
        ref="textareaRef"
        v-model="form.content"
        class="textarea editor-content"
        placeholder="用 Markdown 书写正文…"
        @paste="onPaste"
      />
      <div v-if="showPreview" class="editor-preview">
        <div class="prose" v-html="previewHtml" />
      </div>
    </div>

    <AdminMediaPicker
      v-if="pickerOpen"
      @close="pickerOpen = false"
      @pick="insertFromLibrary"
    />

    <p v-if="errorMsg" class="editor-error">{{ errorMsg }}</p>

    <div class="editor-actions">
      <NuxtLink to="/admin" class="btn">取消</NuxtLink>
      <div class="editor-actions-right">
        <button class="btn" type="button" :disabled="saving" @click="save('draft')">
          {{ post?.status === 'published' ? '转为草稿' : '存草稿' }}
        </button>
        <button class="btn btn-primary" type="button" :disabled="saving" @click="save('published')">
          {{ saving ? '保存中…' : post?.status === 'published' ? '保存更新' : '发布' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.editor-top {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  margin-bottom: 1rem;
}

.editor-title {
  font-size: 1.25rem;
  font-weight: 650;
  padding: 0.7rem 1rem;
}

.editor-fields {
  display: flex;
  gap: 0.9rem;
  align-items: flex-end;
  flex-wrap: wrap;
}

.editor-field {
  min-width: 0;
}

.editor-field-slug {
  flex: 1.2;
  min-width: 180px;
}

.editor-field-tags {
  flex: 1;
  min-width: 160px;
}

.editor-pin {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding-bottom: 0.55rem;
  font-size: 0.9rem;
  color: var(--text-2);
  cursor: pointer;
  user-select: none;
}

.editor-pin input {
  accent-color: var(--accent);
}

.editor-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.editor-bar-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.editor-hint {
  font-size: 0.8rem;
  color: var(--text-3);
}

.editor-size {
  width: 7.5rem;
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}

.editor-menu {
  position: relative;
}

.editor-menu-list {
  position: absolute;
  z-index: 20;
  top: calc(100% + 0.35rem);
  left: 0;
  min-width: 11rem;
  padding: 0.3rem;
  background: var(--surface-strong);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: var(--shadow-card);
}

.editor-menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  width: 100%;
  padding: 0.4rem 0.6rem;
  font-size: 0.88rem;
  color: var(--text-2);
  text-align: left;
  background: none;
  border: none;
  border-radius: 7px;
  transition: background 0.15s, color 0.15s;
}

.editor-menu-item:hover {
  background: var(--inline-code-bg);
  color: var(--accent);
}

.editor-menu-kind {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-3);
}

.editor-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: stretch;
}

.editor-split.single {
  grid-template-columns: 1fr;
}

.editor-content {
  min-height: 480px;
  font-family: var(--font-mono);
  font-size: 0.9rem;
  line-height: 1.8;
}

.editor-preview {
  min-height: 480px;
  max-height: 75vh;
  overflow-y: auto;
  padding: 1rem 1.3rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.editor-preview .prose {
  font-size: 0.98rem;
}

@media (max-width: 900px) {
  .editor-split {
    grid-template-columns: 1fr;
  }
}

.editor-error {
  margin: 0.8rem 0 0;
  font-size: 0.88rem;
  color: #e5484d;
}

.editor-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 1.2rem;
}

.editor-actions-right {
  display: flex;
  gap: 0.6rem;
}
</style>
