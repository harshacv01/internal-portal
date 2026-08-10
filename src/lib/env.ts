import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url("DATABASE_URL must be a valid connection string"),
  SESSION_SECRET: z
    .string()
    .min(32, "SESSION_SECRET must be at least 32 characters"),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/**
 * Resolved on first access rather than at import.
 *
 * `next build` imports every route handler to collect page data, so validating
 * eagerly would make the build itself require production credentials — even
 * though nothing at build time opens a connection. Deferring keeps the build
 * credential-free while still failing the first real request loudly.
 */
function loadEnv(): Env {
  if (cached) return cached;

  const parsed = envSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
  });

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `  - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");

    throw new Error(
      `Invalid environment variables:\n${details}\n\nSee .env.example for the expected values.`,
    );
  }

  cached = parsed.data;
  return cached;
}

export const env = {
  get DATABASE_URL() {
    return loadEnv().DATABASE_URL;
  },
  get SESSION_SECRET() {
    return loadEnv().SESSION_SECRET;
  },
};
