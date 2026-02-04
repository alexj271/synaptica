export type TaskComplexity = 'trivial' | 'standard' | 'deep'

export function detectComplexity(
  intent: string,
  contextSize: number,
): TaskComplexity {
  if (intent === 'journal_parse') {
    return 'trivial'
  }

  if (intent === 'health_review') {
    return 'standard'
  }

  if (intent === 'plan_update' && contextSize > 2000) {
    return 'deep'
  }

  return 'standard'
}
