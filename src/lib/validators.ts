import { z } from "zod";

const phoneRegex = /^(?:\+256|0)\d{9}$/;
const ugxAmount = z.coerce.number().int().min(0).max(1_000_000_000);

export const loginSchema = z.object({
  identifier: z.string().min(3, "Username or email required").max(100),
  password: z.string().min(1, "Password required").max(128),
});

export const memberSchema = z.object({
  firstName: z.string().min(1).max(60).trim(),
  lastName: z.string().min(1).max(60).trim(),
  phoneNumber: z
    .string()
    .trim()
    .regex(phoneRegex, "Use Ugandan format (+256… or 0…)"),
  nationalId: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(120).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .optional()
    .refine((v) => !v || !Number.isNaN(Date.parse(v)), "Invalid date"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  occupation: z.string().max(80).optional().or(z.literal("")),
  address: z.string().max(200).optional().or(z.literal("")),
  nextOfKin: z.string().max(100).optional().or(z.literal("")),
  nextOfKinPhone: z.string().max(20).optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type MemberInput = z.infer<typeof memberSchema>;

export const meetingSchema = z.object({
  title: z.string().min(2).max(120).trim(),
  meetingDate: z.string().refine((v) => !Number.isNaN(Date.parse(v)), "Invalid date"),
  location: z.string().max(120).optional().or(z.literal("")),
  agenda: z.string().max(2000).optional().or(z.literal("")),
});

export const contributionSchema = z
  .object({
    memberId: z.string().min(1),
    meetingId: z.string().optional().or(z.literal("")),
    welfareAmount: ugxAmount.default(0),
    savingsAmount: ugxAmount.default(0),
    loanRepayment: ugxAmount.default(0),
    fineAmount: ugxAmount.default(0),
    shareAmount: ugxAmount.default(0),
    registrationFee: ugxAmount.default(0),
    otherAmount: ugxAmount.default(0),
    otherDescription: z.string().max(120).optional().or(z.literal("")),
    paymentMethod: z
      .enum(["CASH", "MOBILE_MONEY", "BANK_TRANSFER", "CHEQUE"])
      .default("CASH"),
    reference: z.string().max(60).optional().or(z.literal("")),
    notes: z.string().max(500).optional().or(z.literal("")),
  })
  .refine(
    (v) =>
      v.welfareAmount +
        v.savingsAmount +
        v.loanRepayment +
        v.fineAmount +
        v.shareAmount +
        v.registrationFee +
        v.otherAmount >
      0,
    { message: "Total contribution must be greater than zero", path: ["welfareAmount"] }
  );

export type ContributionInput = z.infer<typeof contributionSchema>;

export const attendanceSchema = z.object({
  meetingId: z.string().min(1),
  memberId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).default("PRESENT"),
  notes: z.string().max(200).optional().or(z.literal("")),
});

export const userCreateSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(40)
    .regex(/^[a-z0-9_.-]+$/, "Lowercase letters, numbers, _ . - only"),
  email: z.string().email().max(120),
  fullName: z.string().min(2).max(80),
  password: z.string().min(10).max(128),
  role: z.enum(["ADMIN", "CHAIRPERSON", "TREASURER", "SECRETARY", "AUDITOR"]),
  phoneNumber: z.string().regex(phoneRegex).optional().or(z.literal("")),
});
