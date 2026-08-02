export function useTheme() {
  // 服务端不知道用户主题，isDark 仅在客户端挂载后可信；
  // 依赖它渲染的 UI（如切换按钮图标）需包在 <ClientOnly> 中
  const isDark = useState('luma-dark', () => false)

  function sync() {
    isDark.value = document.documentElement.classList.contains('dark')
  }

  function toggle() {
    isDark.value = !isDark.value
    document.documentElement.classList.toggle('dark', isDark.value)
    try {
      localStorage.setItem('luma-theme', isDark.value ? 'dark' : 'light')
    } catch {}
  }

  return { isDark, sync, toggle }
}
