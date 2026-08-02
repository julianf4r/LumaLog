export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { from, to } = await readBody<{ from?: string; to?: string }>(event)
  if (!from || !to?.trim()) {
    throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  }
  if (!adminRenameTag(from, to)) {
    throw createError({ statusCode: 404, statusMessage: '标签不存在' })
  }
  return { ok: true }
})
