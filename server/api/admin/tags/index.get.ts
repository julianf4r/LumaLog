export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  return adminListTags()
})
