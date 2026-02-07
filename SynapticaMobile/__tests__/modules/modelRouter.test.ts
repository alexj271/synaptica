import {detectComplexity} from '../../src/ai/router/taskComplexity'
import {selectModel} from '../../src/ai/router/routingPolicy'
import {MODELS} from '../../src/ai/router/modelProfiles'
import {canUseModel, registerSpend, resetBudget, setMonthlyBudget} from '../../src/ai/router/costGuard'
import {routeModel} from '../../src/ai/router/modelRouter'

describe('model router', () => {
  beforeEach(() => {
    resetBudget()
  })

  it('detects complexity based on intent and context size', () => {
    expect(detectComplexity('journal_parse', 10)).toBe('trivial')
    expect(detectComplexity('health_review', 10)).toBe('standard')
    expect(detectComplexity('plan_update', 2501)).toBe('deep')
  })

  it('selects model by complexity', () => {
    expect(selectModel('trivial')).toEqual(MODELS.FAST)
    expect(selectModel('standard')).toEqual(MODELS.SMART)
    expect(selectModel('deep')).toEqual(MODELS.DEEP)
  })

  it('enforces budget with cost guard', () => {
    setMonthlyBudget(1)
    registerSpend(2)
    expect(canUseModel(MODELS.DEEP)).toBe(false)
  })

  it('routes model based on intent', async () => {
    const result = await routeModel({
      intent: 'journal_parse',
    })

    expect(result.model).toEqual(MODELS.FAST)
    expect(result.complexity).toBe('trivial')
  })

  it('routes deep when contextSize is large', async () => {
    const result = await routeModel({
      intent: 'plan_update',
      contextSize: 3000,
    })

    expect(result.model).toEqual(MODELS.DEEP)
    expect(result.complexity).toBe('deep')
  })

  it('downgrades to FAST when budget exceeded', async () => {
    setMonthlyBudget(1)
    registerSpend(2)

    const result = await routeModel({
      intent: 'plan_update',
      contextSize: 3000,
    })

    expect(result.model).toEqual(MODELS.FAST)
  })
})
