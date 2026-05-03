import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 chars. Generate with: openssl rand -hex 64"),
  SESSION_COOKIE_NAME: z.string().default("nboog_session"),
  APP_NAME: z.string().default("NBOOG SACCO"),
  APP_URL: z.string().url().default("http://localhost:3000"),
});

type Env = z.infer<typeof envSchema>;

/**
 * During `next build` (NEXT_PHASE=phase-production-build) Vercel evaluates
 * every module to collect page data. Real runtime secrets are NOT available
 * at this point — they are injected only when the serverless function is
 * actually invoked. We therefore skip hard validation at build time and
 * validate eagerly only at runtime (dev server or live requests).
 */
const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.SKIP_ENV_VALIDATION === "1";

function getEnv(): Env {
  if (isBuildTime) {
    // Return a proxy so code that reads env at module-load level gets safe
    // placeholder values and doesn't crash during the build step.
    return new Proxy({} as Env, {
      get(_target, prop: string) {
        // Provide safe defaults for the handful of values touched at load time
        const defaults: Record<string, string> = {
          NODE_ENV: process.env.NODE_ENV ?? "production",
          SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "nboog_session",
          APP_NAME: process.env.APP_NAME ?? "NBOOG SACCO",
          APP_URL: process.env.APP_URL ?? "http://localhost:3000",
          // Placeholder secret — 32 chars minimum so any early encode() call
          // gets a valid buffer; replaced by the real value at request time.
          JWT_SECRET:
            process.env.JWT_SECRET ??
            "build-time-placeholder-secret-32chars!!",
          DATABASE_URL: process.env.DATABASE_URL ?? "",
        };
        return defaults[prop] ?? "";
      },
    });
  }

  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment configuration");
  }
  return parsed.data;
}

export const env = getEnv();
