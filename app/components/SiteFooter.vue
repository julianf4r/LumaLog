<template>
  <footer class="footer">
    <div class="container footer-inner">
      <p class="footer-line">
        <span class="footer-mark" aria-hidden="true" />
        把每一点微光，都留在这座小岛上
      </p>
      <p class="footer-copy">© {{ year }} 光屿 · LumaLog</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  border-top: 1px solid var(--border);
  padding: 2rem 0 2.5rem;
}

.footer-inner {
  text-align: center;
}

.footer-line {
  margin: 0 0 0.35rem;
  font-size: 0.9rem;
  color: var(--text-2);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.footer-mark {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--grad-accent);
  box-shadow: 0 0 8px var(--glow-violet);
}

.footer-copy {
  margin: 0;
  font-size: 0.8rem;
  color: var(--text-3);
  letter-spacing: 0.05em;
}
</style>
