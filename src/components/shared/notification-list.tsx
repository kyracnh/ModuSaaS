"use client";
import { useCallback, useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function NotificationList() {
  const [items, setItems] = useState<
    { id: string; title: string; readAt: string | null }[]
  >([]);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    try {
      setItems(await clientApi("/api/notifications"));
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => {
    clientApi<{ id: string; title: string; readAt: string | null }[]>(
      "/api/notifications",
    )
      .then(setItems)
      .catch((e) => setError(e.message));
  }, []);
  return (
    <Card>
      {error && <p role="alert">{error}</p>}
      {!items.length && (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      )}
      {items.map((n) => (
        <div
          key={n.id}
          className="flex items-center justify-between border-b border-border py-4 text-sm"
        >
          <span>{n.title}</span>
          {!n.readAt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                try {
                  await clientApi("/api/notifications", {
                    method: "PATCH",
                    body: JSON.stringify({ id: n.id }),
                  });
                  await load();
                } catch (e) {
                  setError((e as Error).message);
                }
              }}
            >
              Mark read
            </Button>
          )}
        </div>
      ))}
    </Card>
  );
}
