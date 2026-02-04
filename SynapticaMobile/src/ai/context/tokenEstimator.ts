export function estimateTokens(obj: unknown): number {
  const text = JSON.stringify(obj)
  return Math.ceil(text.length / 4)
}
