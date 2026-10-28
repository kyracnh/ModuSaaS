"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/modules/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
export function RecoveryForm({ reset = false }: { reset?: boolean }) {
  const params = useSearchParams();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form
      className="mt-6 space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        const data = new FormData(e.currentTarget);
        try {
          const result = reset
            ? await authClient.resetPassword({
                newPassword: String(data.get("password")),
                token: params.get("token") ?? "",
              })
            : await authClient.requestPasswordReset({
                email: String(data.get("email")),
                redirectTo: "/reset-password",
              });
          setMessage(
            result.error?.message ??
              (reset
                ? "Password updated. You can now sign in."
                : "If an account exists, a reset email has been sent."),
          );
        } catch {
          setMessage("Unable to complete request. Try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field>
        <FieldLabel htmlFor="recovery">
          {reset ? "New password" : "Email address"}
        </FieldLabel>
        <Input
          id="recovery"
          name={reset ? "password" : "email"}
          type={reset ? "password" : "email"}
          minLength={reset ? 12 : undefined}
          required
          autoComplete={reset ? "new-password" : "email"}
        />
      </Field>
      <Button disabled={busy}>
        {reset ? "Reset password" : "Send reset link"}
      </Button>
      {message && (
        <p role="status" className="text-sm">
          {message}
        </p>
      )}
    </form>
  );
}
