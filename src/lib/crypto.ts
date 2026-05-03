import bcrypt from "bcryptjs";
import { createHash, randomBytes, timingSafeEqual } from "crypto";

// bcrypt cost: 12 is the modern baseline (~250ms on commodity hardware).
const BCRYPT_COST = 12;

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 8) {
    throw new Error("Password must be at least 8 characters");
  }
  return bcrypt.hash(plain, BCRYPT_COST);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function generateToken(byteLength = 32): string {
  return randomBytes(byteLength).toString("hex");
}

/** Constant-time string comparison to mitigate timing attacks. */
export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * Compute a tamper-evidence hash for a receipt. Any change to amounts or
 * member identifiers will yield a different hash, allowing us to detect
 * mutations of the immutable financial record.
 */
export function receiptIntegrityHash(
  parts: Record<string, string | number | boolean | Date | null | undefined>
): string {
  const sorted = Object.keys(parts)
    .sort()
    .map((k) => {
      const v = parts[k];
      const safe =
        v === null || v === undefined
          ? ""
          : v instanceof Date
          ? v.toISOString()
          : String(v);
      return `${k}=${safe}`;
    })
    .join("|");
  return sha256(sorted);
}

/** Strong password policy used at registration time and password resets. */
export function validatePasswordStrength(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 10) errors.push("At least 10 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least one digit");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("At least one symbol");
  return errors;
}
