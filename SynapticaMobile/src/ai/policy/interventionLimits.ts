const lastInterventions = new Map<string, number>()

export function violatesCooldown(
  actionType: string,
  cooldownHours: number,
) {
  const last = lastInterventions.get(actionType)
  if (!last) return false

  const diff = (Date.now() - last) / 3600000
  return diff < cooldownHours
}

export function registerIntervention(actionType: string) {
  lastInterventions.set(actionType, Date.now())
}

export function resetInterventions() {
  lastInterventions.clear()
}
