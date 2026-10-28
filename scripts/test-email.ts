import "dotenv/config";
import assert from "node:assert/strict";
import { request, type APIResponse } from "@playwright/test";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const base = process.env.EMAIL_TEST_URL ?? "http://localhost:3001";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const alice = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: base },
});
const bob = await request.newContext({
  baseURL: base,
  extraHTTPHeaders: { Origin: base },
});
const mail = await request.newContext({
  baseURL: process.env.MAILPIT_TEST_URL ?? "http://localhost:8025",
});
const suffix = crypto.randomUUID(),
  a = `mail-alice-${suffix}@example.com`,
  b = `mail-bob-${suffix}@example.com`;
const password = "Mail-Test-Password-2026!";
const userIds: string[] = [];
let orgId: string | undefined;
async function ok(response: APIResponse) {
  const data = (await response.json()) as {
    user: { id: string };
    id: string;
    token: string | null;
    error?: string;
    message?: string;
  };
  assert(
    response.ok(),
    `HTTP ${response.status()}: ${data.error ?? data.message ?? "request failed"}`,
  );
  return data;
}
async function link(to: string, subject: string) {
  for (let i = 0; i < 20; i++) {
    const list = (await (await mail.get("/api/v1/messages")).json()) as {
      messages: { ID: string; Subject: string; To: { Address: string }[] }[];
    };
    const m = list.messages.find(
      (m) => m.Subject === subject && m.To.some((t) => t.Address === to),
    );
    if (m) {
      const message = (await (
        await mail.get("/api/v1/message/" + m.ID)
      ).json()) as { Text: string };
      const url = message.Text.match(/https?:\/\/[^\s<>]+/)?.[0];
      assert(url, "Email has a local action link");
      return url;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Expected local email was not delivered");
}
try {
  for (const [client, email, name] of [
    [alice, a, "Mail Alice"],
    [bob, b, "Mail Bob"],
  ] as const) {
    const signup = await ok(
      await client.post("/api/auth/sign-up/email", {
        data: { name, email, password },
      }),
    );
    userIds.push(signup.user.id);
    assert.equal(signup.token, null);
    assert.equal(
      (
        await client.post("/api/auth/sign-in/email", {
          data: { email, password },
        })
      ).status(),
      403,
    );
    const verification = await link(email, "Verify your email");
    assert((await client.get(verification)).ok());
    await ok(
      await client.post("/api/auth/sign-in/email", {
        data: { email, password },
      }),
    );
  }
  console.log(
    "PASS: SMTP verification, unverified login rejection, verified login",
  );
  await ok(
    await alice.post("/api/auth/request-password-reset", {
      data: { email: a, redirectTo: base + "/reset-password" },
    }),
  );
  const resetResponse = await alice.get(await link(a, "Reset your password"));
  const reset = new URL(resetResponse.url());
  const token = reset.searchParams.get("token");
  assert(token);
  const newPassword = "Changed-Mail-Password-2026!";
  await ok(
    await alice.post("/api/auth/reset-password", {
      data: { token, newPassword },
    }),
  );
  const replay = await alice.post("/api/auth/reset-password", {
    data: { token, newPassword: password },
  });
  assert(!replay.ok(), "Reset token must not be reusable");
  await ok(
    await alice.post("/api/auth/sign-in/email", {
      data: { email: a, password: newPassword },
    }),
  );
  console.log("PASS: SMTP password reset, token replay rejection");
  orgId = (
    await ok(
      await alice.post("/api/auth/organization/create", {
        data: { name: "Mail Test Team", slug: "mail-" + suffix },
      }),
    )
  ).id;
  const invitation = await ok(
    await alice.post("/api/auth/organization/invite-member", {
      data: { organizationId: orgId, email: b, role: "member" },
    }),
  );
  const inviteUrl = await link(b, "Workspace invitation");
  assert.equal(new URL(inviteUrl).pathname.split("/").pop(), invitation.id);
  await ok(
    await bob.post("/api/auth/organization/accept-invitation", {
      data: { invitationId: invitation.id },
    }),
  );
  assert(
    await db.member.findUnique({
      where: {
        organizationId_userId: { organizationId: orgId, userId: userIds[1] },
      },
    }),
  );
  assert(
    !(
      await bob.post("/api/auth/organization/invite-member", {
        data: {
          organizationId: orgId,
          email: "other-" + suffix + "@example.com",
          role: "admin",
        },
      })
    ).ok(),
  );
  await ok(
    await alice.post("/api/auth/organization/remove-member", {
      data: { organizationId: orgId, memberIdOrEmail: b },
    }),
  );
  assert.equal(
    (await bob.get("/api/projects?organizationId=" + orgId)).status(),
    403,
  );
  console.log(
    "PASS: SMTP invitation acceptance, member invitation denial, removal revokes resource access",
  );
  const uploaded = await ok(
    await alice.post("/api/files", {
      multipart: {
        file: {
          name: "private.pdf",
          mimeType: "application/pdf",
          buffer: Buffer.from("%PDF-1.7\nPrivate test file"),
        },
      },
    }),
  );
  const download = await alice.get("/api/files/" + uploaded.id);
  assert(download.ok());
  assert.match(download.headers()["content-disposition"], /attachment/);
  assert.equal((await bob.get("/api/files/" + uploaded.id)).status(), 404);
  await ok(await alice.delete("/api/files/" + uploaded.id));
  assert.equal((await alice.get("/api/files/" + uploaded.id)).status(), 404);
  console.log(
    "PASS: private local upload/download/delete and cross-user isolation",
  );
  assert.equal(
    (await alice.post("/api/ai", { data: { prompt: "" } })).status(),
    422,
  );
  assert.equal(
    (await alice.post("/api/ai", { data: { prompt: "Hello" } })).status(),
    503,
  );
  const billing = (await (await alice.get("/api/billing")).json()) as {
    configured: boolean;
  };
  assert.equal(billing.configured, false);
  console.log("PASS: unconfigured optional providers and AI input validation");
  await ok(
    await alice.put("/api/preferences", {
      data: { emailUpdates: true, productAnnouncements: false },
    }),
  );
  const preferences = (await (await alice.get("/api/preferences")).json()) as {
    emailUpdates: boolean;
  };
  assert.equal(preferences.emailUpdates, true);
  const bobPrefs = (await (await bob.get("/api/preferences")).json()) as {
    emailUpdates: boolean;
  };
  assert.equal(bobPrefs.emailUpdates, false);
  console.log("PASS: persistent user-scoped notification preferences");
} finally {
  if (orgId) await db.organization.deleteMany({ where: { id: orgId } });
  for (const f of await db.storedFile.findMany({
    where: { userId: { in: userIds } },
  })) {
    const { unlink } = await import("node:fs/promises");
    await unlink(".data/uploads/" + f.key).catch(() => {});
  }
  await db.user.deleteMany({ where: { id: { in: userIds } } });
  await Promise.all([
    alice.dispose(),
    bob.dispose(),
    mail.dispose(),
    db.$disconnect(),
  ]);
}
