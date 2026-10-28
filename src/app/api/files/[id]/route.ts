import { db } from "@/server/db";
import { apiUser, AppError, feature, route } from "@/server/http";
import { storage } from "@/modules/storage/service";
export const GET = route(async (req) => {
  feature("storage");
  const s = await apiUser();
  const id = new URL(req.url).pathname.split("/").pop();
  const file = await db.storedFile.findFirst({
    where: { id, userId: s.user.id },
  });
  if (!file) throw new AppError(404, "File not found");
  const bytes = await storage().get(file.key);
  return new Response(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
});
export const DELETE = route(async (req) => {
  feature("storage");
  const s = await apiUser();
  const id = new URL(req.url).pathname.split("/").pop();
  const file = await db.storedFile.findFirst({
    where: { id, userId: s.user.id },
  });
  if (!file) throw new AppError(404, "File not found");
  await storage().remove(file.key);
  await db.storedFile.delete({ where: { id: file.id } });
  return Response.json({ ok: true });
}, true);
