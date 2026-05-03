/**
 * Local type definitions — mirrors the previous Prisma-generated types
 * so existing components don't need wholesale rewrites.
 */

export type Role = "ADMIN" | "CHAIRPERSON" | "TREASURER" | "SECRETARY" | "AUDITOR";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type MemberStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXITED";
export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "BANK_TRANSFER" | "CHEQUE";
export type MeetingStatus = "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "DISBURSED"
  | "ACTIVE"
  | "PAID"
  | "REJECTED"
  | "DEFAULTED"
  | "WRITTEN_OFF";
export type InstallmentStatus = "PENDING" | "PAID" | "PARTIAL" | "OVERDUE";
export type FineStatus = "OUTSTANDING" | "PAID" | "WAIVED";
export type FineReason = "LATENESS" | "ABSENCE" | "MISCONDUCT" | "OTHER";

export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  phoneNumber?: string | null;
}

export interface Member {
  id: string;
  memberNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string | null;
  nationalId: string | null;
  gender: Gender | null;
  occupation: string | null;
  address: string | null;
  status: MemberStatus;
  joinedAt: Date;
  createdAt: Date;
  notes: string | null;
}

export interface MemberWithCounts extends Member {
  _count: { contributions: number; receipts: number; attendance: number };
}

export interface Meeting {
  id: string;
  title: string;
  meetingDate: Date;
  location: string | null;
  agenda: string | null;
  minutes: string | null;
  status: MeetingStatus;
  createdById: string;
  createdAt: Date;
}

export interface MeetingWithCount extends Meeting {
  _count: { attendance: number };
}

export interface Attendance {
  id: string;
  meetingId: string;
  memberId: string;
  status: AttendanceStatus;
  checkedInAt: Date;
  notes: string | null;
}

export interface Contribution {
  id: string;
  memberId: string;
  meetingId: string | null;
  welfareAmount: number;
  savingsAmount: number;
  loanRepayment: number;
  fineAmount: number;
  shareAmount: number;
  registrationFee: number;
  otherAmount: number;
  otherDescription: string | null;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  reference: string | null;
  loggedById: string;
  notes: string | null;
  createdAt: Date;
}

export interface Receipt {
  id: string;
  receiptNumber: string;
  contributionId: string;
  memberId: string;
  totalAmount: number;
  issuedById: string;
  issuedAt: Date;
  printedCount: number;
  whatsappSent: boolean;
  whatsappSentAt: Date | null;
  version: number;
  voided: boolean;
  voidedAt: Date | null;
  voidReason: string | null;
  integrityHash: string;
}

export interface LoanInstallment {
  id: string;
  loanId: string;
  dueDate: Date;
  amount: number;
  status: InstallmentStatus;
  paidAmount: number;
  paidAt: Date | null;
}

export interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  principalAmount: number;
  requestedAmount: number;
  interestRate: number;
  termMonths: number;
  purpose: string | null;
  guarantors: string | null;
  amountRepaid: number;
  status: LoanStatus;
  appliedAt: Date;
  approvedAt: Date | null;
  approvedById: string | null;
  rejectedReason: string | null;
  disbursedAt: Date | null;
  dueAt: Date | null;
  closedAt: Date | null;
  notes: string | null;
}

export interface Fine {
  id: string;
  memberId: string;
  reason: FineReason;
  amount: number;
  description: string | null;
  status: FineStatus;
  attendanceId: string | null;
  createdAt: Date;
  waivedAt: Date | null;
  waivedById: string | null;
  waiveReason: string | null;
}

export interface Setting {
  key: string;
  value: string;
}
