export type AuditEntry = {
  intent: string
  contextHash?: string
  model?: string
  proposedActions: unknown[]
  approvedActions: unknown[]
  rejectedActions: unknown[]
  requiresConfirmation: unknown[]
}

const auditLog: AuditEntry[] = []

export function logPolicyDecision(entry: AuditEntry) {
  auditLog.push(entry)
}

export function getAuditLog() {
  return [...auditLog]
}

export function clearAuditLog() {
  auditLog.length = 0
}
