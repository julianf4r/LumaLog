<script setup lang="ts">
import type { SiteStats } from '~~/shared/types'

const { data: stats } = await useFetch<SiteStats>('/api/stats')

// 标签云只展示最常用的若干个，其余引导到标签页
const TOP_TAGS = 12
const topTags = computed(() => stats.value?.tags.slice(0, TOP_TAGS) ?? [])
const hasMoreTags = computed(() => (stats.value?.tags.length ?? 0) > TOP_TAGS)
</script>

<template>
  <div v-if="stats" class="side">
    <!-- 站点名片 -->
    <section class="card-box profile">
      <span class="profile-mark" aria-hidden="true" />
      <p class="profile-name">光屿</p>
      <p class="profile-en">LUMALOG</p>
      <p class="profile-desc">把每一点微光，都留在这座小岛上。</p>
      <dl class="profile-stats">
        <div>
          <dt>文章</dt>
          <dd>{{ stats.total }}</dd>
        </div>
        <div>
          <dt>标签</dt>
          <dd>{{ stats.tagCount }}</dd>
        </div>
        <div>
          <dt>天数</dt>
          <dd>{{ stats.days }}</dd>
        </div>
      </dl>
    </section>

    <!-- 标签云 -->
    <section v-if="topTags.length" class="card-box">
      <p class="side-title">
        <span class="side-title-mark" aria-hidden="true" />
        标签
      </p>
      <div class="tag-cloud">
        <NuxtLink
          v-for="tag in topTags"
          :key="tag.name"
          :to="{ path: '/tags', query: { t: tag.name } }"
          class="tag-chip"
        >
          {{ tag.name }}
          <span class="tag-num">{{ tag.count }}</span>
        </NuxtLink>
      </div>
      <NuxtLink v-if="hasMoreTags" to="/tags" class="side-more">查看全部标签 →</NuxtLink>
    </section>

    <!-- 归档速览 -->
    <section v-if="stats.years.length" class="card-box">
      <p class="side-title">
        <span class="side-title-mark" aria-hidden="true" />
        归档
      </p>
      <NuxtLink
        v-for="y in stats.years"
        :key="y.year"
        to="/archive"
        class="year-row"
      >
        <span class="year-label">{{ y.year }}</span>
        <span class="year-line" aria-hidden="true" />
        <span class="year-count">{{ y.count }}</span>
      </NuxtLink>
    </section>
  </div>
</template>

<style scoped>
.side {
  position: sticky;
  top: 84px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-box {
  padding: 1.1rem 1.2rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  box-shadow: var(--shadow-card);
}

/* ---- 站点名片 ---- */
.profile {
  text-align: center;
  padding-top: 1.4rem;
}

.profile-mark {
  display: block;
  width: 34px;
  height: 34px;
  margin: 0 auto 0.7rem;
  border-radius: 50%;
  background: var(--grad-accent);
  box-shadow: 0 0 20px 4px var(--glow-violet), 0 0 8px var(--glow-cyan);
}

.profile-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-indent: 0.14em;
}

.profile-en {
  margin: 0.15rem 0 0;
  font-size: 0.68rem;
  letter-spacing: 0.28em;
  text-indent: 0.28em;
  color: var(--text-3);
}

.profile-desc {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  line-height: 1.7;
  color: var(--text-2);
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.4rem;
  margin: 1.1rem 0 0;
  padding-top: 0.9rem;
  border-top: 1px solid var(--border);
}

.profile-stats div {
  display: flex;
  flex-direction: column-reverse;
  gap: 0.1rem;
}

.profile-stats dt {
  font-size: 0.7rem;
  letter-spacing: 0.1em;
  color: var(--text-3);
}

.profile-stats dd {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--accent);
}

/* ---- 区块标题 ---- */
.side-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.85rem;
  font-size: 0.76rem;
  font-weight: 650;
  letter-spacing: 0.25em;
  color: var(--text-3);
}

.side-title-mark {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--grad-accent);
  box-shadow: 0 0 8px var(--glow-violet);
}

/* ---- 标签云 ---- */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.22rem 0.6rem;
  font-size: 0.8rem;
  color: var(--text-2);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: color 0.2s, border-color 0.2s, transform 0.2s;
}

.tag-chip:hover {
  color: var(--accent);
  border-color: var(--border-strong);
  transform: translateY(-1px);
}

.tag-num {
  font-size: 0.7rem;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.side-more {
  display: inline-block;
  margin-top: 0.85rem;
  font-size: 0.78rem;
  color: var(--text-3);
  transition: color 0.2s;
}

.side-more:hover {
  color: var(--accent);
}

/* ---- 归档速览 ---- */
.year-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0;
  font-size: 0.86rem;
  color: var(--text-2);
  transition: color 0.2s;
}

.year-label {
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.year-line {
  flex: 1;
  height: 1px;
  background: var(--border);
}

.year-count {
  font-size: 0.78rem;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}

.year-row:hover {
  color: var(--accent);
}

.year-row:hover .year-line {
  background: var(--border-strong);
}
</style>
