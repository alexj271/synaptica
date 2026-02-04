export type ModelProfile = {
  name: string
  tier: 'small' | 'reasoning' | 'premium'
  costPer1k: number
  latencyMs: number
  reasoning: boolean
}

export const MODELS: Record<'FAST' | 'SMART' | 'DEEP', ModelProfile> = {
  FAST: {
    name: 'gpt-4o-mini',
    tier: 'small',
    costPer1k: 0.15,
    latencyMs: 300,
    reasoning: false,
  },
  SMART: {
    name: 'claude-sonnet',
    tier: 'reasoning',
    costPer1k: 3,
    latencyMs: 900,
    reasoning: true,
  },
  DEEP: {
    name: 'gpt-4.1',
    tier: 'premium',
    costPer1k: 10,
    latencyMs: 2000,
    reasoning: true,
  },
}
