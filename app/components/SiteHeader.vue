<template>
  <header class="header">
    <div class="container-wide header-inner">
      <NuxtLink to="/" class="brand">
        <span class="brand-mark" aria-hidden="true" />
        <span class="brand-name">光屿</span>
        <span class="brand-sub">LumaLog</span>
      </NuxtLink>

      <nav class="nav">
        <NuxtLink to="/" class="nav-link">首页</NuxtLink>
        <NuxtLink to="/archive" class="nav-link">归档</NuxtLink>
        <NuxtLink to="/tags" class="nav-link">标签</NuxtLink>
        <ThemeToggle />
      </nav>
    </div>
  </header>
</template>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  background: color-mix(in srgb, var(--bg) 62%, transparent);
  border-bottom: 1px solid var(--border);
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.brand {
  display: flex;
  align-items: baseline;
  gap: 0.55rem;
}

.brand-mark {
  align-self: center;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--grad-accent);
  box-shadow: 0 0 12px 2px var(--glow-violet), 0 0 4px var(--glow-cyan);
}

.brand-name {
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.brand-sub {
  font-size: 0.78rem;
  letter-spacing: 0.14em;
  color: var(--text-3);
  text-transform: uppercase;
}

.nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.nav-link {
  position: relative;
  padding: 0.35rem 0.7rem;
  font-size: 0.95rem;
  color: var(--text-2);
  border-radius: var(--r-sm);
  transition: color 0.2s;
}

.nav-link::after {
  content: "";
  position: absolute;
  left: 0.7rem;
  right: 0.7rem;
  bottom: 0.1rem;
  height: 2px;
  border-radius: 2px;
  background: var(--grad-accent);
  opacity: 0;
  transform: scaleX(0.4);
  transition: opacity 0.22s, transform 0.22s;
}

.nav-link:hover {
  color: var(--text);
}

.nav-link.router-link-active {
  color: var(--text);
}

.nav-link.router-link-active::after,
.nav-link:hover::after {
  opacity: 1;
  transform: scaleX(1);
}
</style>
