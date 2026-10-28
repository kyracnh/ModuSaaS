import "server-only";
import { canManageProjects } from "@/modules/organizations/permissions";
import { db } from "@/server/db";
import { AppError } from "@/server/http";
import { appConfig } from "@/config/app";
import type { ProjectInput } from "./schema";
export async function projectScope(
  userId: string,
  organizationId?: string | null,
  write = false,
) {
  if (!organizationId) return { userId, organizationId: null };
  if (!appConfig.features.organizations)
    throw new AppError(404, "Organizations disabled");
  const member = await db.member.findUnique({
    where: { organizationId_userId: { organizationId, userId } },
  });
  if (!member) throw new AppError(403, "Workspace access denied");
  if (write && !canManageProjects(member.role))
    throw new AppError(403, "Admin permission required");
  return { organizationId };
}
export async function listProjects(
  userId: string,
  organizationId?: string | null,
  query?: URLSearchParams,
) {
  const scope = await projectScope(userId, organizationId);
  const page = Math.max(1, Math.min(10000, Number(query?.get("page")) || 1));
  const search = (query?.get("search") ?? "").slice(0, 100);
  const status = query?.get("status");
  const where = {
    ...scope,
    ...(search
      ? { name: { contains: search, mode: "insensitive" as const } }
      : {}),
    ...(["active", "paused", "completed"].includes(status ?? "")
      ? { status: status! }
      : {}),
  };
  const [items, total] = await db.$transaction([
    db.project.findMany({
      where,
      take: 20,
      skip: (page - 1) * 20,
      orderBy: {
        [query?.get("sort") === "name" ? "name" : "createdAt"]:
          query?.get("direction") === "asc" ? "asc" : "desc",
      },
    }),
    db.project.count({ where }),
  ]);
  return { items, total, page, pageSize: 20 };
}
export async function createProject(
  userId: string,
  input: ProjectInput,
  organizationId?: string | null,
) {
  await projectScope(userId, organizationId, true);
  return db.$transaction(async (tx) => {
    // Serialize entitlement checks per scope to prevent concurrent limit bypass.
    const key = organizationId ?? userId;
    await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))`;
    const sub = await tx.subscription.findUnique({ where: { userId } });
    const plan =
      !organizationId &&
      sub &&
      ["active", "trialing"].includes(sub.status) &&
      sub.plan === "pro"
        ? "pro"
        : "free";
    const count = await tx.project.count({
      where: organizationId
        ? { organizationId }
        : { userId, organizationId: null },
    });
    if (count >= appConfig.plans[plan].projectLimit)
      throw new AppError(403, "Project limit reached for this plan");
    const p = await tx.project.create({
      data: { ...input, userId, organizationId },
    });
    if (appConfig.features.notifications)
      await tx.notification.create({
        data: { userId, title: `Project “${p.name}” created` },
      });
    return p;
  });
}
export async function changeProject(
  userId: string,
  id: string,
  input: ProjectInput | undefined,
  organizationId?: string | null,
) {
  const where = { id, ...(await projectScope(userId, organizationId, true)) };
  if (input) {
    const result = await db.project.updateMany({ where, data: input });
    if (!result.count) throw new AppError(404, "Project not found");
  } else {
    const result = await db.project.deleteMany({ where });
    if (!result.count) throw new AppError(404, "Project not found");
  }
}
