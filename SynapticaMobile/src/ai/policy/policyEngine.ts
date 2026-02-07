import {POLICY} from './policyRegistry'
import {needsUserConfirmation} from './confirmationPolicy'
import {violatesCooldown, registerIntervention} from './interventionLimits'
import {scoreAction} from './riskScoring'
import type {AIResponse} from '@/ai/schemas/aiResponse.schema'

export type DomainAction = AIResponse['domainActions'][number]

export function evaluateActions(actions: DomainAction[]) {
  const approved: DomainAction[] = []
  const requiresConfirmation: DomainAction[] = []
  const rejected: DomainAction[] = []

  for (const action of actions) {
    const policy = POLICY[action.type]

    const risk = scoreAction(action)

    if (!policy) {
      if (risk === 'critical') {
        rejected.push(action)
      } else {
        requiresConfirmation.push(action)
      }
      continue
    }

    if (policy.cooldownHours && violatesCooldown(action.type, policy.cooldownHours)) {
      rejected.push(action)
      continue
    }

    if (risk === 'critical') {
      requiresConfirmation.push(action)
      continue
    }

    if (needsUserConfirmation(policy)) {
      requiresConfirmation.push(action)
      continue
    }

    approved.push(action)
    registerIntervention(action.type)
  }

  return {
    approved,
    requiresConfirmation,
    rejected,
  }
}
