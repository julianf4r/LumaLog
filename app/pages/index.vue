<script setup lang="ts">
import type { PostList } from '~~/shared/types'

const route = useRoute()
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const { data } = await useFetch<PostList>('/api/posts', {
  query: { page },
  watch: [page],
})

// 翻页后回到顶部（仅 query 变化不会触发路由默认的滚动行为）
watch(page, () => {
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
})

const pages = computed(() =>
  Array.from({ length: data.value?.pageCount ?? 1 }, (_, i) => i + 1),
)
</script>

<template>
  <div class="container-wide">
    <section class="hero">
      <p class="hero-kicker">LUMALOG</p>
      <h1 class="hero-title">光屿</h1>
      <p class="hero-tagline">把每一点微光，都留在这座小岛上。</p>
      <div class="hero-horizon" aria-hidden="true">
        <span class="hero-beacon" />
      </div>
    </section>

    <div class="home-grid">
      <div class="home-main">
        <section class="feed">
          <PostCard v-for="post in data?.items" :key="post.slug" :post="post" />
        </section>

        <nav v-if="(data?.pageCount ?? 1) > 1" class="pager" aria-label="分页">
          <NuxtLink
            class="pager-btn"
            :class="{ disabled: page <= 1 }"
            :to="{ query: page - 1 > 1 ? { page: page - 1 } : {} }"
            aria-label="上一页"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </NuxtLink>

          <NuxtLink
            v-for="n in pages"
            :key="n"
            class="pager-num"
            :class="{ active: n === page }"
            :to="{ query: n > 1 ? { page: n } : {} }"
          >
            {{ n }}
          </NuxtLink>

          <NuxtLink
            class="pager-btn"
            :class="{ disabled: page >= (data?.pageCount ?? 1) }"
            :to="{ query: { page: Math.min(page + 1, data?.pageCount ?? 1) } }"
            aria-label="下一页"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6" /></svg>
          </NuxtLink>
        </nav>
      </div>

      <aside class="home-side">
        <HomeSidebar />
      </aside>
    </div>
  </div>
</template>

<style scoped>
.hero {
  text-align: center;
  padding: 3.5rem 0 4rem;
}

.hero-kicker {
  margin: 0 0 0.6rem;
  font-size: 0.8rem;
  letter-spacing: 0.5em;
  text-indent: 0.5em;
  color: var(--text-3);
}

.hero-title {
  margin: 0;
  font-size: clamp(3rem, 9vw, 4.5rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-indent: 0.12em;
  line-height: 1.2;
  background: var(--grad-accent);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero-tagline {
  margin: 1rem 0 0;
  font-size: 1.02rem;
  letter-spacing: 0.08em;
  color: var(--text-2);
}

.hero-horizon {
  position: relative;
  margin: 2.6rem auto 0;
  width: min(320px, 70%);
  height: 1px;
  background: linear-gradient(to right, transparent, var(--border-strong), transparent);
}

.hero-beacon {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--grad-accent);
  box-shadow: 0 0 16px 3px var(--glow-violet), 0 0 6px 1px var(--glow-cyan);
  animation: beacon 3.2s ease-in-out infinite;
}

@keyframes beacon {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

@media (prefers-reduced-motion: reduce) {
  .hero-beacon { animation: none; }
}

/* 主列 + 右侧栏，与文章页的骨架保持一致（主列 784px / 右栏 280px） */
.home-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) var(--w-rail);
  gap: var(--w-rail-gap);
}

.home-main {
  min-width: 0;
}

@media (max-width: 1023px) {
  .home-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .home-main {
    max-width: 52rem;
    margin: 0 auto;
  }

  .home-side {
    display: none;
  }
}

.feed {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-bottom: 1rem;
}

/* ---- 分页 ---- */
.pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 2rem 0 0.5rem;
}

.pager-btn,
.pager-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  padding: 0 0.5rem;
  font-size: 0.92rem;
  font-variant-numeric: tabular-nums;
  color: var(--text-2);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.pager-btn svg {
  width: 16px;
  height: 16px;
}

.pager-btn:hover,
.pager-num:hover {
  color: var(--accent);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.pager-num.active {
  color: #fff;
  background: var(--grad-accent);
  border-color: transparent;
  box-shadow: 0 4px 14px var(--glow-violet);
}

.pager-btn.disabled {
  opacity: 0.35;
  pointer-events: none;
}
</style>
