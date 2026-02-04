import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {v4 as uuidv4} from 'uuid'

export type PlanAction = {
  id: string
  title: string
  type: 'habit' | 'training' | 'measurement'
  schedule?: string
  status: 'pending' | 'done' | 'skipped'
  impact: string[]
}

export type PlanState = {
  strategy: {
    goal: string
    priorities: string[]
    constraints: string[]
    updatedAt: string
  }
  actions: PlanAction[]
}

const initialState: PlanState = {
  strategy: {
    goal: '',
    priorities: [],
    constraints: [],
    updatedAt: new Date(0).toISOString(),
  },
  actions: [],
}

const planSlice = createSlice({
  name: 'plan',
  initialState,
  reducers: {
    strategyUpdated(state, action: PayloadAction<Omit<PlanState['strategy'], 'updatedAt'>>) {
      state.strategy = {
        ...action.payload,
        updatedAt: new Date().toISOString(),
      }
    },

    actionsReplaced(state, action: PayloadAction<PlanAction[]>) {
      // ensure each action has id
      state.actions = action.payload.map(a => ({...a, id: a.id || uuidv4()}))
    },

    actionStatusChanged(state, action: PayloadAction<{id: string; status: PlanAction['status']}>) {
      const {id, status} = action.payload
      const act = state.actions.find(a => a.id === id)
      if (act) act.status = status
    },
  },
})

export const {strategyUpdated, actionsReplaced, actionStatusChanged} = planSlice.actions
export default planSlice.reducer
