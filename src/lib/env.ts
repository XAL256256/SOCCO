import { createHash } from "crypto";
import { z } from "zod";

/** Stable JWT key when JWT_SECRET is unset — tied to DATABASE_URL (Neon/Vercel friendly). */
function jwtSecretFromDbUrl(databaseUrl: string): string {
  return createHash("sha256")
    .update(`${databaseUrl}::nboog-jwt-v1`)
    .digest("hex");
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  /** Optional: set in Vercel for extra isolation. If omitted, derived from DATABASE_URL. */
  JWT_SECRET: z.string().optional(),
  SESSION_COOKIE_NAME: z.string().default("nboog_session"),
  APP_NAME: z.string().default("NBOOG SACCO"),
  APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema> & { JWT_SECRET: string };

/**
 * During `next build`, secrets are not injected — skip strict validation.
 */
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.SKIP_ENV_VALIDATION === "1";

function getEnv(): Env {
  if (isBuildTime) {
    return new Proxy({} as Env, {
      get(_target, prop: string) {
        const db = process.env.DATABASE_URL ?? "";
        const defaults: Record<string, string> = {
          NODE_ENV: process.env.NODE_ENV ?? "production",
          SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "nboog_session",
          APP_NAME: process.env.APP_NAME ?? "NBOOG SACCO",
          APP_URL: process.env.APP_URL ?? "http://localhost:3000",
          DATABASE_URL: db,
          JWT_SECRET:
            process.env.JWT_SECRET && process.env.JWT_SECRET.length >= 32
              ? process.env.JWT_SECRET
              : jwtSecretFromDbUrl(db || "build-placeholder-db-url"),
        };
        return defaults[prop] ?? "";
      },
    });
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment configuration");
  }
  const base = parsed.data;
  const JWT_SECRET =
    base.JWT_SECRET && base.JWT_SECRET.length >= 32
      ? base.JWT_SECRET
      : jwtSecretFromDbUrl(base.DATABASE_URL);

  return { ...base, JWT_SECRET };
}

export const env = getEnv();
