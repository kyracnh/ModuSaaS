import "dotenv/config";
import { beforeAll, afterAll, it, expect, vi } from "vitest";
const fixture = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_PRESET = "full";
  return { userId: "ai-fixture-" + crypto.randomUUID(), json: false };
});
vi.mock("@/modules/auth/session", () => ({
  session: async () => ({
    user: { id: fixture.userId, email: "ai-fixture@example.com" },
  }),
}));
vi.mock("@/modules/ai/service", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/ai/service")>();
  const { MockLanguageModelV4 } = await import("ai/test");
  const usage = {
    inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
    outputTokens: { total: 4, text: 4, reasoning: 0 },
  };
  return {
    ...actual,
    aiModel: async () =>
      new MockLanguageModelV4({
        doGenerate: async () => ({
          content: [
            {
              type: "text",
              text: fixture.json
                ? JSON.stringify({
                    summary: "Fixture summary",
                    actions: ["Review"],
                  })
                : "Controlled fixture answer",
            },
          ],
          finishReason: { unified: "stop", raw: "stop" },
          usage,
          warnings: [],
        }),
        doStream: async () => ({
          stream: new ReadableStream({
            start(c) {
              c.enqueue({ type: "stream-start", warnings: [] });
              c.enqueue({ type: "text-start", id: "1" });
              c.enqueue({
                type: "text-delta",
                id: "1",
                delta: "Controlled streamed answer",
              });
              c.enqueue({ type: "text-end", id: "1" });
              c.enqueue({
                type: "finish",
                finishReason: { unified: "stop", raw: "stop" },
                usage,
              });
              c.close();
            },
          }),
        }),
      }),
  };
});
import { POST } from "@/app/api/ai/route";
import { db } from "@/server/db";
function req(data: unknown) {
  return new Request("http://localhost:3000/api/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
    },
    body: JSON.stringify(data),
  });
}
beforeAll(async () => {
  await db.user.create({
    data: {
      id: fixture.userId,
      name: "AI fixture",
      email: fixture.userId + "@example.com",
    },
  });
});
afterAll(async () => {
  await db.user.deleteMany({ where: { id: fixture.userId } });
  await db.requestLimit.deleteMany({ where: { key: "ai:" + fixture.userId } });
  await db.$disconnect();
});
it("generates validated structured output and persists private messages/observed usage", async () => {
  fixture.json = true;
  const response = await POST(
    req({ prompt: "Summarize a task", mode: "structured" }),
  );
  expect(response.status).toBe(200);
  const result = (await response.json()) as {
    output: { summary: string; actions: string[] };
    conversationId: string;
  };
  expect(result.output.actions).toEqual(["Review"]);
  const conversation = await db.conversation.findUnique({
    where: { id: result.conversationId },
    include: { messages: true },
  });
  expect(conversation?.userId).toBe(fixture.userId);
  expect(conversation?.messages).toHaveLength(2);
  expect(
    (await db.aiUsage.findFirst({ where: { userId: fixture.userId } }))
      ?.inputTokens,
  ).toBe(12);
});
it("streams through the actual AI SDK and persists completed output", async () => {
  fixture.json = false;
  const response = await POST(
    req({ prompt: "Stream a response", mode: "chat" }),
  );
  expect(response.status).toBe(200);
  expect(await response.text()).toBe("Controlled streamed answer");
  const id = response.headers.get("X-Conversation-Id");
  expect(id).toBeTruthy();
  await vi.waitFor(async () =>
    expect(
      await db.message.count({
        where: { conversationId: id!, role: "assistant" },
      }),
    ).toBe(1),
  );
});
it("validates prompts and rejects conversation identifiers belonging to another user", async () => {
  expect((await POST(req({ prompt: "" }))).status).toBe(422);
  expect(
    (
      await POST(
        req({ prompt: "Hello", conversationId: "someone-elses-conversation" }),
      )
    ).status,
  ).toBe(404);
});
