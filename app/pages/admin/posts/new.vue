<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: '写新文章 · 光屿' })
</script>

<template>
  <div>
    <h1 class="page-title">写新文章</h1>
    <AdminPostEditor />
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 1.2rem;
  font-size: 1.4rem;
  font-weight: 700;
}
</style>
