<script setup lang="ts">
import type { AdminPost } from '~~/shared/admin'

definePageMeta({ layout: 'admin', middleware: 'admin-auth' })
useHead({ title: '编辑文章 · 光屿' })

const route = useRoute()
const { data: post, error } = await useFetch<AdminPost>(
  `/api/admin/posts/${route.params.id}`,
)

if (error.value || !post.value) {
  throw createError({ statusCode: 404, statusMessage: '文章不存在', fatal: true })
}
</script>

<template>
  <div>
    <h1 class="page-title">编辑文章</h1>
    <AdminPostEditor :post="post" />
  </div>
</template>

<style scoped>
.page-title {
  margin: 0 0 1.2rem;
  font-size: 1.4rem;
  font-weight: 700;
}
</style>
