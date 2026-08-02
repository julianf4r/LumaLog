export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const ok = adminDeletePost(Number(getRouterParam(event, 'id')))
  if (!ok) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  return { ok: true }
})
