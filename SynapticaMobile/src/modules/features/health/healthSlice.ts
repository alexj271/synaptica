import {createSlice, PayloadAction} from '@reduxjs/toolkit'

// Types based on docs/REDUCERS.md
export type SleepMetric = {
  duration: number // minutes
  quality: number // 0-100
  trend: 'up' | 'down' | 'stable'
  lastUpdated: string // ISO
}

export type PressureMetric = {
  systolic: number
  diastolic: number
  measuredAt: string
}

export type WeightMetric = {
  value: number
  measuredAt: string
}

export type HealthState = {
  metrics: {
    sleep?: SleepMetric
    pressure?: PressureMetric
    weight?: WeightMetric
    [key: string]: any
  }
  subjective: {
    energy?: number // 1-10
    stress?: number // 1-10
    mood?: string
    [key: string]: any
  }
}

const initialState: HealthState = {
  metrics: {},
  subjective: {},
}

type MetricUpdatedPayload = {
  type: string
  value: any
}

const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    metricUpdated(state, action: PayloadAction<MetricUpdatedPayload>) {
      const {type, value} = action.payload
      // store facts only, no computations
      state.metrics[type] = value
    },

    subjectiveUpdated(state, action: PayloadAction<Partial<HealthState['subjective']>>) {
      state.subjective = {
        ...state.subjective,
        ...action.payload,
      }
    },

    metricsBatchUpdated(state, action: PayloadAction<Partial<HealthState['metrics']>>) {
      state.metrics = {
        ...state.metrics,
        ...action.payload,
      }
    },
  },
})

export const {metricUpdated, subjectiveUpdated, metricsBatchUpdated} = healthSlice.actions
export default healthSlice.reducer
