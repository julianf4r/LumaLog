export interface DialogOptions {
  title: string
  message?: string
  /** 需要逐条列出的补充信息，例如引用了某张图片的文章标题 */
  items?: string[]
  confirmText?: string
  cancelText?: string
  /** 危险操作：确认按钮显示为红色 */
  danger?: boolean
  /** 提供该字段则为输入型弹窗（替代原生 prompt） */
  prompt?: { label?: string; placeholder?: string; value?: string }
}

// 结果回调只在客户端交互中产生，不参与 SSR 序列化，故放在模块作用域
let resolveFn: ((value: string | boolean | null) => void) | null = null

export function useDialog() {
  const state = useState<{ open: boolean; options: DialogOptions | null }>(
    'app-dialog',
    () => ({ open: false, options: null }),
  )

  function open(options: DialogOptions) {
    // 同一时刻只允许一个弹窗，若有未决的先按取消处理
    resolveFn?.(null)
    state.value = { open: true, options }
    return new Promise<string | boolean | null>((resolve) => {
      resolveFn = resolve
    })
  }

  function resolve(value: string | boolean | null) {
    state.value = { open: false, options: null }
    resolveFn?.(value)
    resolveFn = null
  }

  return {
    state,
    resolve,
    /** 确认弹窗，返回用户是否点了确认 */
    async confirm(options: DialogOptions): Promise<boolean> {
      return (await open(options)) === true
    },
    /** 输入弹窗，取消或留空返回 null */
    async prompt(options: DialogOptions): Promise<string | null> {
      const v = await open({ ...options, prompt: options.prompt ?? {} })
      return typeof v === 'string' && v.trim() ? v.trim() : null
    },
  }
}
