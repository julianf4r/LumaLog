import { timingSafeEqual, createHash } from 'node:crypto'

function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest()
  const hb = createHash('sha256').update(b).digest()
  return timingSafeEqual(ha, hb)
}

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody<{ username?: string; password?: string }>(event)
  const config = useRuntimeConfig(event)

  const ok =
    typeof username === 'string' &&
    typeof password === 'string' &&
    safeEqual(username, config.adminUsername) &&
    safeEqual(password, config.adminPassword)

  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: '账号或密码错误' })
  }

  await setUserSession(event, { user: { name: username } })
  return { ok: true }
})
