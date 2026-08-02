<template>
  <div class="site">
    <div class="bg-decor" aria-hidden="true">
      <div class="bg-orb bg-orb--cyan" />
      <div class="bg-orb bg-orb--violet" />
      <div class="bg-orb bg-orb--pink" />
    </div>
    <SiteHeader />
    <main class="site-main">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

<style scoped>
.site {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.site-main {
  flex: 1;
  padding: 2.5rem 0 4rem;
}
</style>
