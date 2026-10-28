import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { session } from "@/modules/auth/session";
import { appConfig } from "@/config/app";
export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function apiUser() {
  const s = await session();
  if (!s) throw new AppError(401, "Sign in to continue");
  return s;
}
export function feature(name: keyof typeof appConfig.features) {
  if (!appConfig.features[name]) throw new AppError(404, "Module disabled");
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected = process.env.BETTER_AUTH_URL;
  if (!origin || !expected || origin !== new URL(expected).origin)
    throw new AppError(403, "Invalid request origin");
}
export async function readBody(req: Request, maxBytes: number) {
  const reader = req.body?.getReader();
  if (!reader) return Buffer.alloc(0);
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) {
      await reader.cancel();
      throw new AppError(413, "Request too large");
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}
export async function body<T extends z.ZodType>(
  req: Request,
  schema: T,
): Promise<z.output<T>> {
  const text = (await readBody(req, 32768)).toString("utf8");
  let v: unknown;
  try {
    v = JSON.parse(text);
  } catch {
    throw new AppError(400, "Invalid JSON");
  }
  return schema.parse(v);
}

export function route(
  fn: (req: Request) => Promise<Response>,
  mutating = false,
) {
  return async (req: Request) => {
    const id = crypto.randomUUID();
    try {
      if (mutating) sameOrigin(req);
      const response = await fn(req);
      response.headers.set("X-Request-Id", id);
      return response;
    } catch (e) {
      const status =
        e instanceof AppError ? e.status : e instanceof z.ZodError ? 422 : 500;
      const message =
        e instanceof AppError
          ? e.message
          : e instanceof z.ZodError
            ? e.issues
                .map((i) => i.path.join(".") + ": " + i.message)
                .join("; ")
            : "Something went wrong";
      if (status === 500)
        console.error(
          JSON.stringify({
            level: "error",
            requestId: id,
            type: e instanceof Error ? e.name : "UnknownError",
          }),
        );
      return NextResponse.json({ error: message, requestId: id }, { status });
    }
  };
}
