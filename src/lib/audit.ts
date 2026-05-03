export const AUDIT_ACTIONS = {
  LOG_CONTRIBUTION: "LOG_CONTRIBUTION",
  LOAN_APPROVE: "LOAN_APPROVE",
  LOAN_REJECT: "LOAN_REJECT",
  LOAN_DISBURSE: "LOAN_DISBURSE",
  FINE_WAIVE: "FINE_WAIVE",
  MEMBER_CREATE: "MEMBER_CREATE",
  MEMBER_UPDATE: "MEMBER_UPDATE",
  MEETING_CREATE: "MEETING_CREATE",
  ATTENDANCE_RECORD: "ATTENDANCE_RECORD",
} as const;

export type AuditEntry = {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function audit(entry: AuditEntry) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[audit]", entry.action, entry.resource, entry.resourceId ?? "");
  }
}
