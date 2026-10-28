import "dotenv/config";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { request, type APIRequestContext } from "@playwright/test";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const password = "Correct-Horse-Battery-42!";
const suffix = crypto.randomUUID();
let alice: APIRequestContext, bob: APIRequestContext;
let aliceId: string, bobId: string;
let projectId: string, orgId: string;
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function json(r: Awaited<ReturnType<APIRequestContext["post"]>>) {
  const d = (await r.json()) as {
    user: { id: string; name: string };
    id: string;
    items: { id: string; status: string }[];
  };
  expect(r.ok(), JSON.stringify(d)).toBe(true);
  return d;
}
beforeAll(async () => {
  alice = await request.newContext({
    baseURL: base,
    extraHTTPHeaders: { Origin: base },
  });
  bob = await request.newContext({
    baseURL: base,
    extraHTTPHeaders: { Origin: base },
  });
  aliceId = (
    await json(
      await alice.post("/api/auth/sign-up/email", {
        data: {
          name: "Alice Test",
          email: `alice-${suffix}@example.com`,
          password,
        },
      }),
    )
  ).user.id;
  bobId = (
    await json(
      await bob.post("/api/auth/sign-up/email", {
        data: {
          name: "Bob Test",
          email: `bob-${suffix}@example.com`,
          password,
        },
      }),
    )
  ).user.id;
});
beforeAll(async () => {
  if (!(await db.user.findUnique({ where: { id: aliceId } })))
    throw new Error(
      "TEST_BASE_URL and DATABASE_URL must refer to the same isolated application database",
    );
});
afterAll(async () => {
  if (orgId) await db.organization.deleteMany({ where: { id: orgId } });
  await db.user.deleteMany({
    where: { id: { in: [aliceId, bobId].filter(Boolean) } },
  });
  await alice?.dispose();
  await bob?.dispose();
  await db.$disconnect();
});
describe("real HTTP + PostgreSQL foundation", () => {
  it("connects to database and protects unauthenticated operations", async () => {
    const anon = await request.newContext({ baseURL: base });
    expect((await anon.get("/api/health")).ok()).toBe(true);
    expect((await anon.get("/api/projects")).status()).toBe(401);
    const dash = await anon.get("/dashboard", { maxRedirects: 0 });
    expect(dash.status()).toBe(307);
    await anon.dispose();
  });
  it("persists a project and prevents another user reading or mutating it", async () => {
    const created = await json(
      await alice.post("/api/projects", {
        data: {
          name: "Integration project",
          description: "Persists in PostgreSQL",
        },
      }),
    );
    projectId = created.id;
    expect(
      (await json(await alice.get("/api/projects"))).items.some(
        (p: { id: string }) => p.id === projectId,
      ),
    ).toBe(true);
    expect(
      (await json(await bob.get("/api/projects"))).items.some(
        (p: { id: string }) => p.id === projectId,
      ),
    ).toBe(false);
    expect(
      (
        await bob.patch("/api/projects", {
          data: { id: projectId, name: "Stolen", status: "active" },
        })
      ).status(),
    ).toBe(404);
    expect(
      (await bob.delete("/api/projects", { data: { id: projectId } })).status(),
    ).toBe(404);
  });
  it("validates mutations server-side and rejects CSRF", async () => {
    expect(
      (await alice.post("/api/projects", { data: { name: "x" } })).status(),
    ).toBe(422);
    expect(
      (
        await alice.post("/api/projects", {
          data: { name: "Forged" },
          headers: { Origin: "https://evil.example" },
        })
      ).status(),
    ).toBe(403);
  });
  it("edits, searches, and deletes a real resource", async () => {
    await json(
      await alice.patch("/api/projects", {
        data: {
          id: projectId,
          name: "Renamed project",
          status: "completed",
          description: "Edited",
        },
      }),
    );
    const data = await json(
      await alice.get("/api/projects?search=Renamed&status=completed"),
    );
    expect(data.items[0].id).toBe(projectId);
    expect(data.items[0].status).toBe("completed");
    await json(
      await alice.delete("/api/projects", { data: { id: projectId } }),
    );
    expect(
      await db.project.findUnique({ where: { id: projectId } }),
    ).toBeNull();
  });
  it("isolates organizations and enforces member write permissions", async () => {
    const org = await json(
      await alice.post("/api/auth/organization/create", {
        data: { name: "Integration workspace", slug: "test-" + suffix },
      }),
    );
    orgId = org.id;
    const p = await json(
      await alice.post("/api/projects?organizationId=" + orgId, {
        data: { name: "Private team project" },
      }),
    );
    expect(
      (await bob.get("/api/projects?organizationId=" + orgId)).status(),
    ).toBe(403);
    await db.member.create({
      data: {
        id: crypto.randomUUID(),
        userId: bobId,
        organizationId: orgId,
        role: "member",
      },
    });
    expect(
      (await json(await bob.get("/api/projects?organizationId=" + orgId)))
        .items[0].id,
    ).toBe(p.id);
    expect(
      (
        await bob.patch("/api/projects?organizationId=" + orgId, {
          data: { id: p.id, name: "Member overwrite" },
        })
      ).status(),
    ).toBe(403);
  });
  it("updates a profile and rejects wrong-password login", async () => {
    await json(
      await alice.post("/api/auth/update-user", {
        data: { name: "Alice Updated" },
      }),
    );
    expect(
      (await json(await alice.get("/api/auth/get-session"))).user.name,
    ).toBe("Alice Updated");
    expect(
      (
        await bob.post("/api/auth/sign-in/email", {
          data: {
            email: `bob-${suffix}@example.com`,
            password: "incorrect-password",
          },
        })
      ).ok(),
    ).toBe(false);
  });
  it("enforces database-coordinated project limits under concurrency", async () => {
    const responses = await Promise.all(
      Array.from({ length: 8 }, (_, i) =>
        bob.post("/api/projects", { data: { name: "Quota " + i } }),
      ),
    );
    expect(responses.filter((r) => r.status() === 201)).toHaveLength(5);
    expect(responses.filter((r) => r.status() === 403)).toHaveLength(3);
    expect(
      await db.project.count({
        where: { userId: bobId, organizationId: null },
      }),
    ).toBe(5);
  });
  it("hides disabled modules from direct API access", async () => {
    expect((await alice.get("/api/billing")).status()).toBe(404);
    expect(
      (await alice.post("/api/ai", { data: { prompt: "Hi" } })).status(),
    ).toBe(404);
  });
  it("logs out and revokes the active session", async () => {
    await json(await alice.post("/api/auth/sign-out", { data: {} }));
    expect((await alice.get("/api/projects")).status()).toBe(401);
  });
});
