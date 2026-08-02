import { createReadStream, existsSync, statSync } from 'node:fs'
import { join, normalize } from 'node:path'

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  avif: 'image/avif',
}

export default defineEventHandler((event) => {
  const rel = normalize(getRouterParam(event, 'path') ?? '')
  if (!rel || rel.startsWith('..') || rel.includes('..')) {
    throw createError({ statusCode: 400 })
  }

  const filePath = join(dataDir(), 'uploads', rel)
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    throw createError({ statusCode: 404 })
  }

  const ext = filePath.split('.').pop()?.toLowerCase() ?? ''
  setHeader(event, 'Content-Type', MIME[ext] ?? 'application/octet-stream')
  setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')
  return sendStream(event, createReadStream(filePath))
})
