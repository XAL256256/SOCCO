/**
 * Deterministic mock dataset for investor demo.
 * No DB — single source of truth, identical between SSR and client renders.
 *
 * Seed-based PRNG so any rerun produces the same numbers.
 */

import {
  User, Member, Meeting, Attendance, Contribution, Receipt,
  Loan, LoanInstallment, Fine, Setting,
} from "./types";

// ─── PRNG ──────────────────────────────────────────────────────────
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(0x4e424f); // "NBO" — arbitrary fixed seed
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rng() * arr.length)]!;
const between = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
const chance = (p: number) => rng() < p;
const pad = (n: number, w = 3) => String(n).padStart(w, "0");

// ─── Anchor dates (all relative to the latest "month closed") ─────
const NOW = new Date(2026, 4, 3, 12, 0, 0); // Sun May 3 2026 — matches the demo
const MONTHS_TRACKED = 6;

// ─── Staff ─────────────────────────────────────────────────────────
export const USERS: User[] = [
  { id: "u_admin",     username: "admin",     email: "admin@nboog.org",     fullName: "System Administrator", role: "ADMIN",       phoneNumber: "+256700000001" },
  { id: "u_treasurer", username: "treasurer", email: "treasurer@nboog.org", fullName: "Joel Twinamatsiko",     role: "TREASURER",   phoneNumber: "+256700000002" },
  { id: "u_secretary", username: "secretary", email: "secretary@nboog.org", fullName: "Sarah Namugga",         role: "SECRETARY",   phoneNumber: "+256700000003" },
  { id: "u_chair",     username: "chair",     email: "chair@nboog.org",     fullName: "Wilson Byarugaba",      role: "CHAIRPERSON", phoneNumber: "+256700000004" },
  { id: "u_auditor",   username: "auditor",   email: "auditor@nboog.org",   fullName: "Robert Tugumisirize",   role: "AUDITOR",     phoneNumber: "+256700000005" },
];

const TREASURER = USERS.find((u) => u.role === "TREASURER")!;
const SECRETARY = USERS.find((u) => u.role === "SECRETARY")!;
const CHAIR = USERS.find((u) => u.role === "CHAIRPERSON")!;

// ─── Roster (real names from March 2026 NBOOG report) ─────────────
const ROSTER: [string, string, "MALE" | "FEMALE", string][] = [
  ["Sande Gregory", "Bakunda",       "MALE",   "Farmer"],
  ["Deogracious",   "Bamwebaze",     "MALE",   "Trader"],
  ["Jolly",         "Bamwebaze",     "FEMALE", "Tailor"],
  ["Justus",        "Barageine",     "MALE",   "Engineer"],
  ["Anke",          "Barahukwa",     "FEMALE", "Doctor"],
  ["Nickson",       "Barahukwa",     "MALE",   "Driver"],
  ["Billy",         "Birungi",       "MALE",   "Trader"],
  ["Brendah",       "Birungi",       "FEMALE", "Accountant"],
  ["Angellah",      "Byarugaba",     "FEMALE", "Teacher"],
  ["Elizabeth",     "Byarugaba",     "FEMALE", "Civil servant"],
  ["Emily",         "Byarugaba",     "FEMALE", "Nurse"],
  ["Kelvin",        "Byarugaba",     "MALE",   "Engineer"],
  ["Wilson",        "Byarugaba",     "MALE",   "Chairperson · NBOOG"],
  ["Micky Rujumba", "Emanzi",        "MALE",   "Lawyer"],
  ["Joan Prose",    "Kabayambi",     "FEMALE", "Banker"],
  ["Annet",         "Katushabe",     "FEMALE", "Trader"],
  ["Julius",        "Katusiime",     "MALE",   "Mechanic"],
  ["Innocent",      "Kembabazi",     "FEMALE", "Auditor"],
  ["Fiona",         "Kente",         "FEMALE", "Designer"],
  ["Deborah",       "Kiconco",       "FEMALE", "Doctor"],
  ["Hannington",    "Kiconco",       "MALE",   "Pharmacist"],
  ["Sincere",       "Kyarikunda",    "FEMALE", "Trader"],
  ["Grace Flavia",  "Lamuno-Birungi","FEMALE", "Accountant"],
  ["Martin",        "Mbabazi",       "MALE",   "Engineer"],
  ["Ambrose",       "Mugisha",       "MALE",   "Investor"],
  ["Juliet",        "Mugisha",       "FEMALE", "Doctor"],
  ["Sylivia",       "Muheirwe",      "FEMALE", "Accountant"],
  ["Ian",           "Muhumuza",      "MALE",   "Driver"],
  ["Gloria",        "Ninsiima",      "FEMALE", "Teacher"],
  ["Amos",          "Niwagaba",      "MALE",   "Pastor"],
  ["Medius",        "Niwagaba",      "FEMALE", "Trader"],
  ["Norman",        "Niwagaba",      "MALE",   "Driver"],
  ["Peace",         "Nsimenta",      "FEMALE", "Accountant"],
  ["Kedress",       "Orikiriza",     "FEMALE", "Tailor"],
  ["Lillian",       "Taarushookye",  "FEMALE", "Designer"],
  ["Robert",        "Tugumisirize",  "MALE",   "Auditor · NBOOG"],
  ["Gertrude",      "Tukahirwa",     "FEMALE", "Accountant"],
  ["Oliver",        "Tumanye",       "MALE",   "Engineer"],
  ["Rosette",       "Tumushabe",     "FEMALE", "Teacher"],
  ["Joel",          "Twinamatsiko",  "MALE",   "Treasurer · NBOOG"],
  ["Grace",         "Twinomuhwezi",  "FEMALE", "Banker"],
  ["Henry",         "Twinomuhwezi",  "MALE",   "Pharmacist"],
  ["Kafunjo",       "Twinomujuni",   "MALE",   "Trader"],
  ["Patricia",      "Akampurira",    "FEMALE", "Trader"],
  ["Daniel",        "Mwesigwa",      "MALE",   "Engineer"],
];

// ─── Members ───────────────────────────────────────────────────────
const JOINED_AT = new Date(NOW.getFullYear() - 1, 0, 4);

export const MEMBERS: Member[] = ROSTER.map(([first, last, gender, occupation], i) => ({
  id: `m_${pad(i + 1, 4)}`,
  memberNumber: `NBG-${pad(i + 1, 4)}`,
  firstName: first,
  lastName: last,
  phoneNumber: `+256701${pad(i + 1000, 6)}`,
  email: `${first.toLowerCase().replace(/\s+/g, ".")}.${last.toLowerCase().replace(/\s+/g, ".")}@nboog.org`,
  nationalId: null,
  gender,
  occupation,
  address: "Mukono District, Uganda",
  status: i === 6 ? "INACTIVE" : i === 12 ? "SUSPENDED" : "ACTIVE",
  joinedAt: JOINED_AT,
  createdAt: JOINED_AT,
  notes: null,
}));

// ─── Meetings ──────────────────────────────────────────────────────
export const MEETINGS: Meeting[] = [];
for (let i = MONTHS_TRACKED - 1; i >= 0; i--) {
  const d = new Date(NOW.getFullYear(), NOW.getMonth() - i, 5, 19, 0);
  if (d > NOW) continue;
  MEETINGS.push({
    id: `mt_${pad(MEETINGS.length + 1, 3)}`,
    title: `${d.toLocaleString("en-UG", { month: "long" })} Monthly Meeting`,
    meetingDate: d,
    location: "NBOOG Hall, Mukono",
    agenda: "Welfare contributions, savings, loan applications, member updates.",
    minutes: null,
    status: "COMPLETED",
    createdById: SECRETARY.id,
    createdAt: d,
  });
}
// upcoming meeting
MEETINGS.push({
  id: `mt_${pad(MEETINGS.length + 1, 3)}`,
  title: `${new Date(NOW.getFullYear(), NOW.getMonth() + 1, 5).toLocaleString("en-UG", { month: "long" })} Monthly Meeting`,
  meetingDate: new Date(NOW.getFullYear(), NOW.getMonth() + 1, 5, 19, 0),
  location: "NBOOG Hall, Mukono",
  agenda: "Quarterly review, dividend planning, new applications.",
  minutes: null,
  status: "SCHEDULED",
  createdById: SECRETARY.id,
  createdAt: NOW,
});

// ─── March 2026 real collections from the source PDF ──────────────
const MARCH_KEY = (m: Member) => `${m.firstName} ${m.lastName}`;
const MARCH_REAL: Record<string, { repay?: number; sav?: number; wel?: number; ch?: number; fee?: number }> = {
  "Sande Gregory Bakunda": { repay: 100_000, sav: 210_000, wel: 1_090_000 },
  "Deogracious Bamwebaze": { sav: 1_000_000, wel: 30_000 },
  "Jolly Bamwebaze":       { sav: 200_000, wel: 30_000 },
  "Justus Barageine":      { sav: 10_000_000, wel: 30_000 },
  "Anke Barahukwa":        { sav: 150_000, wel: 30_000 },
  "Nickson Barahukwa":     { sav: 100_000, wel: 30_000 },
  "Billy Birungi":         { sav: 1_000_000, wel: 30_000 },
  "Brendah Birungi":       { sav: 3_120_000, wel: 0 },
  "Angellah Byarugaba":    { sav: 1_750_000, wel: 30_000 },
  "Elizabeth Byarugaba":   { repay: 746_667, sav: 1_023_333, wel: 30_000 },
  "Annet Katushabe":       { sav: 560_000, wel: 30_000 },
  "Julius Katusiime":      { sav: 100_000, wel: 655_000 },
  "Innocent Kembabazi":    { sav: 2_120_000, wel: 30_000 },
  "Fiona Kente":           { sav: 100_000, wel: 1_396_550, ch: 3_450 },
  "Deborah Kiconco":       { sav: 3_470_000, wel: 1_530_000 },
  "Hannington Kiconco":    { sav: 50_000, wel: 150_000 },
  "Sincere Kyarikunda":    { sav: 68_850, wel: 30_000, ch: 1_150 },
  "Grace Flavia Lamuno-Birungi": { sav: 1_000_000, wel: 30_000 },
  "Martin Mbabazi":        { sav: 50_000, wel: 30_000 },
  "Ambrose Mugisha":       { sav: 15_156_550, wel: 30_000, ch: 3_450, fee: 10_000 },
  "Juliet Mugisha":        { sav: 4_986_550, wel: 2_030_000, ch: 3_450, fee: 10_000 },
  "Sylivia Muheirwe":      { sav: 970_000, wel: 30_000 },
  "Ian Muhumuza":          { sav: 50_000, wel: 30_000 },
  "Gloria Ninsiima":       { sav: 220_000, wel: 30_000 },
  "Amos Niwagaba":         { sav: 50_000, wel: 50_000 },
  "Medius Niwagaba":       { sav: 270_000, wel: 30_000 },
  "Norman Niwagaba":       { repay: 920_000, sav: 50_000, wel: 30_000 },
  "Peace Nsimenta":        { sav: 97_700, wel: 200_000, ch: 2_300 },
  "Kedress Orikiriza":     { sav: 50_000, wel: 30_000 },
  "Lillian Taarushookye":  { sav: 96_550, wel: 530_000, ch: 3_450 },
  "Robert Tugumisirize":   { sav: 267_700, wel: 30_000, ch: 2_300 },
  "Oliver Tumanye":        { sav: 96_550, wel: 2_090_000, ch: 3_450 },
  "Rosette Tumushabe":     { sav: 1_466_550, wel: 30_000, ch: 3_450 },
  "Joel Twinamatsiko":     { sav: 100_000, wel: 1_896_550, ch: 3_450 },
  "Grace Twinomuhwezi":    { sav: 97_700, wel: 330_000, ch: 2_300 },
  "Henry Twinomuhwezi":    { sav: 107_700, wel: 530_000, ch: 2_300 },
  "Kafunjo Twinomujuni":   { sav: 1_003_450, wel: 30_000 },
};

// ─── Generate attendance + contributions + receipts ───────────────
export const ATTENDANCE: Attendance[] = [];
export const CONTRIBUTIONS: Contribution[] = [];
export const RECEIPTS: Receipt[] = [];
export const FINES: Fine[] = [];

let receiptSeq = 1;
let attendanceSeq = 1;
let contribSeq = 1;
let fineSeq = 1;

for (const meeting of MEETINGS) {
  if (meeting.status !== "COMPLETED") continue;
  const isLatest =
    meeting.meetingDate.getMonth() === NOW.getMonth() &&
    meeting.meetingDate.getFullYear() === NOW.getFullYear();

  const attendees = [...MEMBERS]
    .filter((m) => m.status === "ACTIVE")
    .sort(() => rng() - 0.5)
    .slice(0, Math.floor(MEMBERS.length * 0.85));
  const presentIds = new Set(attendees.map((a) => a.id));

  for (const m of attendees) {
    const isLate = chance(0.12);
    const checkInTime = new Date(meeting.meetingDate);
    if (isLate) {
      checkInTime.setMinutes(checkInTime.getMinutes() + 15 + between(0, 30));
    } else {
      checkInTime.setMinutes(checkInTime.getMinutes() - between(0, 10));
    }

    ATTENDANCE.push({
      id: `at_${pad(attendanceSeq++, 5)}`,
      meetingId: meeting.id,
      memberId: m.id,
      status: isLate ? "LATE" : "PRESENT",
      checkedInAt: checkInTime,
      notes: null,
    });

    if (isLate) {
      FINES.push({
        id: `fn_${pad(fineSeq++, 4)}`,
        memberId: m.id,
        reason: "LATENESS",
        amount: 10_000,
        description: `Late for ${meeting.title}`,
        status: chance(0.5) ? "OUTSTANDING" : "PAID",
        attendanceId: null,
        createdAt: checkInTime,
        waivedAt: null,
        waivedById: null,
        waiveReason: null,
      });
    }

    let welfare = 30_000;
    let savings = 0;
    let loanRepay = 0;
    let charges = 0;
    let fees = 0;

    if (isLatest) {
      const real = MARCH_REAL[MARCH_KEY(m)];
      if (real) {
        welfare = real.wel ?? 30_000;
        savings = real.sav ?? 0;
        loanRepay = real.repay ?? 0;
        charges = real.ch ?? 0;
        fees = real.fee ?? 0;
      } else {
        savings = 50_000 + between(0, 4) * 50_000;
      }
    } else {
      savings = 50_000 + between(0, 7) * 50_000;
      if (chance(0.15)) loanRepay = 200_000 + between(0, 2) * 200_000;
    }

    const total = welfare + savings + loanRepay + charges + fees;
    if (total === 0) continue;

    const contribId = `c_${pad(contribSeq++, 5)}`;
    CONTRIBUTIONS.push({
      id: contribId,
      memberId: m.id,
      meetingId: meeting.id,
      welfareAmount: welfare,
      savingsAmount: savings,
      loanRepayment: loanRepay,
      fineAmount: 0,
      shareAmount: 0,
      registrationFee: 0,
      otherAmount: charges + fees,
      otherDescription: charges || fees ? "Charges/Fees" : null,
      totalAmount: total,
      paymentMethod: "CASH",
      reference: null,
      loggedById: TREASURER.id,
      notes: null,
      createdAt: checkInTime,
    });

    const y = meeting.meetingDate.getFullYear();
    const mo = pad(meeting.meetingDate.getMonth() + 1, 2);
    const d = pad(meeting.meetingDate.getDate(), 2);
    const receiptNumber = `RCT-${y}${mo}${d}-${pad(receiptSeq++)}`;

    RECEIPTS.push({
      id: `r_${pad(RECEIPTS.length + 1, 5)}`,
      receiptNumber,
      contributionId: contribId,
      memberId: m.id,
      totalAmount: total,
      issuedById: TREASURER.id,
      issuedAt: checkInTime,
      printedCount: 0,
      whatsappSent: false,
      whatsappSentAt: null,
      version: 1,
      voided: false,
      voidedAt: null,
      voidReason: null,
      integrityHash: `mock-${contribId}`,
    });
  }

  for (const m of MEMBERS) {
    if (presentIds.has(m.id)) continue;
    if (m.status !== "ACTIVE") continue;
    ATTENDANCE.push({
      id: `at_${pad(attendanceSeq++, 5)}`,
      meetingId: meeting.id,
      memberId: m.id,
      status: "ABSENT",
      checkedInAt: meeting.meetingDate,
      notes: null,
    });
  }
}

// ─── Loans ─────────────────────────────────────────────────────────
const LOAN_DEFS: Array<{
  memberLast: string;
  amount: number;
  months: number;
  rate: number;
  monthsAgo: number;
  status: "PENDING" | "DISBURSED" | "PAID" | "REJECTED";
  purpose: string;
}> = [
  { memberLast: "Birungi",       amount: 3_000_000,  months: 2, rate: 0.10, monthsAgo: 5, status: "PAID",      purpose: "Business capital" },
  { memberLast: "Mbabazi",       amount: 4_000_000,  months: 6, rate: 0.10, monthsAgo: 5, status: "DISBURSED", purpose: "Home improvement" },
  { memberLast: "Niwagaba",      amount: 3_000_000,  months: 6, rate: 0.10, monthsAgo: 5, status: "DISBURSED", purpose: "School fees" },
  { memberLast: "Orikiriza",     amount: 1_500_000,  months: 5, rate: 0.10, monthsAgo: 5, status: "PAID",      purpose: "Medical" },
  { memberLast: "Byarugaba",     amount: 4_000_000,  months: 6, rate: 0.10, monthsAgo: 4, status: "DISBURSED", purpose: "Land purchase" },
  { memberLast: "Twinomujuni",   amount: 10_000_000, months: 4, rate: 0.10, monthsAgo: 4, status: "DISBURSED", purpose: "Business expansion" },
  { memberLast: "Mugisha",       amount: 27_000_000, months: 6, rate: 0.10, monthsAgo: 3, status: "DISBURSED", purpose: "Real estate" },
  { memberLast: "Akampurira",    amount: 2_500_000,  months: 4, rate: 0.10, monthsAgo: 0, status: "PENDING",   purpose: "Stock purchase" },
  { memberLast: "Mwesigwa",      amount: 5_000_000,  months: 6, rate: 0.10, monthsAgo: 0, status: "PENDING",   purpose: "Equipment" },
];

export const LOANS: Loan[] = [];
export const LOAN_INSTALLMENTS: LoanInstallment[] = [];

let loanSeq = 1;
for (const def of LOAN_DEFS) {
  const member = MEMBERS.find((m) => m.lastName === def.memberLast);
  if (!member) continue;
  const appliedAt = new Date(NOW.getFullYear(), NOW.getMonth() - def.monthsAgo, 5);
  const dueAt = new Date(appliedAt);
  dueAt.setMonth(dueAt.getMonth() + def.months);

  const totalPayable = Math.round(def.amount * (1 + def.rate));
  const installmentAmount = Math.round(totalPayable / def.months);
  const isPending = def.status === "PENDING";
  const amountRepaid =
    def.status === "PAID"
      ? totalPayable
      : def.status === "DISBURSED"
        ? installmentAmount * Math.max(0, def.monthsAgo - 1)
        : 0;

  const loan: Loan = {
    id: `l_${pad(loanSeq, 3)}`,
    loanNumber: `NBG-LN-${appliedAt.getFullYear()}-${pad(loanSeq++, 3)}`,
    memberId: member.id,
    principalAmount: def.amount,
    requestedAmount: def.amount,
    interestRate: def.rate,
    termMonths: def.months,
    purpose: def.purpose,
    guarantors: null,
    amountRepaid,
    status: def.status,
    appliedAt,
    approvedAt: isPending ? null : appliedAt,
    approvedById: isPending ? null : CHAIR.id,
    rejectedReason: null,
    disbursedAt: isPending ? null : appliedAt,
    dueAt: isPending ? null : dueAt,
    closedAt: def.status === "PAID" ? dueAt : null,
    notes: null,
  };
  LOANS.push(loan);

  if (!isPending) {
    for (let i = 1; i <= def.months; i++) {
      const due = new Date(appliedAt);
      due.setMonth(due.getMonth() + i);
      const paid =
        def.status === "PAID" || i <= Math.max(0, def.monthsAgo - 1);
      LOAN_INSTALLMENTS.push({
        id: `li_${pad(LOAN_INSTALLMENTS.length + 1, 4)}`,
        loanId: loan.id,
        dueDate: due,
        amount: installmentAmount,
        status: paid ? "PAID" : "PENDING",
        paidAmount: paid ? installmentAmount : 0,
        paidAt: paid ? due : null,
      });
    }
  }
}

// ─── Settings ──────────────────────────────────────────────────────
export const SETTINGS: Setting[] = [
  { key: "sacco.name", value: "NBOOG SACCO" },
  { key: "sacco.tagline", value: "Trust · Growth · Community" },
  { key: "sacco.address", value: "Mukono District, Uganda" },
  { key: "sacco.welfarePerMeeting", value: "30000" },
  { key: "sacco.minSavings", value: "50000" },
  { key: "sacco.fineLate", value: "10000" },
  { key: "sacco.meetingStartHour", value: "19" },
  { key: "sacco.gracePeriodMinutes", value: "15" },
  { key: "sacco.minMembershipMonths", value: "3" },
  { key: "sacco.maxLoanMultiplier", value: "2" },
  { key: "sacco.defaultLoanRate", value: "0.10" },
];

export const TODAY = NOW;
