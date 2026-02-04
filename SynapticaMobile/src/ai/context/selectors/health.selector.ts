import {RootState} from '@/modules/store'

export function selectHealthMetrics(state: RootState) {
  const {sleep, pressure, weight} = state.health.metrics

  return {
    sleep,
    pressure,
    weight,
    subjective: state.health.subjective,
  }
}

export function selectLightHealth(state: RootState) {
  const {sleep} = state.health.metrics

  return {
    sleep,
    subjective: state.health.subjective,
  }
}
