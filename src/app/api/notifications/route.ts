import { apiUser, body, feature, route } from "@/server/http";
import { db } from "@/server/db";
import { z } from "zod";
export const GET = route(async () => {
  feature("notifications");
  const s = await apiUser();
  return Response.json(
    await db.notification.findMany({
      where: { userId: s.user.id },
      take: 50,
      orderBy: { createdAt: "desc" },
    }),
  );
});
export const PATCH = route(async (req) => {
  feature("notifications");
  const s = await apiUser();
  const { id } = await body(req, z.object({ id: z.string() }));
  await db.notification.updateMany({
    where: { id, userId: s.user.id },
    data: { readAt: new Date() },
  });
  return Response.json({ ok: true });
}, true);
