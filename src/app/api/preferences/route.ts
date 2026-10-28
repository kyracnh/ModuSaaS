import { apiUser, body, route } from "@/server/http";
import { preferencesSchema } from "@/modules/settings/schema";
import { db } from "@/server/db";
export const GET = route(async () => {
  const s = await apiUser();
  return Response.json(
    (await db.preference.findUnique({ where: { userId: s.user.id } })) ?? {
      emailUpdates: false,
      productAnnouncements: false,
    },
  );
});
export const PUT = route(async (req) => {
  const s = await apiUser();
  const values = await body(req, preferencesSchema);
  return Response.json(
    await db.preference.upsert({
      where: { userId: s.user.id },
      create: { userId: s.user.id, ...values },
      update: values,
    }),
  );
}, true);
