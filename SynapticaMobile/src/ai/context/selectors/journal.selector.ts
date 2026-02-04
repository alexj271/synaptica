import {RootState} from '@/modules/store'

export function selectRecentJournal(state: RootState) {
  return state.journal.entries
    .slice(-7)
    .map(entry => ({
      date: entry.date,
      energy: entry.parsed?.energy,
      stress: entry.parsed?.stress,
      symptoms: entry.parsed?.symptoms,
    }))
}
