"use client";
import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
export function BillingPanel() {
  const [data, setData] = useState<{
    configured: boolean;
    subscription: {
      status: string;
      plan: string;
      cancelAtPeriodEnd: boolean;
    } | null;
  }>();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    clientApi<typeof data>("/api/billing")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  async function go(action: string, interval = "monthly") {
    setBusy(true);
    try {
      const d = await clientApi<{ url: string }>("/api/billing", {
        method: "POST",
        body: JSON.stringify({ action, interval }),
      });
      window.location.assign(d.url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  return (
    <Card className="max-w-2xl">
      <h2 className="text-xl">{data?.subscription?.plan ?? "free"} plan</h2>
      <p className="my-4 text-sm text-muted-foreground">
        Status: {data?.subscription?.status ?? "No subscription"}
        {data?.subscription?.cancelAtPeriodEnd
          ? " · Cancels at period end"
          : ""}
      </p>
      {data && !data.configured && (
        <p role="status" className="my-5 text-sm">
          Billing setup required: configure Stripe and monthly/yearly price IDs.
        </p>
      )}
      {error && (
        <p role="alert" className="my-3 text-red-600">
          {error}
        </p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          disabled={busy || !data?.configured}
          onClick={() => go("checkout")}
        >
          Subscribe monthly
        </Button>
        <Button
          disabled={busy || !data?.configured}
          onClick={() => go("checkout", "yearly")}
        >
          Subscribe yearly
        </Button>
        <Button
          variant="outline"
          disabled={busy || !data?.subscription}
          onClick={() => go("portal")}
        >
          Manage billing & invoices
        </Button>
      </div>
      <p className="mt-5 text-xs text-muted-foreground">
        Entitlements update only after verified provider confirmation. Returning
        from checkout does not confirm a payment.
      </p>
    </Card>
  );
}
