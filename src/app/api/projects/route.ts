import { z } from "zod";
import { apiUser, body, route } from "@/server/http";
import {
  listProjects,
  createProject,
  changeProject,
} from "@/modules/projects/service";
import { projectSchema } from "@/modules/projects/schema";
import { rateLimit } from "@/server/limits";
function scope(req: Request) {
  return new URL(req.url).searchParams.get("organizationId");
}
export const GET = route(async (req) => {
  const s = await apiUser();
  return Response.json(
    await listProjects(s.user.id, scope(req), new URL(req.url).searchParams),
  );
});
export const POST = route(async (req) => {
  const s = await apiUser();
  await rateLimit(`project:${s.user.id}`, 30);
  return Response.json(
    await createProject(s.user.id, await body(req, projectSchema), scope(req)),
    { status: 201 },
  );
}, true);
export const PATCH = route(async (req) => {
  const s = await apiUser();
  const input = await body(
    req,
    projectSchema.extend({ id: projectSchema.shape.name }),
  );
  const { id, ...values } = input;
  await changeProject(s.user.id, id, values, scope(req));
  return Response.json({ ok: true });
}, true);
export const DELETE = route(async (req) => {
  const s = await apiUser();
  const { id } = await body(req, z.object({ id: z.string().min(1).max(100) }));
  await changeProject(s.user.id, id, undefined, scope(req));
  return Response.json({ ok: true });
}, true);
