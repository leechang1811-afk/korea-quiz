/**
 * Generate a short device/session id for anonymous runs
 */
export function generateDeviceId(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

/**
 * Format run score for display
 */
export function formatScore(score: number): string {
  return score.toLocaleString();
}

/**
 * Format percentile for display
 */
export function formatPercentile(p: number): string {
  return `상위 ${(100 - p).toFixed(1)}%`;
}
