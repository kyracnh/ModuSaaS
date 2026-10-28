"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { preferencesSchema } from "@/modules/settings/schema";
import { clientApi } from "@/lib/client-api";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
export function PreferencesForm() {
  const form = useForm({
    resolver: zodResolver(preferencesSchema),
    defaultValues: { emailUpdates: false, productAnnouncements: false },
  });
  const [error, setError] = useState("");
  const { reset } = form;
  useEffect(() => {
    clientApi<{ emailUpdates: boolean; productAnnouncements: boolean }>(
      "/api/preferences",
    )
      .then(reset)
      .catch((e) => setError(e.message));
  }, [reset]);
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        try {
          await clientApi("/api/preferences", {
            method: "PUT",
            body: JSON.stringify(values),
          });
          toast.success("Preferences saved");
        } catch (e) {
          setError((e as Error).message);
        }
      })}
    >
      {(["emailUpdates", "productAnnouncements"] as const).map((key) => (
        <label key={key} className="flex items-center gap-3 text-sm">
          <input type="checkbox" {...form.register(key)} />
          {key === "emailUpdates"
            ? "Email activity summaries"
            : "Product announcements"}
        </label>
      ))}
      <p className="text-xs text-muted-foreground">
        Preferences are stored for your product to consume. No automated
        campaigns are scheduled.
      </p>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button variant="outline" disabled={form.formState.isSubmitting}>
        Save preferences
      </Button>
    </form>
  );
}
