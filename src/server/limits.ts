import "server-only";
import { db } from "./db";
import { AppError } from "./http";
export async function rateLimit(key: string, max: number, windowMs = 60000) {
  const now = new Date();
  const expiry = new Date(now.getTime() + windowMs);
  const rows = await db.$queryRaw<
    { count: number }[]
  >`INSERT INTO "RequestLimit" ("key","count","expiresAt") VALUES (${key},1,${expiry}) ON CONFLICT ("key") DO UPDATE SET "count" = CASE WHEN "RequestLimit"."expiresAt" < ${now} THEN 1 ELSE "RequestLimit"."count" + 1 END, "expiresAt" = CASE WHEN "RequestLimit"."expiresAt" < ${now} THEN ${expiry} ELSE "RequestLimit"."expiresAt" END RETURNING "count"`;
  if (rows[0].count > max)
    throw new AppError(429, "Too many requests. Try again later.");
}
