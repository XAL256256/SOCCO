import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  SESSION_COOKIE_NAME: z.string().default("nboog_session"),
  APP_NAME: z.string().default("NBOOG SACCO"),
  APP_URL: z.string().default("http://localhost:3000"),
});

export type Env = z.infer<typeof envSchema>;

const isBuildTime =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.env.SKIP_ENV_VALIDATION === "1";

function getEnv(): Env {
  if (isBuildTime) {
    return new Proxy({} as Env, {
      get(_target, prop: string) {
        const defaults: Record<string, string> = {
          NODE_ENV: process.env.NODE_ENV ?? "production",
          SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME ?? "nboog_session",
          APP_NAME: process.env.APP_NAME ?? "NBOOG SACCO",
          APP_URL: process.env.APP_URL ?? "http://localhost:3000",
          DATABASE_URL: process.env.DATABASE_URL ?? "",
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
  return parsed.data;
}

export const env = getEnv();
