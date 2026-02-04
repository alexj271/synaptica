import {AIIntent} from './intent.types'

export function ruleClassifier(
  actionType: string,
  payload: any,
): AIIntent | null {
  if (actionType === 'journal/entryAdded') {
    return 'journal_parse'
  }

  if (actionType === 'health/manualMetricAdded') {
    return 'health_review'
  }

  if (actionType === 'chat/messageSent') {
    const text = payload?.text?.toLowerCase()

    if (!text) return 'chat_general'

    if (contains(text, ['plan', 'schedule', 'training'])) {
      return 'plan_update'
    }

    if (contains(text, ['pressure', 'sleep', 'weight'])) {
      return 'health_review'
    }

    if (contains(text, ['feel', 'felt', 'energy', 'tired'])) {
      return 'journal_parse'
    }

    return null
  }

  return null
}

function contains(text: string, words: string[]) {
  return words.some(word => text.includes(word))
}
