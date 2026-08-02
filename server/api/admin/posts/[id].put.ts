export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const id = Number(getRouterParam(event, 'id'))
  const input = parsePostInput(await readBody(event))
  try {
    const post = adminUpdatePost(id, input)
    if (!post) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
    return post
  } catch (err) {
    if (isSlugConflict(err)) {
      throw createError({ statusCode: 409, statusMessage: 'Slug 已被其他文章使用' })
    }
    throw err
  }
})
