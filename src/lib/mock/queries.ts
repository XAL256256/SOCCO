/**
 * Read helpers over the mock dataset. Mirrors what page components
 * previously expected from `prisma.X.findMany()`-style calls.
 */

import {
  USERS, MEMBERS, MEETINGS, ATTENDANCE, CONTRIBUTIONS,
  RECEIPTS, LOANS, LOAN_INSTALLMENTS, FINES, SETTINGS, TODAY,
} from "./data";
import type {
  Member, Meeting, MemberWithCounts, MeetingWithCount,
  Loan, LoanInstallment, Contribution, Receipt, Attendance,
  Fine, User, Setting, MemberStatus,
} from "./types";

/** Anchor "now" for the demo — keeps charts/totals stable. */
export const DEMO_NOW = TODAY;

// ─── Users ─────────────────────────────────────────────────────────
export function getUsers(): User[] { return USERS; }
export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}
export function getUserByUsername(username: string): User | undefined {
  return USERS.find((u) => u.username === username);
}
export function getUserByRole(role: User["role"]): User | undefined {
  return USERS.find((u) => u.role === role);
}

// ─── Members ───────────────────────────────────────────────────────
export function listMembers(): MemberWithCounts[] {
  return MEMBERS.slice()
    .sort((a, b) => {
      if (a.status !== b.status) return a.status.localeCompare(b.status);
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .map(withCounts);
}

export function getMember(id: string): MemberWithCounts | undefined {
  const m = MEMBERS.find((x) => x.id === id);
  return m ? withCounts(m) : undefined;
}

export function activeMembers(): Member[] {
  return MEMBERS.filter((m) => m.status === "ACTIVE")
    .sort((a, b) => a.lastName.localeCompare(b.lastName));
}

export function membersByStatus(status: MemberStatus): Member[] {
  return MEMBERS.filter((m) => m.status === status);
}

function withCounts(m: Member): MemberWithCounts {
  return {
    ...m,
    _count: {
      contributions: CONTRIBUTIONS.filter((c) => c.memberId === m.id).length,
      receipts: RECEIPTS.filter((r) => r.memberId === m.id).length,
      attendance: ATTENDANCE.filter((a) => a.memberId === m.id).length,
    },
  };
}

// ─── Meetings ──────────────────────────────────────────────────────
export function listMeetings(): MeetingWithCount[] {
  return MEETINGS.slice()
    .sort((a, b) => b.meetingDate.getTime() - a.meetingDate.getTime())
    .map((m) => ({
      ...m,
      _count: { attendance: ATTENDANCE.filter((a) => a.meetingId === m.id).length },
    }));
}

export function getMeeting(id: string): Meeting | undefined {
  return MEETINGS.find((m) => m.id === id);
}

export function getMeetingAttendance(meetingId: string): Array<Attendance & { member: Member }> {
  return ATTENDANCE.filter((a) => a.meetingId === meetingId).map((a) => ({
    ...a,
    member: MEMBERS.find((m) => m.id === a.memberId)!,
  }));
}

// ─── Contributions / Receipts ──────────────────────────────────────
export function listContributions(opts?: { memberId?: string; limit?: number }) {
  let items = CONTRIBUTIONS.slice();
  if (opts?.memberId) items = items.filter((c) => c.memberId === opts.memberId);
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  if (opts?.limit) items = items.slice(0, opts.limit);
  return items.map((c) => ({
    ...c,
    member: MEMBERS.find((m) => m.id === c.memberId)!,
    receipt: RECEIPTS.find((r) => r.contributionId === c.id) ?? null,
    meeting: c.meetingId
      ? MEETINGS.find((m) => m.id === c.meetingId) ?? null
      : null,
  }));
}

export function listReceipts(opts?: { memberId?: string; limit?: number; query?: string }) {
  let items = RECEIPTS.slice();
  if (opts?.memberId) items = items.filter((r) => r.memberId === opts.memberId);
  if (opts?.query) {
    const q = opts.query.toLowerCase();
    items = items.filter((r) => {
      const m = MEMBERS.find((x) => x.id === r.memberId);
      const hay = `${r.receiptNumber} ${m?.firstName} ${m?.lastName} ${m?.memberNumber}`.toLowerCase();
      return hay.includes(q);
    });
  }
  items.sort((a, b) => b.issuedAt.getTime() - a.issuedAt.getTime());
  if (opts?.limit) items = items.slice(0, opts.limit);
  return items.map((r) => {
    const member = MEMBERS.find((m) => m.id === r.memberId)!;
    const contribution = CONTRIBUTIONS.find((c) => c.id === r.contributionId)!;
    return {
      ...r,
      member,
      contribution,
    };
  });
}

export function getReceipt(id: string) {
  const r = RECEIPTS.find((x) => x.id === id);
  if (!r) return undefined;
  return {
    ...r,
    member: MEMBERS.find((m) => m.id === r.memberId)!,
    contribution: CONTRIBUTIONS.find((c) => c.id === r.contributionId)!,
  };
}

// ─── Loans ─────────────────────────────────────────────────────────
export function listLoans() {
  return LOANS.slice()
    .sort((a, b) => b.appliedAt.getTime() - a.appliedAt.getTime())
    .map((l) => ({
      ...l,
      member: MEMBERS.find((m) => m.id === l.memberId)!,
      schedule: LOAN_INSTALLMENTS.filter((s) => s.loanId === l.id).sort(
        (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
      ),
    }));
}

export function getLoan(id: string) {
  const l = LOANS.find((x) => x.id === id);
  if (!l) return undefined;
  return {
    ...l,
    member: MEMBERS.find((m) => m.id === l.memberId)!,
    schedule: LOAN_INSTALLMENTS.filter((s) => s.loanId === l.id).sort(
      (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
    ),
  };
}

// ─── Fines ─────────────────────────────────────────────────────────
export function listFines(opts?: { status?: Fine["status"] }) {
  let items = FINES.slice();
  if (opts?.status) items = items.filter((f) => f.status === opts.status);
  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  return items.map((f) => ({
    ...f,
    member: MEMBERS.find((m) => m.id === f.memberId)!,
  }));
}

// ─── Settings ──────────────────────────────────────────────────────
export function listSettings(): Setting[] { return SETTINGS; }
