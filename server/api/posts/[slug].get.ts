export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')!
  const post = await getPublished(slug)
  if (!post) {
    throw createError({ statusCode: 404, statusMessage: '文章不存在' })
  }
  return post
})
