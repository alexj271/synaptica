jest.mock('../../src/ai/context/tokenEstimator', () => ({
  estimateTokens: jest.fn(() => 100),
}))

const {buildContext} = require('../../src/ai/context/buildContext')
const {selectRecentJournal} = require('../../src/ai/context/selectors/journal.selector')
const {selectHealthMetrics} = require('../../src/ai/context/selectors/health.selector')
const {selectActivePlan} = require('../../src/ai/context/selectors/plan.selector')

describe('context engine', () => {
  const baseState = {
    health: {
      metrics: {
        sleep: {duration: 420, quality: 80, trend: 'up', lastUpdated: '2025-01-01T10:00:00.000Z'},
      },
      subjective: {energy: 6, stress: 4, mood: 'ok'},
    },
    journal: {
      entries: Array.from({length: 10}).map((_, idx) => ({
        id: `e-${idx}`,
        date: `2025-01-${idx + 1}T10:00:00.000Z`,
        rawText: 'text',
        parsed: {energy: idx, stress: idx},
        source: 'manual',
      })),
    },
    plan: {
      strategy: {
        goal: 'Improve sleep',
        priorities: ['sleep'],
        constraints: ['low energy'],
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      actions: [
        {id: 'a1', title: 'A', type: 'habit', status: 'pending', impact: ['energy']},
        {id: 'a2', title: 'B', type: 'habit', status: 'done', impact: ['sleep']},
        {id: 'a3', title: 'C', type: 'measurement', status: 'pending', impact: ['metrics']},
      ],
    },
  }

  it('selects recent journal entries with parsed fields', () => {
    const recent = selectRecentJournal(baseState)
    expect(recent).toHaveLength(7)
    expect(recent[0]).toHaveProperty('energy')
    expect(recent[0]).toHaveProperty('stress')
  })

  it('selects minimal health metrics', () => {
    const health = selectHealthMetrics(baseState)
    expect(health.sleep).toBeDefined()
    expect(health.subjective.energy).toBe(6)
  })

  it('selects active plan actions', () => {
    const plan = selectActivePlan(baseState)
    expect(plan.actions).toHaveLength(2)
  })

  it('builds intent-driven context for journal_parse', () => {
    const context = buildContext('journal_parse', baseState)
    expect(context.recentJournal).toBeDefined()
    expect(context.sleepMetrics).toBeDefined()
  })

  it('compresses context when token budget exceeded', () => {
    const {estimateTokens} = require('../../src/ai/context/tokenEstimator')
    estimateTokens.mockReturnValueOnce(7000)

    const context = buildContext('plan_update', baseState)
    expect(context.plan.actions.length).toBeLessThanOrEqual(3)
  })
})
