import {
  PrismaClient,
  Role,
  AttendanceStatus,
  PaymentMethod,
  LoanStatus,
  InstallmentStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";

const prisma = new PrismaClient();

// Real NBOOG roster (from March 2026 collection report)
const ROSTER = [
  ["Sande Gregory", "Bakunda", "+256701000001", "MALE"],
  ["Deogracious", "Bamwebaze", "+256701000002", "MALE"],
  ["Jolly", "Bamwebaze", "+256701000003", "FEMALE"],
  ["Justus", "Barageine", "+256701000004", "MALE"],
  ["Anke", "Barahukwa", "+256701000005", "FEMALE"],
  ["Nickson", "Barahukwa", "+256701000006", "MALE"],
  ["Billy", "Birungi", "+256701000007", "MALE"],
  ["Brendah", "Birungi", "+256701000008", "FEMALE"],
  ["Angellah", "Byarugaba", "+256701000009", "FEMALE"],
  ["Elizabeth", "Byarugaba", "+256701000010", "FEMALE"],
  ["Emily", "Byarugaba", "+256701000011", "FEMALE"],
  ["Kelvin", "Byarugaba", "+256701000012", "MALE"],
  ["Wilson", "Byarugaba", "+256701000013", "MALE"],
  ["Micky Rujumba", "Emanzi", "+256701000014", "MALE"],
  ["Joan Prose", "Kabayambi", "+256701000015", "FEMALE"],
  ["Annet", "Katushabe", "+256701000016", "FEMALE"],
  ["Julius", "Katusiime", "+256701000017", "MALE"],
  ["Innocent", "Kembabazi", "+256701000018", "FEMALE"],
  ["Fiona", "Kente", "+256701000019", "FEMALE"],
  ["Deborah", "Kiconco", "+256701000020", "FEMALE"],
  ["Hannington", "Kiconco", "+256701000021", "MALE"],
  ["Sincere", "Kyarikunda", "+256701000022", "FEMALE"],
  ["Grace Flavia", "Lamuno-Birungi", "+256701000023", "FEMALE"],
  ["Martin", "Mbabazi", "+256701000024", "MALE"],
  ["Ambrose", "Mugisha", "+256701000025", "MALE"],
  ["Juliet", "Mugisha", "+256701000026", "FEMALE"],
  ["Sylivia", "Muheirwe", "+256701000027", "FEMALE"],
  ["Ian", "Muhumuza", "+256701000028", "MALE"],
  ["Gloria", "Ninsiima", "+256701000029", "FEMALE"],
  ["Amos", "Niwagaba", "+256701000030", "MALE"],
  ["Medius", "Niwagaba", "+256701000031", "FEMALE"],
  ["Norman", "Niwagaba", "+256701000032", "MALE"],
  ["Peace", "Nsimenta", "+256701000033", "FEMALE"],
  ["Kedress", "Orikiriza", "+256701000034", "FEMALE"],
  ["Lillian", "Taarushookye", "+256701000035", "FEMALE"],
  ["Robert", "Tugumisirize", "+256701000036", "MALE"],
  ["Gertrude", "Tukahirwa", "+256701000037", "FEMALE"],
  ["Oliver", "Tumanye", "+256701000038", "MALE"],
  ["Rosette Barageine", "Tumushabe", "+256701000039", "FEMALE"],
  ["Joel", "Twinamatsiko", "+256701000040", "MALE"],
  ["Grace", "Twinomuhwezi", "+256701000041", "FEMALE"],
  ["Henry", "Twinomuhwezi", "+256701000042", "MALE"],
  ["Kafunjo", "Twinomujuni", "+256701000043", "MALE"],
] as const;

/** Synthetic demo members (+42 → satisfies “≥40 mock entries”) beyond the real roster. */
function syntheticMockRoster(count: number) {
  const firstNames = [
    "Patricia", "Simon", "Bruno", "Caroline", "Denis", "Eva", "Frank", "Gloria",
    "Hassan", "Irene", "James", "Kate",
  ];
  const out: [string, string, string, "MALE" | "FEMALE"][] = [];
  for (let i = 0; i < count; i++) {
    const seq = ROSTER.length + i + 1;
    const fn = firstNames[i % firstNames.length]!;
    const ln = `Mockfield-${String(seq).padStart(2, "0")}`;
    const phone = `+256702${String(180000 + seq).padStart(6, "0")}`;
    const gender: "MALE" | "FEMALE" = i % 2 === 0 ? "MALE" : "FEMALE";
    out.push([fn, ln, phone, gender]);
  }
  return out;
}

const MOCK_EXTRA_COUNT = 42;
const MOCK_EXTRA_ROSTER = syntheticMockRoster(MOCK_EXTRA_COUNT);
const FULL_ROSTER = [...ROSTER, ...MOCK_EXTRA_ROSTER];

// Realistic March 2026 collections (from the actual report) - slice subset
const MARCH_COLLECTIONS: Record<string, { repay?: number; sav?: number; wel?: number; ch?: number; fee?: number }> = {
  "Bakunda": { repay: 100_000, sav: 210_000, wel: 1_090_000 },
  "Deogracious": { sav: 1_000_000, wel: 30_000 },
  "Jolly": { sav: 200_000, wel: 30_000 },
  "Justus": { sav: 10_000_000, wel: 30_000 },
  "Anke": { sav: 150_000, wel: 30_000 },
  "Nickson": { sav: 100_000, wel: 30_000 },
  "Billy": { sav: 1_000_000, wel: 30_000 },
  "Angellah": { sav: 1_750_000, wel: 30_000 },
  "Elizabeth": { repay: 746_667, sav: 1_023_333, wel: 30_000 },
  "Annet": { sav: 560_000, wel: 30_000 },
  "Julius": { sav: 100_000, wel: 655_000 },
  "Innocent": { sav: 2_120_000, wel: 30_000 },
  "Fiona": { sav: 100_000, wel: 1_396_550, ch: 3_450 },
  "Deborah": { sav: 3_470_000, wel: 1_530_000 },
  "Hannington": { sav: 50_000, wel: 150_000 },
  "Sincere": { sav: 68_850, wel: 30_000, ch: 1_150 },
  "Lamuno-Birungi": { sav: 1_000_000, wel: 30_000 },
  "Martin": { sav: 50_000, wel: 30_000 },
  "Ambrose": { sav: 15_156_550, wel: 30_000, ch: 3_450, fee: 10_000 },
  "Juliet": { sav: 4_986_550, wel: 2_030_000, ch: 3_450, fee: 10_000 },
  "Sylivia": { sav: 970_000, wel: 30_000 },
  "Ian": { sav: 50_000, wel: 30_000 },
  "Gloria": { sav: 220_000, wel: 30_000 },
  "Amos": { sav: 50_000, wel: 50_000 },
  "Medius": { sav: 270_000, wel: 30_000 },
  "Norman": { repay: 920_000, sav: 50_000, wel: 30_000 },
  "Peace": { sav: 97_700, wel: 200_000, ch: 2_300 },
  "Kedress": { sav: 50_000, wel: 30_000 },
  "Lillian": { sav: 96_550, wel: 530_000, ch: 3_450 },
  "Robert": { sav: 267_700, wel: 30_000, ch: 2_300 },
  "Oliver": { sav: 96_550, wel: 2_090_000, ch: 3_450 },
  "Rosette": { sav: 1_466_550, wel: 30_000, ch: 3_450 },
  "Joel": { sav: 100_000, wel: 1_896_550, ch: 3_450 },
  "Grace": { sav: 97_700, wel: 330_000, ch: 2_300 },
  "Henry": { sav: 107_700, wel: 530_000, ch: 2_300 },
  "Kafunjo": { sav: 1_003_450, wel: 30_000 },
  "Brendah": { sav: 3_120_000, wel: 0 },
};

function findKey(member: { firstName: string; lastName: string }): string | null {
  const keys = Object.keys(MARCH_COLLECTIONS);
  for (const k of keys) {
    if (member.lastName.includes(k) || member.firstName.includes(k)) return k;
  }
  return null;
}

function receiptHash(parts: Record<string, string | number>): string {
  const s = Object.keys(parts).sort().map((k) => `${k}=${parts[k]}`).join("|");
  return createHash("sha256").update(s).digest("hex");
}

function pad(n: number, w = 3) {
  return String(n).padStart(w, "0");
}
function receiptNumberFor(d: Date, seq: number) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `RCT-${y}${m}${day}-${pad(seq)}`;
}

async function main() {
  console.log(
    `🌱 Seeding NBOOG SACCO database (${ROSTER.length} roster + ${MOCK_EXTRA_COUNT} synthetic demo members = ${FULL_ROSTER.length} total)...`
  );

  await prisma.$transaction([
    prisma.loanInstallment.deleteMany(),
    prisma.fine.deleteMany(),
    prisma.attendance.deleteMany(),
    prisma.receiptVersion.deleteMany(),
    prisma.receipt.deleteMany(),
    prisma.contribution.deleteMany(),
    prisma.loan.deleteMany(),
    prisma.meeting.deleteMany(),
    prisma.member.deleteMany(),
    prisma.session.deleteMany(),
    prisma.auditLog.deleteMany(),
    prisma.user.deleteMany(),
    prisma.setting.deleteMany(),
  ]);

  // One password for all demo staff — change after go-live
  const defaultPassword = "socco";
  const hash = await bcrypt.hash(defaultPassword, 12);

  const users = await prisma.user.createManyAndReturn({
    data: [
      { username: "admin", email: "admin@nboog.org", fullName: "System Administrator", passwordHash: hash, role: Role.ADMIN, phoneNumber: "+256700000001" },
      { username: "treasurer", email: "treasurer@nboog.org", fullName: "Joel Twinamatsiko", passwordHash: hash, role: Role.TREASURER, phoneNumber: "+256700000002" },
      { username: "secretary", email: "secretary@nboog.org", fullName: "Sarah Namugga", passwordHash: hash, role: Role.SECRETARY, phoneNumber: "+256700000003" },
      { username: "chair", email: "chair@nboog.org", fullName: "Wilson Byarugaba", passwordHash: hash, role: Role.CHAIRPERSON, phoneNumber: "+256700000004" },
      { username: "auditor", email: "auditor@nboog.org", fullName: "Robert Tugumisirize", passwordHash: hash, role: Role.AUDITOR, phoneNumber: "+256700000005" },
    ],
  });
  const treasurer = users.find((u) => u.role === Role.TREASURER)!;
  const chair = users.find((u) => u.role === Role.CHAIRPERSON)!;

  console.log(`✓ ${users.length} staff users created`);

  // Members
  const today = new Date();
  const joinDate = new Date(today.getFullYear() - 1, 0, 4);
  const members = await prisma.member.createManyAndReturn({
    data: FULL_ROSTER.map(([first, last, phone, gender], i) => ({
      memberNumber: `NBG-${pad(i + 1, 4)}`,
      firstName: first,
      lastName: last,
      phoneNumber: phone,
      email: `${first.toLowerCase().replace(/\s+/g, ".")}.${last.toLowerCase().replace(/\s+/g, ".")}@nboog.org`,
      gender: gender as "MALE" | "FEMALE",
      occupation: ["Farmer", "Teacher", "Trader", "Accountant", "Doctor", "Engineer", "Tailor", "Driver"][i % 8],
      address: "Mukono District, Uganda",
      status: "ACTIVE",
      joinedAt: joinDate,
    })),
  });
  console.log(`✓ ${members.length} members created`);

  // Meetings (Jan, Feb, Mar of current year)
  const meetingsData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1, 19, 0); // 7:00 PM first of each month
    if (d > now) continue;
    meetingsData.push({
      title: `${d.toLocaleString("en-UG", { month: "long" })} Monthly Meeting`,
      meetingDate: d,
      location: "NBOOG Hall, Mukono",
      agenda: "Welfare contributions, savings deposits, loan applications, member updates.",
      status: "COMPLETED" as const,
      createdById: treasurer.id,
    });
  }
  const meetings = await prisma.meeting.createManyAndReturn({ data: meetingsData });
  console.log(`✓ ${meetings.length} meetings created`);

  let receiptSeq = 1;
  let contribCount = 0;

  // For each meeting, simulate attendance + contributions for ~80% of members
  for (const meeting of meetings) {
    const isLatestMonth = meeting === meetings[meetings.length - 1];
    const lateCutoff = new Date(meeting.meetingDate);
    lateCutoff.setMinutes(lateCutoff.getMinutes() + 15); // Late after 7:15 PM

    // Random attendance order
    const attendees = [...members]
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(members.length * 0.85));

    for (const m of attendees) {
      // 12% chance of being late
      const isLate = Math.random() < 0.12;
      const checkInTime = new Date(meeting.meetingDate);
      if (isLate) {
        checkInTime.setMinutes(
          checkInTime.getMinutes() + 15 + Math.floor(Math.random() * 30)
        );
      } else {
        checkInTime.setMinutes(checkInTime.getMinutes() - Math.floor(Math.random() * 10));
      }

      const status: AttendanceStatus = isLate ? "LATE" : "PRESENT";

      const attendance = await prisma.attendance.create({
        data: {
          meetingId: meeting.id,
          memberId: m.id,
          status,
          checkedInAt: checkInTime,
        },
      });

      // Auto-fine for lateness
      if (isLate) {
        await prisma.fine.create({
          data: {
            memberId: m.id,
            reason: "LATENESS",
            amount: 10_000,
            description: `Late by ${Math.round(
              (checkInTime.getTime() - lateCutoff.getTime()) / 60_000
            )} minutes for ${meeting.title}`,
            attendanceId: attendance.id,
          },
        });
      }

      // Contribution amounts
      let welfare = 30_000; // Default per proposal
      let savings = 0;
      let loanRepay = 0;
      let charges = 0;
      let fees = 0;

      if (isLatestMonth) {
        const real = MARCH_COLLECTIONS[findKey(m) ?? "__nope__"] ?? null;
        if (real) {
          welfare = real.wel ?? 30_000;
          savings = real.sav ?? 0;
          loanRepay = real.repay ?? 0;
          charges = real.ch ?? 0;
          fees = real.fee ?? 0;
        } else {
          savings = 50_000 + Math.floor(Math.random() * 5) * 50_000;
        }
      } else {
        savings = 50_000 + Math.floor(Math.random() * 8) * 50_000;
        if (Math.random() > 0.85) loanRepay = 200_000 + Math.floor(Math.random() * 3) * 200_000;
      }

      const total = welfare + savings + loanRepay + charges + fees;
      if (total === 0) continue;

      const contribution = await prisma.contribution.create({
        data: {
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
          paymentMethod: "CASH" as PaymentMethod,
          loggedById: treasurer.id,
          createdAt: checkInTime,
        },
      });

      const number = receiptNumberFor(meeting.meetingDate, receiptSeq++);
      const ih = receiptHash({
        receiptNumber: number,
        memberNumber: m.memberNumber,
        total,
        welfare,
        savings,
        loanRepay,
      });
      await prisma.receipt.create({
        data: {
          receiptNumber: number,
          contributionId: contribution.id,
          memberId: m.id,
          totalAmount: total,
          issuedById: treasurer.id,
          issuedAt: checkInTime,
          integrityHash: ih,
        },
      });
      contribCount++;
    }

    // Mark non-attendees as absent
    const presentIds = new Set(attendees.map((a) => a.id));
    for (const m of members) {
      if (presentIds.has(m.id)) continue;
      await prisma.attendance.create({
        data: {
          meetingId: meeting.id,
          memberId: m.id,
          status: "ABSENT",
          checkedInAt: meeting.meetingDate,
        },
      });
    }
  }

  console.log(`✓ ${contribCount} contributions + receipts logged`);

  // Loans (matching the Excel report)
  const loanData: { memberLast: string; amount: number; months: number; rate: number; createdMonthsAgo: number }[] = [
    { memberLast: "Birungi", amount: 3_000_000, months: 2, rate: 0.10, createdMonthsAgo: 5 }, // Brendah Birungi - Jan
    { memberLast: "Mbabazi", amount: 4_000_000, months: 6, rate: 0.10, createdMonthsAgo: 5 },
    { memberLast: "Niwagaba", amount: 3_000_000, months: 6, rate: 0.10, createdMonthsAgo: 5 }, // Norman
    { memberLast: "Orikiriza", amount: 1_500_000, months: 5, rate: 0.10, createdMonthsAgo: 5 },
    { memberLast: "Byarugaba", amount: 4_000_000, months: 6, rate: 0.10, createdMonthsAgo: 4 }, // Elizabeth
    { memberLast: "Twinomujuni", amount: 10_000_000, months: 4, rate: 0.10, createdMonthsAgo: 4 },
    { memberLast: "Mugisha", amount: 27_000_000, months: 6, rate: 0.10, createdMonthsAgo: 3 }, // Ambrose
    { memberLast: "Mugisha", amount: 13_000_000, months: 6, rate: 0.10, createdMonthsAgo: 3 }, // Juliet
  ];

  let loanSeq = 1;
  for (const l of loanData) {
    const member = members.find((m) => m.lastName === l.memberLast);
    if (!member) continue;
    const appliedAt = new Date(now.getFullYear(), now.getMonth() - l.createdMonthsAgo, 5);
    const dueAt = new Date(appliedAt);
    dueAt.setMonth(dueAt.getMonth() + l.months);

    const totalPayable = Math.round(l.amount * (1 + l.rate));
    const installmentAmount = Math.round(totalPayable / l.months);

    const loan = await prisma.loan.create({
      data: {
        loanNumber: `NBG-LN-${appliedAt.getFullYear()}-${pad(loanSeq++, 3)}`,
        memberId: member.id,
        principalAmount: l.amount,
        requestedAmount: l.amount,
        interestRate: l.rate,
        termMonths: l.months,
        purpose: ["Home improvement", "Business capital", "School fees", "Medical", "Land purchase"][loanSeq % 5],
        appliedAt,
        approvedAt: appliedAt,
        approvedById: chair.id,
        disbursedAt: appliedAt,
        dueAt,
        status: LoanStatus.DISBURSED,
      },
    });

    // Schedule
    for (let i = 1; i <= l.months; i++) {
      const due = new Date(appliedAt);
      due.setMonth(due.getMonth() + i);
      await prisma.loanInstallment.create({
        data: {
          loanId: loan.id,
          dueDate: due,
          amount: installmentAmount,
          status: i <= l.createdMonthsAgo - 1 ? InstallmentStatus.PAID : InstallmentStatus.PENDING,
          paidAmount: i <= l.createdMonthsAgo - 1 ? installmentAmount : 0,
          paidAt: i <= l.createdMonthsAgo - 1 ? due : null,
        },
      });
    }
  }

  console.log(`✓ ${loanData.length} loans created with repayment schedules`);

  // Settings - matching proposal defaults
  await prisma.setting.createMany({
    data: [
      { key: "sacco.name", value: "NBOOG SACCO" },
      { key: "sacco.tagline", value: "Trust · Growth · Community" },
      { key: "sacco.address", value: "Mukono District, Uganda" },
      { key: "sacco.welfarePerMeeting", value: "30000" }, // UGX 30,000 per proposal
      { key: "sacco.minSavings", value: "50000" }, // UGX 50,000 per proposal
      { key: "sacco.fineLate", value: "10000" }, // UGX 10,000 per proposal
      { key: "sacco.meetingStartHour", value: "19" }, // 7:00 PM
      { key: "sacco.gracePeriodMinutes", value: "15" },
      { key: "sacco.minMembershipMonths", value: "3" },
      { key: "sacco.maxLoanMultiplier", value: "2" }, // Max loan = 2× savings
      { key: "sacco.defaultLoanRate", value: "0.10" }, // 10%
    ],
  });

  console.log("\n✨ Seed complete!\n");
  console.log("─────────────────────────────────────────────────────");
  console.log("  Login with any of these accounts:");
  console.log("  • admin       (Admin — full access)");
  console.log("  • treasurer   (Treasurer — log contributions)");
  console.log("  • secretary   (Secretary — meetings/attendance)");
  console.log("  • chair       (Chairperson — approvals)");
  console.log("  • auditor     (Auditor — read-only audit)");
  console.log(`  Password (all): ${defaultPassword}`);
  console.log("─────────────────────────────────────────────────────");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
