import { z } from "zod";
export const envSchema = z.object({
  DATABASE_URL: z
    .url()
    .refine(
      (v) => v.startsWith("postgresql://") || v.startsWith("postgres://"),
      "Use a PostgreSQL URL",
    ),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.url(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().default("ModuSaaS <noreply@example.com>"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRICE_MONTHLY: z.string().optional(),
  STRIPE_PRICE_YEARLY: z.string().optional(),
  AI_PROVIDER: z.enum(["openai", "anthropic", "google"]).default("openai"),
  AI_MODEL: z.string().default("gpt-4.1-mini"),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  AI_INPUT_COST_PER_MILLION: z.coerce.number().nonnegative().default(0),
  AI_OUTPUT_COST_PER_MILLION: z.coerce.number().nonnegative().default(0),
  STORAGE_PROVIDER: z.enum(["local", "s3"]).default("local"),
  STORAGE_PATH: z.string().default(".data/uploads"),
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().default("us-east-1"),
  S3_ENDPOINT: z.url().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
});
export function getEnv() {
  const r = envSchema.safeParse(process.env);
  if (!r.success)
    throw new Error(
      "Invalid environment: " +
        r.error.issues
          .map((i) => i.path.join(".") + ": " + i.message)
          .join("; "),
    );
  if (
    process.env.NODE_ENV === "production" &&
    !r.data.BETTER_AUTH_URL.startsWith("https://") &&
    process.env.ALLOW_HTTP_LOCAL_TEST !== "1"
  )
    throw new Error("Production BETTER_AUTH_URL must use HTTPS");
  return r.data;
}
