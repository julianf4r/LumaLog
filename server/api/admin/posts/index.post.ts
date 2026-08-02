export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const input = parsePostInput(await readBody(event))
  try {
    return adminCreatePost(input)
  } catch (err) {
    if (isSlugConflict(err)) {
      throw createError({ statusCode: 409, statusMessage: 'Slug 已被其他文章使用' })
    }
    throw err
  }
})
