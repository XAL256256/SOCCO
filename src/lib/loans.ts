import { CONTRIBUTIONS, LOANS, MEMBERS, TODAY } from "./mock/data";

export type EligibilityResult = {
  ok: boolean;
  maxAllowed: number;
  currentSavings: number;
  monthsActive: number;
  hasActiveLoan: boolean;
  reasons: string[];
};

export async function checkLoanEligibility(
  memberId: string,
  requestedAmount: number,
  options?: { minMembershipMonths?: number; maxLoanMultiplier?: number }
): Promise<EligibilityResult> {
  const minMembershipMonths = options?.minMembershipMonths ?? 3;
  const maxMultiplier = options?.maxLoanMultiplier ?? 2;

  const member = MEMBERS.find((m) => m.id === memberId);
  const reasons: string[] = [];
  if (!member) {
    return {
      ok: false,
      maxAllowed: 0,
      currentSavings: 0,
      monthsActive: 0,
      hasActiveLoan: false,
      reasons: ["Member not found"],
    };
  }

  const currentSavings = CONTRIBUTIONS.filter((c) => c.memberId === memberId).reduce(
    (a, c) => a + c.savingsAmount,
    0
  );
  const monthsActive = Math.max(
    1,
    Math.floor((TODAY.getTime() - member.joinedAt.getTime()) / (1000 * 60 * 60 * 24 * 30)) + 1
  );

  const maxAllowed = currentSavings * maxMultiplier;
  const hasActiveLoan = LOANS.some(
    (l) =>
      l.memberId === memberId &&
      (l.status === "DISBURSED" || l.status === "ACTIVE" || l.status === "APPROVED")
  );

  if (member.status !== "ACTIVE") {
    reasons.push(`Member status is ${member.status}; only ACTIVE members can borrow.`);
  }
  if (monthsActive < minMembershipMonths) {
    reasons.push(
      `Member has been active for ${monthsActive} month${monthsActive === 1 ? "" : "s"}, minimum is ${minMembershipMonths}.`
    );
  }
  if (hasActiveLoan) {
    reasons.push("Existing active loan detected. Repay before applying for a new one.");
  }
  if (requestedAmount > maxAllowed) {
    reasons.push(
      `Requested amount exceeds ${maxMultiplier}× current savings (max allowed: ${maxAllowed.toLocaleString()}).`
    );
  }
  if (requestedAmount <= 0) reasons.push("Requested amount must be greater than zero.");

  return {
    ok: reasons.length === 0,
    maxAllowed,
    currentSavings,
    monthsActive,
    hasActiveLoan,
    reasons,
  };
}

export function computeRepaymentSchedule(
  principal: number,
  rate: number,
  termMonths: number,
  startDate: Date
): { dueDate: Date; amount: number }[] {
  const total = Math.round(principal * (1 + rate));
  const installment = Math.round(total / termMonths);

  const schedule: { dueDate: Date; amount: number }[] = [];
  let allocated = 0;
  for (let i = 1; i <= termMonths; i++) {
    const due = new Date(startDate);
    due.setMonth(due.getMonth() + i);
    const amount = i === termMonths ? total - allocated : installment;
    schedule.push({ dueDate: due, amount });
    allocated += amount;
  }
  return schedule;
}
