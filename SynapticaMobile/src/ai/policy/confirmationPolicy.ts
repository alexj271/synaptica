import {PolicyRule} from './policyRegistry'

export function needsUserConfirmation(policy?: PolicyRule) {
  return policy?.requiresConfirmation === true
}
