export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${y} 年 ${Number(m)} 月 ${Number(d)} 日`
}

export function formatDateShort(iso: string): string {
  return iso.replaceAll('-', '.')
}
