import {RootState} from '@/modules/store'

export function selectActivePlan(state: RootState) {
  return {
    strategy: state.plan.strategy,
    actions: state.plan.actions.filter(action => action.status === 'pending'),
  }
}

export function selectActiveGoals(state: RootState) {
  return {
    goal: state.plan.strategy.goal,
    priorities: state.plan.strategy.priorities,
  }
}
