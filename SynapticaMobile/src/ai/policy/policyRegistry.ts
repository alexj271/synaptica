export type PolicyRule = {
  risk?: 'low' | 'medium' | 'high' | 'critical'
  requiresConfirmation?: boolean
  cooldownHours?: number
  autoApprove?: boolean
}

export const POLICY: Record<string, PolicyRule> = {
  'plan/strategyUpdated': {
    risk: 'high',
    requiresConfirmation: true,
    cooldownHours: 24,
  },
  'plan/actionsReplaced': {
    risk: 'medium',
    requiresConfirmation: false,
    cooldownHours: 6,
  },
  'journal/entryParsed': {
    risk: 'low',
    autoApprove: true,
  },
}
