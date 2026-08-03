export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { url, force } = await readBody<{ url?: string; force?: boolean }>(event)

  if (!url || !resolveUploadPath(url)) {
    throw createError({ statusCode: 400, statusMessage: '图片路径无效' })
  }

  // 仍被文章引用时先拦下来，把引用它的文章告诉前端，由用户确认后再强制删除
  const refs = findMediaRefs(url)
  if (refs.length && !force) {
    throw createError({
      statusCode: 409,
      statusMessage: `这张图片正被 ${refs.length} 篇文章引用`,
      data: { refs },
    })
  }

  if (!deleteMedia(url)) {
    throw createError({ statusCode: 404, statusMessage: '图片不存在' })
  }
  return { ok: true }
})
