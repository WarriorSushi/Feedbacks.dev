export function getPrivacySalt(envName: 'VOTE_HMAC_SECRET' | 'BOARD_REPORT_SALT', devFallback: string) {
  const value = process.env[envName]?.trim()
  if (value) return value

  if (process.env.NODE_ENV === 'production') {
    throw new Error(`${envName} is required in production`)
  }

  return devFallback
}
