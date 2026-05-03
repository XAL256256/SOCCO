/**
 * On Vercel builds only: if the DB has zero staff users, insert demo identities +
 * SACCO settings. Idempotent — never wipes existing data.
 *
 * Disable with AUTO_BOOTSTRAP=0
 *
 * Requires DB URL + successful prisma db push (same URLs as prisma-push-if-enabled).
 */
const raw =
  process.env.DATABASE_URL?.trim() ||
  process.env.POSTGRES_PRISMA_URL?.trim() ||
  process.env.POSTGRES_URL?.trim();

if (process.env.VERCEL !== "1") {
  console.log("[bootstrap] Local dev — skipped (run npm run db:seed for full demo)");
  process.exit(0);
}

if (process.env.AUTO_BOOTSTRAP === "0") {
  console.log("[bootstrap] AUTO_BOOTSTRAP=0 — skipped");
  process.exit(0);
}

if (!raw) {
  console.warn("[bootstrap] No Postgres URL — skipped (link Storage → Postgres then redeploy)");
  process.exit(0);
}

process.env.DATABASE_URL = raw;

async function main() {
  const { PrismaClient } = await import("@prisma/client");
  const bcrypt = (await import("bcryptjs")).default;

  const prisma = new PrismaClient();

  try {
    const count = await prisma.user.count();
    if (count > 0) {
      console.log("[bootstrap] Staff users already exist — skipped");
      return;
    }

    const hash = await bcrypt.hash("socco", 12);

    await prisma.user.createMany({
      data: [
        {
          username: "admin",
          email: "admin@nboog.org",
          fullName: "System Administrator",
          passwordHash: hash,
          role: "ADMIN",
          phoneNumber: "+256700000001",
        },
        {
          username: "treasurer",
          email: "treasurer@nboog.org",
          fullName: "Joel Twinamatsiko",
          passwordHash: hash,
          role: "TREASURER",
          phoneNumber: "+256700000002",
        },
        {
          username: "secretary",
          email: "secretary@nboog.org",
          fullName: "Sarah Namugga",
          passwordHash: hash,
          role: "SECRETARY",
          phoneNumber: "+256700000003",
        },
        {
          username: "chair",
          email: "chair@nboog.org",
          fullName: "Wilson Byarugaba",
          passwordHash: hash,
          role: "CHAIRPERSON",
          phoneNumber: "+256700000004",
        },
        {
          username: "auditor",
          email: "auditor@nboog.org",
          fullName: "Robert Tugumisirize",
          passwordHash: hash,
          role: "AUDITOR",
          phoneNumber: "+256700000005",
        },
      ],
      skipDuplicates: true,
    });

    await prisma.setting.createMany({
      data: [
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
      ],
      skipDuplicates: true,
    });

    console.log("[bootstrap] ✓ Demo staff + settings created (empty DB only)");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error("[bootstrap] failed:", e);
  process.exit(1);
});
