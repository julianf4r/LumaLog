export interface ToastItem {
  id: string
  text: string
  tone: 'info' | 'error'
}

/** 右下角浮层提示，不占据文档流，因此不会挤动页面布局 */
export function useToast() {
  const items = useState<ToastItem[]>('app-toasts', () => [])

  function dismiss(id: string) {
    items.value = items.value.filter((t) => t.id !== id)
  }

  function push(text: string, tone: ToastItem['tone'] = 'info') {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    items.value = [...items.value, { id, text, tone }]
    setTimeout(() => dismiss(id), tone === 'error' ? 4000 : 2400)
  }

  return { items, push, dismiss }
}
