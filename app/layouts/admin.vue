<script setup lang="ts">
const { clear } = useUserSession()

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  await clear()
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin">
    <div class="bg-decor" aria-hidden="true" />
    <header class="admin-header">
      <div class="admin-shell admin-header-inner">
        <NuxtLink to="/admin" class="admin-brand">
          <IsleMark class="admin-brand-mark" />
          光屿 · 后台
        </NuxtLink>
        <nav class="admin-nav">
          <NuxtLink to="/admin" class="admin-nav-link">文章</NuxtLink>
          <NuxtLink to="/admin/tags" class="admin-nav-link">标签</NuxtLink>
          <NuxtLink to="/admin/media" class="admin-nav-link">素材</NuxtLink>
          <NuxtLink to="/" class="admin-nav-link">查看前台</NuxtLink>
          <ThemeToggle />
          <button class="btn btn-sm" type="button" @click="logout">退出</button>
        </nav>
      </div>
    </header>
    <main class="admin-main admin-shell">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.admin-header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--bg) 62%, transparent);
  border-bottom: 1px solid var(--border);
}

.admin-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
}

.admin-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
}

.admin-brand-mark {
  width: 18px;
  height: 18px;
  color: var(--accent);
}

.admin-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-nav-link {
  padding: 0.3rem 0.6rem;
  font-size: 0.92rem;
  color: var(--text-2);
  border-radius: var(--r-sm);
  transition: color 0.2s, background 0.2s;
}

.admin-nav-link:hover,
.admin-nav-link.router-link-exact-active {
  color: var(--accent);
  background: var(--inline-code-bg);
}

/* 后台是工具而非阅读界面，不受博客阅读宽度约束：
   尽量吃满屏幕，header 与内容同宽，页面之间也不会跳动 */
.admin-shell {
  width: 100%;
  max-width: min(94vw, 1600px);
  margin: 0 auto;
  padding: 0 1.25rem;
}

.admin-main {
  flex: 1;
  padding-top: 2rem;
  padding-bottom: 3rem;
}
</style>
