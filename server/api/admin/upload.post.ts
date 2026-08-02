import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { randomBytes } from 'node:crypto'

const EXT_BY_TYPE: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/svg+xml': 'svg',
  'image/avif': 'avif',
}

const MAX_SIZE = 10 * 1024 * 1024 // 10MB

export default defineEventHandler(async (event) => {
  await requireUserSession(event)

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file' && p.data?.length)
  if (!file) throw createError({ statusCode: 400, statusMessage: '未收到文件' })
  if (file.data.length > MAX_SIZE) {
    throw createError({ statusCode: 413, statusMessage: '图片不能超过 10MB' })
  }

  const ext = EXT_BY_TYPE[file.type ?? '']
  if (!ext) throw createError({ statusCode: 415, statusMessage: '仅支持常见图片格式' })

  const month = new Date().toISOString().slice(0, 7) // YYYY-MM
  const dir = join(dataDir(), 'uploads', month)
  mkdirSync(dir, { recursive: true })

  const name = `${Date.now()}-${randomBytes(4).toString('hex')}.${ext}`
  writeFileSync(join(dir, name), file.data)

  return { url: `/uploads/${month}/${name}` }
})
