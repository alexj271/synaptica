import {RootState} from '@/modules/store'
import {CONTEXT_POLICY} from './contextPolicy'
import {estimateTokens} from './tokenEstimator'
import {selectRecentJournal} from './selectors/journal.selector'
import {selectHealthMetrics, selectLightHealth} from './selectors/health.selector'
import {selectActivePlan, selectActiveGoals} from './selectors/plan.selector'

const DEFAULT_TOKEN_BUDGET = 6000

export function buildContext(
  intent: string,
  state: RootState,
) {
  const requiredBlocks = CONTEXT_POLICY[intent] ?? []
  const context: Record<string, unknown> = {}

  for (const block of requiredBlocks) {
    switch (block) {
      case 'recentJournal':
        context.recentJournal = selectRecentJournal(state)
        break
      case 'sleepMetrics':
        context.sleepMetrics = state.health.metrics.sleep
        break
      case 'healthMetrics':
        context.health = selectHealthMetrics(state)
        break
      case 'lightHealth':
        context.health = selectLightHealth(state)
        break
      case 'trendSummary':
        context.trendSummary = state.health.metrics.sleep?.trend
          ? {sleepTrend: state.health.metrics.sleep.trend}
          : null
        break
      case 'currentPlan':
      case 'activePlan':
        context.plan = selectActivePlan(state)
        break
      case 'activeGoals':
        context.goals = selectActiveGoals(state)
        break
      case 'longTermTrends':
        context.longTermTrends = {
          sleepTrend: state.health.metrics.sleep?.trend,
        }
        break
      case 'constraints':
        context.constraints = state.plan.strategy.constraints
        break
      default:
        break
    }
  }

  if (estimateTokens(context) > DEFAULT_TOKEN_BUDGET) {
    return compressContext(context)
  }

  return context
}

function compressContext(context: Record<string, unknown>) {
  const compressed = {...context}

  if (Array.isArray(compressed.recentJournal)) {
    compressed.recentJournal = compressed.recentJournal.slice(-3)
  }

  if (compressed.plan && typeof compressed.plan === 'object') {
    const plan = compressed.plan as any
    if (Array.isArray(plan.actions)) {
      plan.actions = plan.actions.slice(0, 3)
    }
  }

  return compressed
}
