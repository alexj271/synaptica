import {evaluateActions} from '../../src/ai/policy/policyEngine'
import {resetInterventions, registerIntervention} from '../../src/ai/policy/interventionLimits'

describe('policy engine', () => {
  beforeEach(() => {
    resetInterventions()
  })

  it('approves auto-approved actions', () => {
    const result = evaluateActions([
      {type: 'journal/entryParsed', payload: {id: '1'}},
    ])

    expect(result.approved).toHaveLength(1)
    expect(result.rejected).toHaveLength(0)
  })

  it('requires confirmation for high-risk actions', () => {
    const result = evaluateActions([
      {type: 'plan/strategyUpdated', payload: {goal: 'x'}},
    ])

    expect(result.requiresConfirmation).toHaveLength(1)
    expect(result.approved).toHaveLength(0)
  })

  it('rejects unknown actions', () => {
    const result = evaluateActions([
      {type: 'unknown/action', payload: {}},
    ])

    expect(result.requiresConfirmation).toHaveLength(1)
  })

  it('rejects critical risk actions without policy', () => {
    const result = evaluateActions([
      {type: 'health/metricUpdated', payload: {value: 120}},
    ])

    expect(result.rejected).toHaveLength(1)
    expect(result.approved).toHaveLength(0)
  })

  it('rejects actions violating cooldown', () => {
    registerIntervention('plan/actionsReplaced')

    const result = evaluateActions([
      {type: 'plan/actionsReplaced', payload: []},
    ])

    expect(result.rejected).toHaveLength(1)
  })
})
