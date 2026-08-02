<script setup lang="ts">
// 在首帧渲染前恢复主题，避免闪烁
useHead({
  script: [
    {
      innerHTML:
        `(function(){try{var s=localStorage.getItem('luma-theme');` +
        `var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;` +
        `if(d)document.documentElement.classList.add('dark')}catch(e){}})()`,
      tagPriority: 'critical',
    },
  ],
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
