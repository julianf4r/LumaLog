<script setup lang="ts">
import type { PostMeta } from '~~/shared/types'

const { data: posts } = await useFetch<PostMeta[]>('/api/posts')
</script>

<template>
  <div class="container">
    <section class="hero">
      <p class="hero-kicker">LUMALOG</p>
      <h1 class="hero-title">光屿</h1>
      <p class="hero-tagline">把每一点微光，都留在这座小岛上。</p>
      <div class="hero-horizon" aria-hidden="true">
        <span class="hero-beacon" />
      </div>
    </section>

    <section class="feed">
      <PostCard v-for="post in posts" :key="post.slug" :post="post" />
    </section>
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

.feed {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding-bottom: 1rem;
}
</style>
