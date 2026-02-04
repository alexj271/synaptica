import {createSlice, PayloadAction} from '@reduxjs/toolkit'
import {v4 as uuidv4} from 'uuid'

export type JournalEntry = {
  id: string
  date: string // ISO
  rawText: string
  parsed?: {
    energy?: number
    stress?: number
    sleepComplaint?: boolean
    symptoms?: string[]
  }
  source: 'manual' | 'voice'
}

export type JournalState = {
  entries: JournalEntry[]
}

const initialState: JournalState = {
  entries: [],
}

const journalSlice = createSlice({
  name: 'journal',
  initialState,
  reducers: {
    entryAdded(state, action: PayloadAction<Omit<JournalEntry, 'id'>>) {
      const entry: JournalEntry = {
        ...action.payload,
        id: uuidv4(),
      }
      state.entries.push(entry)
    },

    entryParsed(state, action: PayloadAction<{id: string; parsed: JournalEntry['parsed']}>) {
      const {id, parsed} = action.payload
      const entry = state.entries.find(e => e.id === id)
      if (entry) {
        entry.parsed = parsed
      }
    },

    entryUpdated(state, action: PayloadAction<Partial<JournalEntry> & {id: string}>) {
      const {id, ...rest} = action.payload
      const entry = state.entries.find(e => e.id === id)
      if (!entry) return

      // rawText is immutable; ignore updates to it
      const allowed = {...rest}
      delete (allowed as {rawText?: string}).rawText
      Object.assign(entry, allowed)
    },
  },
})

export const {entryAdded, entryParsed, entryUpdated} = journalSlice.actions
export default journalSlice.reducer
