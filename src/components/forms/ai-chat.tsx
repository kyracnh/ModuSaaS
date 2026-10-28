"use client";
import { useEffect, useRef, useState } from "react";
import { Send, Square, RotateCcw, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { clientApi } from "@/lib/client-api";
type Data = {
  configured: boolean;
  model: string;
  conversations: {
    id: string;
    title: string;
    messages: { role: string; content: string }[];
  }[];
  usage: {
    _sum: {
      inputTokens: number | null;
      outputTokens: number | null;
      estimatedCost: number | null;
    };
  };
};
export function AiChat() {
  const [data, setData] = useState<Data>();
  const [id, setId] = useState<string>();
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    [],
  );
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState("chat");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const controller = useRef<AbortController | null>(null);
  useEffect(() => {
    clientApi<Data>("/api/ai")
      .then(setData)
      .catch((e) => setError(e.message));
    return () => controller.current?.abort();
  }, []);
  async function send(text: string) {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    setPrompt("");
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ]);
    controller.current = new AbortController();
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text, conversationId: id, mode }),
        signal: controller.current.signal,
      });
      if (!response.ok) throw new Error((await response.json()).error);
      if (mode === "chat") {
        setId(response.headers.get("X-Conversation-Id") ?? undefined);
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let result = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          result += decoder.decode(value, { stream: true });
          setMessages((prev) => [
            ...prev.slice(0, -1),
            { role: "assistant", content: result },
          ]);
        }
      } else {
        const result = await response.json();
        setId(result.conversationId);
        setMessages((prev) => [
          ...prev.slice(0, -1),
          { role: "assistant", content: result.text },
        ]);
      }
      setData(await clientApi("/api/ai"));
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
      <Card>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            setId(undefined);
            setMessages([]);
          }}
          disabled={busy}
        >
          <Plus size={14} />
          New conversation
        </Button>
        <div className="mt-5 space-y-2">
          {data?.conversations.map((c) => (
            <button
              key={c.id}
              disabled={busy}
              className="block w-full truncate rounded p-2 text-left text-xs hover:bg-muted"
              onClick={() => {
                setId(c.id);
                setMessages(c.messages);
              }}
            >
              {c.title}
            </button>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          {data?.model}
          <br />
          {data?.usage._sum.inputTokens ?? 0} input ·{" "}
          {data?.usage._sum.outputTokens ?? 0} output tokens
          <br />
          Estimated cost: ${(data?.usage._sum.estimatedCost ?? 0).toFixed(4)}
        </p>
      </Card>
      <Card>
        {data && !data.configured && (
          <p role="status" className="mb-5 rounded-lg bg-muted p-4 text-sm">
            AI setup required. Configure your provider key and model to start a
            conversation.
          </p>
        )}
        <div className="min-h-80 space-y-5" aria-live="polite">
          {!messages.length && (
            <div className="py-16 text-center">
              <h2 className="text-xl">Where would you like to start?</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Explore an idea, structure a plan, or ask a question.
              </p>
            </div>
          )}
          {messages.map((m, i) => (
            <article
              key={i}
              className={
                m.role === "user" ? "ml-8 rounded-lg bg-muted p-4" : "mr-8 p-4"
              }
            >
              <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">
                {m.role === "user" ? "You" : "Assistant"}
              </p>
              <p className="whitespace-pre-wrap text-sm leading-7">
                {m.content || "…"}
              </p>
            </article>
          ))}
        </div>
        {error && (
          <p role="alert" className="my-4 text-sm text-red-600">
            {error}
          </p>
        )}
        <form
          className="mt-6 space-y-3 border-t border-border pt-5"
          onSubmit={(e) => {
            e.preventDefault();
            void send(prompt);
          }}
        >
          <label className="text-xs text-muted-foreground">
            Response format{" "}
            <select
              className="ml-2"
              aria-label="Response format"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              disabled={busy}
            >
              <option value="chat">Streaming chat</option>
              <option value="text">Text</option>
              <option value="structured">Structured summary</option>
              <option value="tools">Read-only tool example</option>
            </select>
          </label>
          <Textarea
            aria-label="Prompt"
            placeholder="Describe what’s on your mind…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={8000}
            required
          />
          <div className="flex justify-end gap-2">
            {messages.length > 0 && (
              <Button
                type="button"
                variant="ghost"
                disabled={busy}
                onClick={() => {
                  const last = messages.findLast((m) => m.role === "user");
                  if (last) void send(last.content);
                }}
              >
                <RotateCcw size={14} />
                Ask again
              </Button>
            )}
            {busy ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => controller.current?.abort()}
              >
                <Square size={14} />
                Stop
              </Button>
            ) : (
              <Button disabled={!data?.configured || !prompt.trim()}>
                <Send size={14} />
                Send
              </Button>
            )}
          </div>
        </form>
        <p className="mt-4 text-xs text-muted-foreground">
          Responses may be inaccurate. Conversations are saved privately. Failed
          or cancelled requests count toward the daily request limit.
        </p>
      </Card>
    </div>
  );
}
