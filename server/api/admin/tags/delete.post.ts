export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { name } = await readBody<{ name?: string }>(event)
  if (!name) throw createError({ statusCode: 400, statusMessage: '参数不完整' })
  if (!adminDeleteTag(name)) {
    throw createError({ statusCode: 404, statusMessage: '标签不存在' })
  }
  return { ok: true }
})
