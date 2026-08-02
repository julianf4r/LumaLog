export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const post = adminGetPost(Number(getRouterParam(event, 'id')))
  if (!post) throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  return post
})
