import { db } from "@/server/db";
import { apiUser, AppError, feature, route, readBody } from "@/server/http";
import { appConfig } from "@/config/app";
import { storage, validateFile } from "@/modules/storage/service";
import { rateLimit } from "@/server/limits";
export const GET = route(async () => {
  feature("storage");
  const s = await apiUser();
  return Response.json(
    await db.storedFile.findMany({
      where: { userId: s.user.id },
      take: 100,
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, size: true, mime: true, createdAt: true },
    }),
  );
});
export const POST = route(async (req) => {
  feature("storage");
  const s = await apiUser();
  await rateLimit(`upload:${s.user.id}`, 10);
  const bytesWithForm = await readBody(req, appConfig.upload.maxBytes + 8192);
  const data = await new Response(bytesWithForm, {
    headers: { "Content-Type": req.headers.get("content-type") ?? "" },
  }).formData();
  const file = data.get("file");
  if (!(file instanceof File)) throw new AppError(422, "Choose a file");
  if (file.size > appConfig.upload.maxBytes)
    throw new AppError(413, "File too large");
  const bytes = Buffer.from(await file.arrayBuffer());
  validateFile(bytes, file.type);
  const key = crypto.randomUUID();
  const adapter = storage();
  await adapter.put(key, bytes, file.type);
  try {
    const saved = await db.storedFile.create({
      data: {
        userId: s.user.id,
        name: file.name.slice(0, 200).replace(/[\r\n"\/\\]/g, "_"),
        mime: file.type,
        size: file.size,
        key,
      },
    });
    return Response.json({ id: saved.id }, { status: 201 });
  } catch (e) {
    await adapter.remove(key);
    throw e;
  }
}, true);
