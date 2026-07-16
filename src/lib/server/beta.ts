import { createHmac, timingSafeEqual } from 'node:crypto'

export const COOKIE_NAME = 'prosapia_beta'
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

const PUBLIC_PATHS = new Set(['/', '/contact', '/terms', '/privacy', '/beta-access'])

export function isBetaGatedPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return false
  if (pathname.startsWith('/api/')) return false
  if (pathname.startsWith('/invite/')) return false
  return true
}

export function issueBetaCookieValue(secret: string): string {
  return createHmac('sha256', secret).update(secret).digest('hex')
}

export function verifyBetaCookie(cookieValue: string | undefined, secret: string): boolean {
  if (!cookieValue) return false
  const expected = issueBetaCookieValue(secret)
  const actual = Buffer.from(cookieValue)
  const expectedBuf = Buffer.from(expected)
  if (actual.length !== expectedBuf.length) return false
  return timingSafeEqual(actual, expectedBuf)
}
