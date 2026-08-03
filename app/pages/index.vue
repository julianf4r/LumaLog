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

        <ThePager :page="page" :page-count="data?.pageCount ?? 1" />
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
  color: var(--text);
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
  background: var(--accent-warm);
  box-shadow: 0 0 18px 4px var(--glow-warm), 0 0 6px 1px var(--glow-warm);
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
</style>
