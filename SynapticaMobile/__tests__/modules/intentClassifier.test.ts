jest.mock('../../src/ai/intent/aiClassifier', () => ({
  aiClassifier: jest.fn(async () => ({intent: 'plan_update', confidence: 0.9})),
}))

const {ruleClassifier} = require('../../src/ai/intent/ruleClassifier')
const {detectIntent, clearIntentCache} = require('../../src/ai/intent/detectIntent')

describe('intent classifiers', () => {
  beforeEach(() => {
    clearIntentCache()
  })

  it('routes journal/entryAdded via rule classifier', () => {
    const intent = ruleClassifier('journal/entryAdded', {rawText: 'test'})
    expect(intent).toBe('journal_parse')
  })

  it('routes health/manualMetricAdded via rule classifier', () => {
    const intent = ruleClassifier('health/manualMetricAdded', {metric: 'sleep'})
    expect(intent).toBe('health_review')
  })

  it('routes chat keywords via rule classifier', () => {
    const intent = ruleClassifier('chat/messageSent', {text: 'need a plan'})
    expect(intent).toBe('plan_update')
  })

  it('falls back to AI classifier for ambiguous chat', async () => {
    const intent = await detectIntent({type: 'chat/messageSent', payload: {text: 'hello'}})
    expect(intent).toBe('plan_update')
  })

})
