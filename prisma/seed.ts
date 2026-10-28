import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
await db.$queryRaw`SELECT 1`;
console.log(
  "Database ready. No default accounts or passwords are seeded. Register through the application.",
);
await db.$disconnect();
