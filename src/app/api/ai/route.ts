import { z } from "zod";
import { generateText, streamText, Output, tool, stepCountIs } from "ai";
import { apiUser, AppError, body, feature, route } from "@/server/http";
import {
  aiReady,
  aiModel,
  reserveUsage,
  finishUsage,
  assistantPrompt,
} from "@/modules/ai/service";
import { db } from "@/server/db";
import { rateLimit } from "@/server/limits";
import { getEnv } from "@/config/env";
const inputSchema = z.object({
  prompt: z.string().trim().min(1).max(8000),
  conversationId: z.string().max(100).optional(),
  mode: z.enum(["chat", "text", "structured", "tools"]).default("chat"),
});
export const GET = route(async () => {
  feature("ai");
  const s = await apiUser();
  return Response.json({
    configured: aiReady(),
    model: getEnv().AI_MODEL,
    conversations: await db.conversation.findMany({
      where: { userId: s.user.id },
      take: 30,
      orderBy: { createdAt: "desc" },
      include: { messages: { orderBy: { createdAt: "asc" }, take: 40 } },
    }),
    usage: await db.aiUsage.aggregate({
      where: { userId: s.user.id },
      _sum: { inputTokens: true, outputTokens: true, estimatedCost: true },
      _count: true,
    }),
  });
});
export const POST = route(async (req) => {
  feature("ai");
  const s = await apiUser();
  await rateLimit(`ai:${s.user.id}`, 10);
  const input = await body(req, inputSchema);
  const model = await aiModel();
  let conversation = input.conversationId
    ? await db.conversation.findFirst({
        where: { id: input.conversationId, userId: s.user.id },
        include: { messages: { orderBy: { createdAt: "desc" }, take: 20 } },
      })
    : null;
  if (input.conversationId && !conversation)
    throw new AppError(404, "Conversation not found");
  const usage = await reserveUsage(s.user.id);
  try {
    if (!conversation)
      conversation = await db.conversation.create({
        data: { userId: s.user.id, title: input.prompt.slice(0, 80) },
        include: { messages: true },
      });
    const conversationId = conversation.id;
    // Bound total context, keeping the newest messages and preserving chronological order.
    const history = conversation.messages
      .slice()
      .reverse()
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content.slice(0, 8000),
      }))
      .slice(-10);
    await db.message.create({
      data: { conversationId, role: "user", content: input.prompt },
    });
    const messages = [
      ...history,
      { role: "user" as const, content: input.prompt },
    ];
    if (input.mode === "chat") {
      const result = streamText({
        model,
        system: assistantPrompt,
        messages,
        maxOutputTokens: 1000,
        maxRetries: 1,
        abortSignal: req.signal,
        onFinish: async (result) => {
          await db.message.create({
            data: { conversationId, role: "assistant", content: result.text },
          });
          await finishUsage(
            usage.id,
            result.totalUsage.inputTokens,
            result.totalUsage.outputTokens,
          );
        },
        onAbort: async () => {
          await finishUsage(usage.id, 0, 0, "aborted");
        },
        onError: async () => {
          await finishUsage(usage.id, 0, 0, "failed");
        },
      });
      return result.toTextStreamResponse({
        headers: {
          "X-Conversation-Id": conversationId,
          "Cache-Control": "no-store",
        },
      });
    }
    const output =
      input.mode === "structured"
        ? Output.object({
            schema: z.object({
              summary: z.string(),
              actions: z.array(z.string()).max(10),
            }),
          })
        : undefined;
    const result = await generateText({
      model,
      system: assistantPrompt,
      messages,
      maxOutputTokens: 1000,
      maxRetries: 1,
      stopWhen: stepCountIs(2),
      abortSignal: req.signal,
      ...(output ? { output } : {}),
      ...(input.mode === "tools"
        ? {
            tools: {
              currentTime: tool({
                description:
                  "Get the current UTC time. Read only; no external side effects.",
                inputSchema: z.object({}),
                execute: async () => ({ utc: new Date().toISOString() }),
              }),
            },
          }
        : {}),
    });
    const text =
      input.mode === "structured" ? JSON.stringify(result.output) : result.text;
    await db.message.create({
      data: { conversationId, role: "assistant", content: text },
    });
    await finishUsage(
      usage.id,
      result.totalUsage.inputTokens,
      result.totalUsage.outputTokens,
    );
    return Response.json({
      text,
      output: result.output,
      conversationId,
      usage: result.totalUsage,
    });
  } catch (e) {
    await finishUsage(
      usage.id,
      0,
      0,
      req.signal.aborted ? "aborted" : "failed",
    );
    if (e instanceof AppError) throw e;
    throw new AppError(
      502,
      "AI provider request failed. Check configuration or retry.",
    );
  }
}, true);
