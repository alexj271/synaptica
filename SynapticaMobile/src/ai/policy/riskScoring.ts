export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'

export function scoreAction(action: {type: string}) : RiskLevel {
  if (action.type === 'plan/strategyUpdated') {
    return 'high'
  }

  if (action.type === 'health/metricUpdated') {
    return 'critical'
  }

  return 'low'
}
