export default defineEventHandler((event) => {
  const q = String(getQuery(event).q ?? '').trim()
  if (!q) return []
  return searchPublished(q)
})
