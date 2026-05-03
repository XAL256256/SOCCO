import { AuditStatus } from "@prisma/client";
import { prisma } from "./db";

type AuditEntry = {
  userId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: AuditStatus;
};

/** Append-only audit log. Never modify or delete past entries. */
export async function audit(entry: AuditEntry): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId ?? null,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId ?? null,
        metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ?? null,
        status: entry.status ?? AuditStatus.SUCCESS,
      },
    });
  } catch (err) {
    // Swallow: audit failures must NEVER break the user-facing flow,
    // but we still surface to the server console.
    console.error("[audit] failed to write entry", err);
  }
}

export const AUDIT_ACTIONS = {
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILED: "LOGIN_FAILED",
  LOGIN_LOCKED: "LOGIN_LOCKED",
  LOGOUT: "LOGOUT",
  CREATE_MEMBER: "CREATE_MEMBER",
  UPDATE_MEMBER: "UPDATE_MEMBER",
  DELETE_MEMBER: "DELETE_MEMBER",
  CREATE_MEETING: "CREATE_MEETING",
  UPDATE_MEETING: "UPDATE_MEETING",
  RECORD_ATTENDANCE: "RECORD_ATTENDANCE",
  LOG_CONTRIBUTION: "LOG_CONTRIBUTION",
  GENERATE_RECEIPT: "GENERATE_RECEIPT",
  PRINT_RECEIPT: "PRINT_RECEIPT",
  SEND_WHATSAPP: "SEND_WHATSAPP",
  CREATE_USER: "CREATE_USER",
  UPDATE_USER: "UPDATE_USER",
  CHANGE_PASSWORD: "CHANGE_PASSWORD",
  RATE_LIMITED: "RATE_LIMITED",
} as const;
