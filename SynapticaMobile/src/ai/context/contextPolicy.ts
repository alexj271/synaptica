export const CONTEXT_POLICY: Record<string, Array<string>> = {
  journal_parse: [
    'recentJournal',
    'sleepMetrics',
  ],
  health_review: [
    'healthMetrics',
    'trendSummary',
    'currentPlan',
  ],
  plan_update: [
    'healthMetrics',
    'longTermTrends',
    'activePlan',
    'constraints',
  ],
  chat_general: [
    'lightHealth',
    'activeGoals',
  ],
}
