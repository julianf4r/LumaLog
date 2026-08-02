export default defineEventHandler(async (event) => {
  await requireUserSession(event)
  const { content } = await readBody<{ content?: string }>(event)
  return await renderMarkdown(String(content ?? ''))
})
